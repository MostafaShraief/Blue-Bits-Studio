using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using System.Data.Common;
using Microsoft.Extensions.FileProviders;

namespace BlueBits.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static async Task<WebApplication> EnsureDatabaseCreatedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            // 1. Check if we need to baseline a legacy database
            await EnsureBaselinedAsync(db, logger);

            // 2. Apply migrations (this creates fresh DBs, or skips InitialCreate on legacy DBs)
            await db.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to apply database migrations.");
            throw;
        }

        // 3. Seed session limits from configuration (runtime override, not schema)
        var sessionLimits = configuration.GetSection("SessionLimits").Get<Dictionary<string, int>>();
        if (sessionLimits != null)
        {
            foreach (var workflow in db.Workflows)
            {
                if (sessionLimits.TryGetValue(workflow.SystemCode, out var limit) && workflow.MaxSessionsPerUser != limit)
                {
                    workflow.MaxSessionsPerUser = limit;
                }
            }
            await db.SaveChangesAsync();
            logger.LogInformation("Session limits seeded from configuration successfully.");
        }

        return app;
    }

    private static async Task EnsureBaselinedAsync(BlueBitsDbContext db, ILogger logger)
    {
        using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = connection.CreateCommand();

        // Check if __EFMigrationsHistory table already exists
        command.CommandText = @"
            SELECT COUNT(*) FROM sqlite_master 
            WHERE type='table' AND name='__EFMigrationsHistory';";
        var hasHistoryTable = (long)(await command.ExecuteScalarAsync() ?? 0) > 0;

        if (!hasHistoryTable)
        {
            // Check if legacy database tables exist (using 'Users' as our anchor table)
            command.CommandText = @"
                SELECT COUNT(*) FROM sqlite_master 
                WHERE type='table' AND name='Users';";
            var hasUsersTable = (long)(await command.ExecuteScalarAsync() ?? 0) > 0;

            if (hasUsersTable)
            {
                logger.LogWarning("Legacy database detected without migration history. Baselining database...");

                using var transaction = await connection.BeginTransactionAsync();
                command.Transaction = transaction;
                try
                {
                    // Create the EFMigrationsHistory table
                    command.CommandText = @"
                        CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                            ""MigrationId"" TEXT NOT NULL PRIMARY KEY,
                            ""ProductVersion"" TEXT NOT NULL
                        );";
                    await command.ExecuteNonQueryAsync();

                    // Insert the InitialCreate migration record so EF Core knows to skip it
                    command.CommandText = @"
                        INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"") 
                        VALUES ('20260606223607_InitialCreate', '9.0.1');";
                    await command.ExecuteNonQueryAsync();

                    // Ensure the SQLite trigger exists or is updated for safety
                    command.CommandText = @"
                        DROP TRIGGER IF EXISTS ""TRG_PruneSessionData"";
                        CREATE TRIGGER ""TRG_PruneSessionData""
                        AFTER INSERT ON ""Sessions""
                        BEGIN
                            DELETE FROM ""Files"" WHERE ""SessionId"" IN (
                                SELECT ""SessionId"" FROM ""Sessions""
                                WHERE ""UserId"" = NEW.""UserId"" AND ""WorkflowId"" = NEW.""WorkflowId""
                                ORDER BY ""CreatedAt"" DESC
                                LIMIT -1 OFFSET (
                                    SELECT COALESCE(""MaxSessionsPerUser"", 5) FROM ""Workflows"" WHERE ""WorkflowId"" = NEW.""WorkflowId""
                                )
                            );
                            DELETE FROM ""Notes"" WHERE ""SessionId"" IN (
                                SELECT ""SessionId"" FROM ""Sessions""
                                WHERE ""UserId"" = NEW.""UserId"" AND ""WorkflowId"" = NEW.""WorkflowId""
                                ORDER BY ""CreatedAt"" DESC
                                LIMIT -1 OFFSET (
                                    SELECT COALESCE(""MaxSessionsPerUser"", 5) FROM ""Workflows"" WHERE ""WorkflowId"" = NEW.""WorkflowId""
                                )
                            );
                            DELETE FROM ""SessionContents"" WHERE ""SessionId"" IN (
                                SELECT ""SessionId"" FROM ""Sessions""
                                WHERE ""UserId"" = NEW.""UserId"" AND ""WorkflowId"" = NEW.""WorkflowId""
                                ORDER BY ""CreatedAt"" DESC
                                LIMIT -1 OFFSET (
                                    SELECT COALESCE(""MaxSessionsPerUser"", 5) FROM ""Workflows"" WHERE ""WorkflowId"" = NEW.""WorkflowId""
                                )
                            );
                        END;";
                    await command.ExecuteNonQueryAsync();

                    await transaction.CommitAsync();
                    logger.LogInformation("Database baselined successfully. Legacies protected.");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    logger.LogError(ex, "Failed to baseline legacy database.");
                    throw;
                }
            }
        }
    }

    public static WebApplication ServeUploadedFiles(this WebApplication app)
    {
        var uploadPath = Path.Join(app.Environment.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(uploadPath),
            RequestPath = "/uploads"
        });

        return app;
    }
}
