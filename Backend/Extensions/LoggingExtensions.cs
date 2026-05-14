using Serilog;

namespace BlueBits.Api.Extensions;

public static class LoggingExtensions
{
    public static IHostBuilder UseSerilogLogging(this IHostBuilder hostBuilder, WebApplicationBuilder webBuilder)
    {
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()
            .CreateBootstrapLogger();

        hostBuilder.UseSerilog((context, services, configuration) =>
            configuration.ReadFrom.Configuration(context.Configuration));

        return hostBuilder;
    }
}
