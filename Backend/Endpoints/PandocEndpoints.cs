using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace BlueBits.Api.Endpoints;

public static class PandocEndpoints
{
    public static RouteGroupBuilder MapPandocEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/generate", async (GenerateDocxRequest req, IWebHostEnvironment env) =>
        {
            var appData = Path.Combine(env.ContentRootPath, "App_Data");
            Directory.CreateDirectory(appData);

            var tempMd = Path.Combine(appData, $"{Guid.NewGuid()}.md");

            await File.WriteAllTextAsync(tempMd, req.MarkdownText);

            var templateName = string.IsNullOrEmpty(req.TemplateName) ? "Pandoc-Theo.dotx" : req.TemplateName;
            var templatePath = Path.Combine(env.ContentRootPath, "..", "Resources", "PandocTemplates", templateName);
            
            // Adjust path depending on where it actually is
            templatePath = Path.GetFullPath(templatePath);

            var uploadDir = Path.Combine(env.ContentRootPath, "uploads", "pandoc");
            Directory.CreateDirectory(uploadDir);

            // Naming MUST be {Material Name} ({Type}) - {Lecture Number}.docx
            var safeMaterialName = string.IsNullOrWhiteSpace(req.MaterialName) ? "Unknown" : string.Join("_", req.MaterialName.Split(Path.GetInvalidFileNameChars()));
            var safeType = string.IsNullOrWhiteSpace(req.Type) ? "Unknown" : string.Join("_", req.Type.Split(Path.GetInvalidFileNameChars()));
            var safeLectureNumber = string.IsNullOrWhiteSpace(req.LectureNumber) ? "Unknown" : string.Join("_", req.LectureNumber.Split(Path.GetInvalidFileNameChars()));
            
            var fileName = $"{safeMaterialName} ({safeType}) - {safeLectureNumber}.docx";
            var outputDocx = Path.Combine(uploadDir, fileName);

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "pandoc",
                    Arguments = $"-f markdown -t docx -o \"{outputDocx}\" --reference-doc=\"{templatePath}\" \"{tempMd}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                }
            };

            process.Start();
            await process.WaitForExitAsync();

            File.Delete(tempMd);

            if (process.ExitCode != 0)
            {
                var error = await process.StandardError.ReadToEndAsync();
                return Results.BadRequest(new { error = "Pandoc generation failed", details = error });
            }

            return Results.Ok(new { fileUrl = $"/uploads/pandoc/{Uri.EscapeDataString(fileName)}" });
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
