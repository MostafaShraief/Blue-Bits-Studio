using BlueBits.Api.Data;
using Microsoft.Extensions.FileProviders;

namespace BlueBits.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication EnsureDatabaseCreated(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
        db.Database.EnsureCreated();
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
