using System.Diagnostics;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using BlueBits.Api.Services.Interfaces;
using WRun = DocumentFormat.OpenXml.Wordprocessing.Run;
using WText = DocumentFormat.OpenXml.Wordprocessing.Text;
using System.Text;
using M = DocumentFormat.OpenXml.Math;

namespace BlueBits.Api.Services;

public class PandocService : IPandocService
{
    private readonly ILogger<PandocService> _logger;

    public PandocService(ILogger<PandocService> logger)
    {
        _logger = logger;
    }

    public async Task<PandocResult> GenerateDocxAsync(
        string markdownText,
        string templateName,
        string materialName,
        string type,
        string lectureNumber,
        string contentRootPath,
        bool isSinglePage,
        CancellationToken cancellationToken = default)
    {
        var appData = Path.Combine(contentRootPath, "App_Data");
        Directory.CreateDirectory(appData);

        var tempMd = Path.Combine(appData, $"{Guid.NewGuid()}.md");
        await File.WriteAllTextAsync(tempMd, markdownText);

        var resolvedTemplateName = string.IsNullOrEmpty(templateName) ? "Pandoc.dotx" : templateName;
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "PandocTemplates", resolvedTemplateName);
        templatePath = Path.GetFullPath(templatePath);

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

        var fileName = isSinglePage
            ? $"{safeMaterialName} ({typeLabel}) - {safeLectureNumber} (أبيض).docx"
            : $"{safeMaterialName} ({typeLabel}) - {safeLectureNumber}.docx";
        var tempOutputDocx = Path.Combine(uploadDir, $"temp_{Guid.NewGuid()}.docx");

        _logger.LogInformation("Starting DOCX generation for material {MaterialName}, Lecture {LectureNumber}, type {Type}, singlePage={IsSinglePage}", materialName, lectureNumber, type, isSinglePage);

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
        await process.WaitForExitAsync(cancellationToken);

        File.Delete(tempMd);

        if (process.ExitCode != 0)
        {
            var error = await process.StandardError.ReadToEndAsync();
            _logger.LogError("Pandoc CLI failed for {MaterialName} Lecture {LectureNumber}. ExitCode: {ExitCode}, Error: {Error}", materialName, lectureNumber, process.ExitCode, error);
            return new PandocResult { Success = false, Error = "فشل إنشاء المستند", Details = error };
        }

        try
        {
            ConvertTagsToEquations(tempOutputDocx);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Equation tag conversion (¶§…§¶) failed for {TempDocx}, continuing without equations", tempOutputDocx);
        }

        string finalOutputDocx;
        if (isSinglePage)
        {
            finalOutputDocx = Path.Combine(uploadDir, fileName);
            if (File.Exists(finalOutputDocx))
                File.Delete(finalOutputDocx);
            File.Move(tempOutputDocx, finalOutputDocx);

            _logger.LogInformation("Single-page DOCX generation completed for {MaterialName} Lecture {LectureNumber}. Output: {FileName}", materialName, lectureNumber, fileName);
            return new PandocResult { Success = true, FileUrl = $"/uploads/pandoc/{Uri.EscapeDataString(fileName)}" };
        }

        var finalTemplateName = type?.ToLower() switch
        {
            "theoretical" or "theo" => "Pandoc-Theo-Final-Step.dotx",
            "practical" or "prac" => "Pandoc-Prac-Final-Step.dotx",
            _ => "Pandoc-Theo-Final-Step.dotx"
        };
        var finalTemplatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "PandocTemplates", finalTemplateName);
        finalTemplatePath = Path.GetFullPath(finalTemplatePath);

        var finalOutputDocxFull = Path.Combine(uploadDir, fileName);

        try
        {
            MergeWithTemplate(tempOutputDocx, finalTemplatePath, finalOutputDocxFull);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenXML post-processing failed for {MaterialName} Lecture {LectureNumber}", materialName, lectureNumber);
            return new PandocResult { Success = false, Error = "فشلت المعالجة اللاحقة", Details = ex.Message };
        }
        finally
        {
            if (File.Exists(tempOutputDocx))
            {
                File.Delete(tempOutputDocx);
            }
        }

        _logger.LogInformation("DOCX generation completed for {MaterialName} Lecture {LectureNumber}. Output: {FileName}", materialName, lectureNumber, fileName);
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

    private static void ConvertTagsToEquations(string filePath)
    {
        using var doc = WordprocessingDocument.Open(filePath, true);
        var mainPart = doc.MainDocumentPart;
        if (mainPart?.Document?.Body == null) return;

        var paragraphs = mainPart.Document.Body.Elements<Paragraph>().ToList();
        foreach (var paragraph in paragraphs)
        {
            ProcessParagraphEquations(paragraph);
        }

        mainPart.Document.Save();
    }

    private static void ProcessParagraphEquations(Paragraph paragraph)
    {
        var runs = paragraph.Elements<WRun>().ToList();

        for (int i = 0; i < runs.Count; i++)
        {
            var run = runs[i];
            var textElement = run.GetFirstChild<WText>();
            if (textElement == null) continue;

            var text = textElement.Text;
            var openIdx = text.IndexOf("¶§");
            if (openIdx < 0) continue;

            int closeRunIdx = -1;
            int closeIdx = -1;

            for (int j = i; j < runs.Count; j++)
            {
                var targetText = runs[j].GetFirstChild<WText>()?.Text ?? "";
                var searchStart = (j == i) ? openIdx + 2 : 0;
                var foundClose = targetText.IndexOf("§¶", searchStart);
                if (foundClose >= 0)
                {
                    closeRunIdx = j;
                    closeIdx = foundClose;
                    break;
                }
            }

            if (closeRunIdx < 0) continue;

            string equationText;
            WRun? trailingRun = null;

            if (i == closeRunIdx)
            {
                equationText = text.Substring(openIdx + 2, closeIdx - openIdx - 2);
                var leftText = text.Substring(0, openIdx);
                var rightText = text.Substring(closeIdx + 2);

                textElement.Text = leftText;

                if (!string.IsNullOrEmpty(rightText))
                {
                    trailingRun = (WRun)run.CloneNode(true);
                    trailingRun.GetFirstChild<WText>()!.Text = rightText;
                }
            }
            else
            {
                var leftText = text.Substring(0, openIdx);
                textElement.Text = leftText;

                var sb = new StringBuilder();
                for (int m = i + 1; m < closeRunIdx; m++)
                {
                    var midText = runs[m].GetFirstChild<WText>()?.Text ?? "";
                    sb.Append(midText);
                }

                var closeRun = runs[closeRunIdx];
                var closeTextElement = closeRun.GetFirstChild<WText>()!;
                sb.Append(closeTextElement.Text.Substring(0, closeIdx));
                equationText = sb.ToString();

                var rightText = closeTextElement.Text.Substring(closeIdx + 2);
                if (!string.IsNullOrEmpty(rightText))
                {
                    closeTextElement.Text = rightText;
                }
                else
                {
                    closeRun.Remove();
                }

                for (int m = i + 1; m < closeRunIdx; m++)
                {
                    runs[m].Remove();
                }
            }

            if (string.IsNullOrEmpty(equationText)) continue;

            var math = CreateMathElement(equationText, run.RunProperties);
            run.InsertAfterSelf(math);

            if (trailingRun != null)
            {
                math.InsertAfterSelf(trailingRun);
            }

            runs = paragraph.Elements<WRun>().ToList();
            i = -1;
        }
    }

    private static M.OfficeMath CreateMathElement(string equationText, RunProperties? sourceProps)
    {
        var math = new M.OfficeMath();
        var mathRun = new M.Run();

        if (sourceProps is { Bold: not null } || sourceProps is { Italic: not null })
        {
            var mathRunProps = new M.RunProperties();
            var styleVal = (sourceProps.Bold != null, sourceProps.Italic != null) switch
            {
                (true, true) => M.StyleValues.BoldItalic,
                (true, false) => M.StyleValues.Bold,
                (false, true) => M.StyleValues.Italic,
                _ => (M.StyleValues?)null
            };
            if (styleVal.HasValue)
                mathRunProps.Append(new M.Style { Val = styleVal.Value });
            mathRun.Append(mathRunProps);
        }

        mathRun.Append(new M.Text(equationText));
        math.Append(mathRun);
        return math;
    }
}
