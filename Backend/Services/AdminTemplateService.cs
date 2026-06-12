using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Http;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminTemplateService : IAdminTemplateService
{
    private static readonly SemaphoreSlim _writeLock = new(1, 1);
    private static readonly TimeSpan _timeout = TimeSpan.FromSeconds(30);

    private static readonly (string Type, string DisplayName, string FileName, string LectureType, string Purpose)[] _templateDefs =
    [
        ("Pandoc", "قالب Pandoc", "Pandoc.dotx", "", "Pandoc"),
        ("Theo-Final", "نظري", "Pandoc-Theo-Final-Step.dotx", "Theo", "Merge"),
        ("Prac-Final", "عملي", "Pandoc-Prac-Final-Step.dotx", "Prac", "Merge"),
    ];

    private readonly IWebHostEnvironment _env;
    private readonly ILogger<AdminTemplateService> _logger;

    public AdminTemplateService(IWebHostEnvironment env, ILogger<AdminTemplateService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public Task<List<TemplateInfo>> GetTemplatesAsync()
    {
        var templates = new List<TemplateInfo>();

        foreach (var (type, displayName, fileName, lectureType, purpose) in _templateDefs)
        {
            var pandocPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "PandocTemplates", fileName);
            if (File.Exists(pandocPath))
            {
                var fi = new FileInfo(pandocPath);
                templates.Add(new TemplateInfo
                {
                    Type = type,
                    DisplayName = displayName,
                    FileName = fileName,
                    FileSize = fi.Length,
                    LastModified = fi.LastWriteTimeUtc,
                    LectureType = lectureType,
                    Purpose = purpose,
                });
            }
        }

        return Task.FromResult(templates);
    }

    public async Task<TemplateUploadResult> UploadTemplateAsync(string templateType, IFormFile file)
    {
        var def = _templateDefs.FirstOrDefault(d => d.Type == templateType);
        if (def == default)
            return new TemplateUploadResult { Success = false, ErrorMessage = "نوع القالب غير صالح. يجب أن يكون 'Pandoc' أو 'Theo-Final' أو 'Prac-Final'.", StatusCode = 400 };

        var ext = Path.GetExtension(file.FileName);
        if (!".dotx".Equals(ext, StringComparison.OrdinalIgnoreCase))
            return new TemplateUploadResult { Success = false, ErrorMessage = "يتم قبول ملفات .dotx فقط.", StatusCode = 400 };

        if (file.Length > 10 * 1024 * 1024)
            return new TemplateUploadResult { Success = false, ErrorMessage = "حجم الملف يجب ألا يتجاوز 10 ميغابايت.", StatusCode = 400 };

        byte[] fileBytes;
        using (var ms = new MemoryStream())
        {
            await file.CopyToAsync(ms);
            fileBytes = ms.ToArray();
        }

        try
        {
            using var validateMs = new MemoryStream(fileBytes);
            using var doc = WordprocessingDocument.Open(validateMs, false);
        }
        catch
        {
            return new TemplateUploadResult { Success = false, ErrorMessage = "تنسيق ملف .dotx غير صالح.", StatusCode = 400 };
        }

        if (!await _writeLock.WaitAsync(_timeout))
        {
            _logger.LogWarning("Semaphore timeout for template upload (type: {TemplateType})", templateType);
            return new TemplateUploadResult { Success = false, ErrorMessage = "يوجد رفع آخر قيد التقدم. يرجى المحاولة مرة أخرى.", StatusCode = 409 };
        }

        try
        {
            var (_, _, fileName, _, _) = def;

            var pandocDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "PandocTemplates");
            Directory.CreateDirectory(pandocDir);
            var pandocPath = Path.Combine(pandocDir, fileName);

            var resourcesDir = Path.Combine(_env.ContentRootPath, "..", "Resources", "PandocTemplates");
            Directory.CreateDirectory(resourcesDir);
            var resourcesPath = Path.Combine(resourcesDir, fileName);

            await File.WriteAllBytesAsync(pandocPath, fileBytes);
            await File.WriteAllBytesAsync(resourcesPath, fileBytes);

            _logger.LogInformation("Template '{FileName}' uploaded successfully (type: {TemplateType})", fileName, templateType);
            return new TemplateUploadResult { Success = true, StatusCode = 200 };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload template {TemplateType}", templateType);
            return new TemplateUploadResult { Success = false, ErrorMessage = "حدث خطأ أثناء رفع القالب.", StatusCode = 500 };
        }
        finally
        {
            _writeLock.Release();
        }
    }
}
