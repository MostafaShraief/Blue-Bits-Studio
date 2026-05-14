using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Endpoints;

public static class PandocEndpoints
{
    public static RouteGroupBuilder MapPandocEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/generate", async (GenerateDocxRequest req, IPandocService pandocService, IWebHostEnvironment env) =>
        {
            var result = await pandocService.GenerateDocxAsync(
                req.MarkdownText,
                req.TemplateName,
                req.MaterialName,
                req.Type,
                req.LectureNumber,
                env.ContentRootPath);

            if (!result.Success)
            {
                return Results.BadRequest(new { error = result.Error, details = result.Details });
            }

            return Results.Ok(new { fileUrl = result.FileUrl });
        });

        return group;
    }
}

public class GenerateDocxRequest
{
    public string MarkdownText { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string LectureNumber { get; set; } = string.Empty;
}
