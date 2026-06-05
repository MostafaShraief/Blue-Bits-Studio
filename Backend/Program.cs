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

    app.UseSwaggerWithUI();
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    await app.MigrateDatabaseAsync();
    app.UseRateLimiter();
    app.UseCors("AllowFrontend");
    app.UseResponseCompression();
    app.UseAuthentication();
    app.UseAuthorization();
    app.ServeUploadedFiles();
    app.UseSerilogRequestLogging();
    app.MapControllers();
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
