using BlueBits.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

namespace BlueBits.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static async Task<WebApplication> MigrateDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();

        // Check if we're transitioning from EnsureCreated (tables exist, no migration history).
        // Probe the history table first.
        var historyExists = false;
        try
        {
            db.Database.ExecuteSqlRaw("SELECT 1 FROM \"__EFMigrationsHistory\" LIMIT 1");
            historyExists = true;
        }
        catch { }

        if (!historyExists)
        {
            // No history table. Check if the DB has actual data tables (EnsureCreated path).
            var tablesExist = false;
            try
            {
                db.Database.ExecuteSqlRaw("SELECT 1 FROM \"Materials\" LIMIT 1");
                tablesExist = true;
            }
            catch { }

            if (tablesExist)
            {
                // Transition from EnsureCreated: seed the initial migration as already applied
                // so MigrateAsync() only applies future migrations.
                db.Database.ExecuteSqlRaw(
                    "CREATE TABLE IF NOT EXISTS \"__EFMigrationsHistory\" (\"MigrationId\" TEXT NOT NULL, \"ProductVersion\" TEXT NOT NULL)");
                db.Database.ExecuteSqlRaw(
                    "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1})",
                    "20260605215747_InitialCreate", "9.0.1");
            }
        }

        await db.Database.MigrateAsync();
        return app;
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
