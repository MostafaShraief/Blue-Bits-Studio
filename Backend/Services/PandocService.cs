using System.Diagnostics;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using BlueBits.Api.Services.Interfaces;
using WRun = DocumentFormat.OpenXml.Wordprocessing.Run;
using WText = DocumentFormat.OpenXml.Wordprocessing.Text;

namespace BlueBits.Api.Services;

public class PandocService : IPandocService
{
    public async Task<PandocResult> GenerateDocxAsync(
        string markdownText,
        string templateName,
        string materialName,
        string type,
        string lectureNumber,
        string contentRootPath)
    {
        var appData = Path.Combine(contentRootPath, "App_Data");
        Directory.CreateDirectory(appData);

        var tempMd = Path.Combine(appData, $"{Guid.NewGuid()}.md");
        await File.WriteAllTextAsync(tempMd, markdownText);

        var resolvedTemplateName = string.IsNullOrEmpty(templateName) ? "Pandoc-Theo.dotx" : templateName;
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "PandocTemplates", resolvedTemplateName);
        templatePath = Path.GetFullPath(templatePath);

        var finalTemplateName = resolvedTemplateName.Replace(".dotx", "-Final-Step.dotx");
        var finalTemplatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "PandocTemplates", finalTemplateName);
        finalTemplatePath = Path.GetFullPath(finalTemplatePath);

        var uploadDir = Path.Combine(contentRootPath, "uploads", "pandoc");
        Directory.CreateDirectory(uploadDir);

        var safeMaterialName = string.IsNullOrWhiteSpace(materialName) ? "Unknown" : string.Join("_", materialName.Split(Path.GetInvalidFileNameChars()));
        var typeLabel = type?.ToLower() switch
        {
            "theoretical" or "theo" => "النظري",
            "practical" or "prac" => "العملي",
            _ => string.IsNullOrWhiteSpace(type) ? "Unknown" : string.Join("_", type.Split(Path.GetInvalidFileNameChars()))
        };
        var safeLectureNumber = string.IsNullOrWhiteSpace(lectureNumber) ? "Unknown" : string.Join("_", lectureNumber.Split(Path.GetInvalidFileNameChars()));

        var fileName = $"{safeMaterialName} ({typeLabel}) - {safeLectureNumber}.docx";
        var tempOutputDocx = Path.Combine(uploadDir, $"temp_{Guid.NewGuid()}.docx");
        var finalOutputDocx = Path.Combine(uploadDir, fileName);

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "pandoc",
                Arguments = $"-f markdown -t docx -o \"{tempOutputDocx}\" --reference-doc=\"{templatePath}\" \"{tempMd}\"",
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
            return new PandocResult { Success = false, Error = "Pandoc generation failed", Details = error };
        }

        try
        {
            MergeWithTemplate(tempOutputDocx, finalTemplatePath, finalOutputDocx);
        }
        catch (Exception ex)
        {
            return new PandocResult { Success = false, Error = "Post-processing failed", Details = ex.Message };
        }
        finally
        {
            if (File.Exists(tempOutputDocx))
            {
                File.Delete(tempOutputDocx);
            }
        }

        return new PandocResult { Success = true, FileUrl = $"/uploads/pandoc/{Uri.EscapeDataString(fileName)}" };
    }

    private static void MergeWithTemplate(string tempDocx, string finalTemplatePath, string finalOutputPath)
    {
        File.Copy(finalTemplatePath, finalOutputPath, true);

        using (WordprocessingDocument finalDoc = WordprocessingDocument.Open(finalOutputPath, true))
        {
            finalDoc.ChangeDocumentType(WordprocessingDocumentType.Document);

            var body = finalDoc.MainDocumentPart?.Document?.Body;
            if (body == null) return;

            string altChunkId = "AltChunkId" + Guid.NewGuid().ToString("N");
            AlternativeFormatImportPart chunk = finalDoc.MainDocumentPart.AddAlternativeFormatImportPart(
                AlternativeFormatImportPartType.WordprocessingML, altChunkId);

            using (FileStream fileStream = File.Open(tempDocx, FileMode.Open, FileAccess.Read))
            {
                chunk.FeedData(fileStream);
            }

            AltChunk altChunk = new AltChunk() { Id = altChunkId };

            var sectionBreakPara = body.Elements<Paragraph>().FirstOrDefault(p =>
                p.Elements<ParagraphProperties>().Any(pp => pp.Elements<SectionProperties>().Any())
            );

            if (sectionBreakPara != null)
            {
                sectionBreakPara.InsertAfterSelf(altChunk);
            }
            else
            {
                body.AppendChild(altChunk);
            }

            finalDoc.MainDocumentPart?.Document?.Save();
        }
    }
}
