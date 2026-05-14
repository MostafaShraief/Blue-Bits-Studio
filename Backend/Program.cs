using BlueBits.Api.Data;
using BlueBits.Api.Endpoints;
using BlueBits.Api.Extensions;
using BlueBits.Api.Middleware;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, config) =>
        config.ReadFrom.Configuration(context.Configuration));

    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddPersistence(builder.Configuration, builder.Environment);
    builder.Services.AddApplicationServices();
    builder.Services.AddAuthLayer(builder.Configuration);
    builder.Services.AddApiLayer();

    var app = builder.Build();

    // Configure Swagger UI at /swagger
    app.UseSwaggerWithUI();

    // Global exception handling middleware — must be early in pipeline
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    // Ensure database is created and migrations applied
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
        db.Database.EnsureCreated();
    }

    // app.UseHttpsRedirection();
    // Commented to allow HTTP connections from frontend dev server

    app.UseCors("AllowFrontend");

    app.UseResponseCompression();

    app.UseRateLimiter();

    app.UseAuthentication();
    app.UseAuthorization();

    // Serve static files for uploaded images
    var uploadPath = Path.Join(app.Environment.ContentRootPath, "uploads");
    if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadPath),
        RequestPath = "/uploads"
    });

    app.MapControllers();

    // Map Minimal Endpoints and Secure Them with WorkflowPolicy (excludes Admin)
    app.MapGroup("/api/pandoc").MapPandocEndpoints().RequireAuthorization("WorkflowPolicy");

    app.MapGroup("/api/merge").MapMergeEndpoints().RequireAuthorization("WorkflowPolicy");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
