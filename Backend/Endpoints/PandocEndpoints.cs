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
            var outputDocx = Path.Combine(appData, $"{Guid.NewGuid()}.docx");

            await File.WriteAllTextAsync(tempMd, req.MarkdownText);

            var templateName = string.IsNullOrEmpty(req.TemplateName) ? "Pandoc-Theo.dotx" : req.TemplateName;
            var templatePath = Path.Combine(env.ContentRootPath, "..", "Resources", "PandocTemplates", templateName);
            
            // Adjust path depending on where it actually is
            templatePath = Path.GetFullPath(templatePath);

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

            var bytes = await File.ReadAllBytesAsync(outputDocx);
            // Optionally delete the docx after returning, or keep it for download endpoint
            File.Delete(outputDocx);

            return Results.File(bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "output.docx");
        });

        return group;
    }
}

public class GenerateDocxRequest
{
    public string MarkdownText { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
}
