using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace BlueBits.Api.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                var path = context.Request.Path.Value;

                if (!string.IsNullOrEmpty(path) &&
                    (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) ||
                     path.StartsWith("/health", StringComparison.OrdinalIgnoreCase)))
                {
                    return RateLimitPartition.GetNoLimiter(string.Empty);
                }

                var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromSeconds(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0
                });
            });

            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = (context, cancellationToken) =>
            {
                context.HttpContext.Response.Headers.RetryAfter = "1";
                context.HttpContext.Response.ContentType = "application/json";
                var body = new { error = "Too many requests. Please try again later.", statusCode = 429 };
                return new ValueTask(context.HttpContext.Response.WriteAsJsonAsync(body, cancellationToken));
            };
        });

        return services;
    }
}
