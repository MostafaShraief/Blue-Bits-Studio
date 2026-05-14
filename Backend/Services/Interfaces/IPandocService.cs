namespace BlueBits.Api.Services.Interfaces;

public interface IPandocService
{
    Task<PandocResult> GenerateDocxAsync(string markdownText, string templateName, string materialName, string type, string lectureNumber, string contentRootPath);
}

public record PandocResult
{
    public bool Success { get; init; }
    public string? FileUrl { get; init; }
    public string? Error { get; init; }
    public string? Details { get; init; }
}
