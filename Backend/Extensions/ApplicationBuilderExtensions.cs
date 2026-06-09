using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using System.Data.Common;
using System.Reflection;
using Microsoft.Extensions.FileProviders;

namespace BlueBits.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    private const string ExpectedMigrationId = "20260606223607_InitialCreate";
    private const string MigrationProductVersion = "9.0.1";

    public static async Task<WebApplication> EnsureDatabaseCreatedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            // 1. Check if we need to baseline a legacy database
            //    Also fixes stale migration IDs and missing triggers from pre-migration DBs
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

        // 3. Ensure MaxSessionsPerUser column exists on pre-migration databases
        await EnsureSessionLimitsColumnAsync(db, logger);

        // 4. Seed session limits from configuration (runtime override, not schema)
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
                    command.CommandText = $@"
                        INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"") 
                        VALUES ('{ExpectedMigrationId}', '{MigrationProductVersion}');";
                    await command.ExecuteNonQueryAsync();

                    await CreatePruneTriggerAsync(command);
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
        else
        {
            // __EFMigrationsHistory exists — check if migration ID is stale
            // (e.g. a previous migration was generated with a different timestamp)
            command.CommandText = @"
                SELECT COUNT(*) FROM ""__EFMigrationsHistory""
                WHERE ""MigrationId"" = @expectedId;";
            var expectedParam = command.CreateParameter();
            expectedParam.ParameterName = "@expectedId";
            expectedParam.Value = ExpectedMigrationId;
            command.Parameters.Add(expectedParam);

            var hasCorrectId = (long)(await command.ExecuteScalarAsync() ?? 0) > 0;

            if (!hasCorrectId)
            {
                logger.LogWarning("Migration ID mismatch detected. Updating to {ExpectedId}.", ExpectedMigrationId);
                command.CommandText = @"
                    UPDATE ""__EFMigrationsHistory""
                    SET ""MigrationId"" = @newId,
                        ""ProductVersion"" = @productVersion;";
                var newIdParam = command.CreateParameter();
                newIdParam.ParameterName = "@newId";
                newIdParam.Value = ExpectedMigrationId;
                command.Parameters.Add(newIdParam);
                var verParam = command.CreateParameter();
                verParam.ParameterName = "@productVersion";
                verParam.Value = MigrationProductVersion;
                command.Parameters.Add(verParam);
                await command.ExecuteNonQueryAsync();
            }

            command.Parameters.Clear();
        }

        // Always ensure the prune trigger exists
        // (pre-migration databases won't have it, and migration may have been skipped)
        await CreatePruneTriggerAsync(command);
    }

    private static async Task CreatePruneTriggerAsync(DbCommand command)
    {
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
    }

    private static async Task EnsureSessionLimitsColumnAsync(BlueBitsDbContext db, ILogger logger)
    {
        using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();

        command.CommandText = @"
            SELECT COUNT(*) FROM pragma_table_info('Workflows')
            WHERE name = 'MaxSessionsPerUser';";
        var hasColumn = (long)(await command.ExecuteScalarAsync() ?? 0) > 0;

        if (!hasColumn)
        {
            logger.LogWarning("Pre-migration database missing MaxSessionsPerUser column. Adding it...");
            command.CommandText = @"
                ALTER TABLE ""Workflows""
                ADD COLUMN ""MaxSessionsPerUser"" INTEGER NOT NULL DEFAULT 5;";
            await command.ExecuteNonQueryAsync();
            logger.LogInformation("MaxSessionsPerUser column added to existing database.");
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
