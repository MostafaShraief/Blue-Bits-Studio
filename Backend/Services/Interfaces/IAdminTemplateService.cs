using Microsoft.AspNetCore.Http;

namespace BlueBits.Api.Services.Interfaces;

public interface IAdminTemplateService
{
    Task<List<TemplateInfo>> GetTemplatesAsync();
    Task<TemplateUploadResult> UploadTemplateAsync(string templateType, IFormFile file);
}

public class TemplateInfo
{
    public string Type { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime LastModified { get; set; }
    public string LectureType { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
}

public class TemplateUploadResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public int StatusCode { get; set; }
}
