using FluentValidation;
using BlueBits.Api.Services;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Endpoints;

public static class PandocEndpoints
{
    public static RouteGroupBuilder MapPandocEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/generate", async (GenerateDocxRequest req, PandocQueueService pandocQueue, IWebHostEnvironment env, IValidator<GenerateDocxRequest> validator, HttpContext httpContext) =>
        {
            var validationResult = await validator.ValidateAsync(req);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                return Results.BadRequest(new { error = "بيانات غير صالحة", errors });
            }

            var result = await pandocQueue.EnqueueGenerateDocxAsync(
                req.MarkdownText,
                req.TemplateName,
                req.MaterialName,
                req.Type,
                req.LectureNumber,
                env.ContentRootPath,
                req.IsSinglePage,
                httpContext.RequestAborted);

            if (!result.Success)
            {
                return Results.BadRequest(new { error = result.Error, details = result.Details });
            }

            return Results.Ok(new { fileUrl = result.FileUrl });
        });

        return group;
    }
}
