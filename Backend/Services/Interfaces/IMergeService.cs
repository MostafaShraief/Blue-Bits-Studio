using Microsoft.AspNetCore.Http;

namespace BlueBits.Api.Services.Interfaces;

public interface IMergeService
{
    Task<MergeResult> MergeDocxFilesAsync(IReadOnlyList<IFormFile> files, string materialName, string lectureType, string contentRootPath);
}

public record MergeResult
{
    public string? Url { get; init; }
    public string? FinalFileName { get; init; }
    public string? Error { get; init; }
}
