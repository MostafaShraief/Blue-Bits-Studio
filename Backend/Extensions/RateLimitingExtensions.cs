using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace BlueBits.Api.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var rateLimitConfig = configuration.GetSection("RateLimiting");
        var windowSeconds = rateLimitConfig.GetValue<int>("WindowSeconds");
        var queueLimit = rateLimitConfig.GetValue<int>("QueueLimit");
        var unauthenticatedLimit = rateLimitConfig.GetValue<int>("UnauthenticatedPermitLimit");
        var readLimit = rateLimitConfig.GetValue<int>("ReadLimit");
        var writeLimit = rateLimitConfig.GetValue<int>("WriteLimit");
        var adminLimit = rateLimitConfig.GetValue<int>("AdminLimit");
        var loginLimit = rateLimitConfig.GetValue<int>("LoginLimit");

        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                var path = context.Request.Path.Value;
                var method = context.Request.Method;

                if (!string.IsNullOrEmpty(path) &&
                    (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) ||
                     path.StartsWith("/health", StringComparison.OrdinalIgnoreCase)))
                {
                    return RateLimitPartition.GetNoLimiter(string.Empty);
                }

                var partitionKey = ExtractPartitionKey(context);
                var permitLimit = ResolvePermitLimit(path, method, readLimit, writeLimit, adminLimit, loginLimit);

                var isAuthenticated = partitionKey.Item2;
                var key = isAuthenticated ? partitionKey.Item1 : context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var effectiveLimit = isAuthenticated ? permitLimit : Math.Min(permitLimit, unauthenticatedLimit);

                return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = effectiveLimit,
                    Window = TimeSpan.FromSeconds(windowSeconds),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = queueLimit
                });
            });

            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = (context, cancellationToken) =>
            {
                context.HttpContext.Response.Headers.RetryAfter = windowSeconds.ToString();
                context.HttpContext.Response.ContentType = "application/json";
                var body = new { error = "Too many requests. Please try again later.", statusCode = 429 };
                return new ValueTask(context.HttpContext.Response.WriteAsJsonAsync(body, cancellationToken));
            };
        });

        return services;
    }

    private static (string, bool) ExtractPartitionKey(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return ("anonymous", false);

        var token = authHeader["Bearer ".Length..].Trim();
        try
        {
            var parts = token.Split('.');
            if (parts.Length < 2) return ("anonymous", false);

            var jsonBytes = Base64UrlDecode(parts[1]);
            var json = Encoding.UTF8.GetString(jsonBytes);
            var claims = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);

            if (claims == null) return ("anonymous", false);

            if (claims.TryGetValue("nameid", out var nameid))
                return (nameid.GetString() ?? "anonymous", true);

            if (claims.TryGetValue("sub", out var sub))
                return (sub.GetString() ?? "anonymous", true);

            return ("anonymous", false);
        }
        catch
        {
            return ("anonymous", false);
        }
    }

    private static int ResolvePermitLimit(string? path, string method, int readLimit, int writeLimit, int adminLimit, int loginLimit)
    {
        if (string.IsNullOrEmpty(path))
            return readLimit;

        if (path.StartsWith("/api/admin", StringComparison.OrdinalIgnoreCase))
            return adminLimit;

        if (path.Equals("/api/auth/login", StringComparison.OrdinalIgnoreCase))
            return loginLimit;

        if (path.StartsWith("/api/auth/me", StringComparison.OrdinalIgnoreCase))
            return readLimit;

        if (path.StartsWith("/api/materials", StringComparison.OrdinalIgnoreCase))
            return readLimit;

        if (path.StartsWith("/api/prompts/compile", StringComparison.OrdinalIgnoreCase))
            return writeLimit;

        if (path.StartsWith("/api/pandoc", StringComparison.OrdinalIgnoreCase))
            return writeLimit;

        if (path.StartsWith("/api/merge", StringComparison.OrdinalIgnoreCase))
            return writeLimit;

        if (path.StartsWith("/api/sessions", StringComparison.OrdinalIgnoreCase))
        {
            if (method.Equals("GET", StringComparison.OrdinalIgnoreCase))
                return readLimit;

            return writeLimit;
        }

        if (path.StartsWith("/api/prompts", StringComparison.OrdinalIgnoreCase))
            return readLimit;

        return readLimit;
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = (input.Length % 4) switch
        {
            2 => input + "==",
            3 => input + "=",
            _ => input
        };
        return Convert.FromBase64String(padded.Replace('-', '+').Replace('_', '/'));
    }
}
