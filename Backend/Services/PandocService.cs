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
        string text = paragraph.InnerText;
        if (!text.Contains("¶§") || !text.Contains("§¶"))
            return;

        var runs = paragraph.Elements<WRun>().ToList();

        for (int i = 0; i < runs.Count; i++)
        {
            var currentRun = runs[i];
            var runTextElement = currentRun.GetFirstChild<WText>();
            if (runTextElement == null) continue;

            int startTagIdx = runTextElement.Text.IndexOf("¶§");
            if (startTagIdx < 0) continue;

            int endRunIdx = -1;
            int endTagIdx = -1;

            for (int j = i; j < runs.Count; j++)
            {
                var targetRunText = runs[j].GetFirstChild<WText>();
                if (targetRunText == null) continue;

                int lookFrom = (j == i) ? startTagIdx + 2 : 0;
                int foundClose = targetRunText.Text.IndexOf("§¶", lookFrom);
                if (foundClose != -1)
                {
                    endRunIdx = j;
                    endTagIdx = foundClose;
                    break;
                }
            }

            if (endRunIdx < 0) continue;

            M.OfficeMath officeMath = new M.OfficeMath();
            M.Run mathRun = new M.Run();

            if (currentRun.RunProperties != null)
            {
                M.RunProperties mathRunProps = new M.RunProperties();

                // 1. Math-specific formatting structural styles (Bold, Italic, etc.)
                bool hasBold = currentRun.RunProperties.Bold != null;
                bool hasItalic = currentRun.RunProperties.Italic != null;

                if (hasBold || hasItalic)
                {
                    var styleVal = (hasBold, hasItalic) switch
                    {
                        (true, true) => M.StyleValues.BoldItalic,
                        (true, false) => M.StyleValues.Bold,
                        (false, true) => M.StyleValues.Italic,
                        _ => (M.StyleValues?)null
                    };
                    if (styleVal.HasValue)
                        mathRunProps.Append(new M.Style { Val = styleVal.Value });
                }

                // Append math properties first if present
                if (mathRunProps.HasChildren)
                {
                    mathRun.Append(mathRunProps);
                }

                // 2. Clone and append the full Wordprocessing RunProperties (w:rPr)
                // This ensures all color formatting is retained and is in the correct order sequence.
                var wRunProps = (DocumentFormat.OpenXml.Wordprocessing.RunProperties)currentRun.RunProperties.CloneNode(true);
                mathRun.Append(wRunProps);
            }

            string equationText;
            if (i == endRunIdx)
            {
                equationText = runTextElement.Text.Substring(startTagIdx + 2, endTagIdx - (startTagIdx + 2));

                string leftText = runTextElement.Text.Substring(0, startTagIdx);
                string rightText = runTextElement.Text.Substring(endTagIdx + 2);

                runTextElement.Text = leftText;
                
                // 3. Add text element (m:t) last
                mathRun.Append(new M.Text(equationText));
                officeMath.Append(mathRun);

                currentRun.InsertAfterSelf(officeMath);

                if (!string.IsNullOrEmpty(rightText))
                {
                    WRun trailingRun = (WRun)currentRun.CloneNode(true);
                    trailingRun.GetFirstChild<WText>()!.Text = rightText;
                    officeMath.InsertAfterSelf(trailingRun);
                }
            }
            else
            {
                string startText = runTextElement.Text.Substring(startTagIdx + 2);
                equationText = startText;
                runTextElement.Text = runTextElement.Text.Substring(0, startTagIdx);

                for (int m = i + 1; m < endRunIdx; m++)
                {
                    equationText += runs[m].InnerText;
                    paragraph.RemoveChild(runs[m]);
                }

                var finalRunText = runs[endRunIdx].GetFirstChild<WText>()!;
                string endText = finalRunText.Text.Substring(0, endTagIdx);
                equationText += endText;
                finalRunText.Text = finalRunText.Text.Substring(endTagIdx + 2);

                // 3. Add text element (m:t) last
                mathRun.Append(new M.Text(equationText));
                officeMath.Append(mathRun);

                currentRun.InsertAfterSelf(officeMath);
            }

            runs = paragraph.Elements<WRun>().ToList();
            i = -1;
        }
    }
}