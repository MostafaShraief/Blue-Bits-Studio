using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using FluentValidation;
using BlueBits.Api.Exceptions;

namespace BlueBits.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (NotFoundException ex)
        {
            await HandleNotFoundExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleGenericExceptionAsync(context, ex);
        }
    }

    public async Task HandleValidationExceptionAsync(HttpContext context, ValidationException ex)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "N/A";
        var systemCode = ExtractSystemCode(context);
        var sessionId = ExtractSessionId(context);
        var path = context.Request.Path;

        _logger.LogWarning(ex,
            "Validation failed - UserID: {UserId}, SystemCode: {SystemCode}, SessionID: {SessionId}, Path: {Path}",
            userId, systemCode, sessionId, path);

        var errors = ex.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        var response = new
        {
            error = "Validation failed",
            statusCode = StatusCodes.Status400BadRequest,
            traceId,
            errors
        };

        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    public async Task HandleNotFoundExceptionAsync(HttpContext context, NotFoundException ex)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "N/A";
        var systemCode = ExtractSystemCode(context);
        var sessionId = ExtractSessionId(context);
        var path = context.Request.Path;

        _logger.LogWarning(ex,
            "Resource not found - UserID: {UserId}, SystemCode: {SystemCode}, SessionID: {SessionId}, Path: {Path}",
            userId, systemCode, sessionId, path);

        var response = new
        {
            error = ex.Message,
            statusCode = StatusCodes.Status404NotFound,
            traceId
        };

        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    public async Task HandleGenericExceptionAsync(HttpContext context, Exception ex)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "N/A";
        var systemCode = ExtractSystemCode(context);
        var sessionId = ExtractSessionId(context);
        var path = context.Request.Path;

        _logger.LogError(ex,
            "Unhandled exception - UserID: {UserId}, SystemCode: {SystemCode}, SessionID: {SessionId}, Path: {Path}",
            userId, systemCode, sessionId, path);

        var response = new
        {
            error = "An unexpected error occurred",
            statusCode = StatusCodes.Status500InternalServerError,
            traceId
        };

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static string ExtractSystemCode(HttpContext context)
    {
        return context.Request.RouteValues.TryGetValue("systemCode", out var sv) ? sv?.ToString() ?? "N/A"
             : context.Request.Query.TryGetValue("systemCode", out var sq) ? sq.FirstOrDefault() ?? "N/A"
             : context.Request.Query.TryGetValue("workflowSystemCode", out var wsq) ? wsq.FirstOrDefault() ?? "N/A"
             : "N/A";
    }

    private static string ExtractSessionId(HttpContext context)
    {
        return context.Request.RouteValues.TryGetValue("id", out var idv) ? idv?.ToString() ?? "N/A"
             : context.Request.RouteValues.TryGetValue("sessionId", out var sv) ? sv?.ToString() ?? "N/A"
             : context.Request.Query.TryGetValue("sessionId", out var qv) ? qv.FirstOrDefault() ?? "N/A"
             : "N/A";
    }
}
