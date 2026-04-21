using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using WRun = DocumentFormat.OpenXml.Wordprocessing.Run;
using WText = DocumentFormat.OpenXml.Wordprocessing.Text;
using MRun = DocumentFormat.OpenXml.Math.Run;
using MText = DocumentFormat.OpenXml.Math.Text;
using OfficeMath = DocumentFormat.OpenXml.Math.OfficeMath;
using Fraction = DocumentFormat.OpenXml.Math.Fraction;
using Numerator = DocumentFormat.OpenXml.Math.Numerator;
using Denominator = DocumentFormat.OpenXml.Math.Denominator;

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
            templatePath = Path.GetFullPath(templatePath);

            var finalTemplateName = templateName.Replace(".dotx", "-Final-Step.dotx");
            var finalTemplatePath = Path.Combine(env.ContentRootPath, "..", "Resources", "PandocTemplates", finalTemplateName);
            finalTemplatePath = Path.GetFullPath(finalTemplatePath);

            var uploadDir = Path.Combine(env.ContentRootPath, "uploads", "pandoc");
            Directory.CreateDirectory(uploadDir);

            // Naming MUST be {Material Name} ({Type}) - {Lecture Number}.docx
            var safeMaterialName = string.IsNullOrWhiteSpace(req.MaterialName) ? "Unknown" : string.Join("_", req.MaterialName.Split(Path.GetInvalidFileNameChars()));
            var safeType = string.IsNullOrWhiteSpace(req.Type) ? "Unknown" : string.Join("_", req.Type.Split(Path.GetInvalidFileNameChars()));
            var safeLectureNumber = string.IsNullOrWhiteSpace(req.LectureNumber) ? "Unknown" : string.Join("_", req.LectureNumber.Split(Path.GetInvalidFileNameChars()));
            
            var fileName = $"{safeMaterialName} ({safeType}) - {safeLectureNumber}.docx";
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
                return Results.BadRequest(new { error = "Pandoc generation failed", details = error });
            }

            try
            {
                ProcessEquations(tempOutputDocx);
                MergeWithTemplate(tempOutputDocx, finalTemplatePath, finalOutputDocx);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = "Post-processing failed", details = ex.Message });
            }
            finally
            {
                if (File.Exists(tempOutputDocx))
                {
                    File.Delete(tempOutputDocx);
                }
            }

            return Results.Ok(new { fileUrl = $"/uploads/pandoc/{Uri.EscapeDataString(fileName)}" });
        });

        return group;
    }

    private class CharFormat
    {
        public char C;
        public RunProperties? Format;
    }

    private static void ProcessEquations(string docxPath)
    {
        using (var document = WordprocessingDocument.Open(docxPath, true))
        {
            var body = document.MainDocumentPart?.Document?.Body;
            if (body == null) return;

            foreach (var para in body.Descendants<Paragraph>().ToList())
            {
                if (!para.InnerText.Contains("{{{") || !para.InnerText.Contains("}}}")) continue;

                List<CharFormat> chars = new List<CharFormat>();
                foreach (var run in para.Elements<WRun>())
                {
                    var rPr = run.RunProperties;
                    foreach (var t in run.Elements<WText>())
                    {
                        foreach (char c in t.Text)
                        {
                            chars.Add(new CharFormat { C = c, Format = rPr });
                        }
                    }
                }

                string fullText = new string(chars.Select(c => c.C).ToArray());
                int currentIndex = 0;
                List<OpenXmlElement> newElements = new List<OpenXmlElement>();

                while (currentIndex < fullText.Length)
                {
                    int startEq = fullText.IndexOf("{{{", currentIndex);
                    if (startEq == -1)
                    {
                        newElements.AddRange(CreateWordRuns(chars.Skip(currentIndex).ToList()));
                        break;
                    }

                    int endEq = fullText.IndexOf("}}}", startEq + 3);
                    if (endEq == -1)
                    {
                        newElements.AddRange(CreateWordRuns(chars.Skip(currentIndex).ToList()));
                        break;
                    }

                    if (startEq > currentIndex)
                    {
                        newElements.AddRange(CreateWordRuns(chars.Skip(currentIndex).Take(startEq - currentIndex).ToList()));
                    }

                    int eqTextStart = startEq + 3;
                    int eqTextLength = endEq - eqTextStart;
                    var eqChars = chars.Skip(eqTextStart).Take(eqTextLength).ToList();

                    var oMath = new OfficeMath();
                    string eqStr = new string(eqChars.Select(c => c.C).ToArray());
                    int slashIdx = eqStr.IndexOf('/');

                    if (slashIdx > 0 && slashIdx < eqStr.Length - 1 && eqStr.IndexOf('/', slashIdx + 1) == -1)
                    {
                        var f = new Fraction();
                        var num = new Numerator();
                        num.Append(CreateMathRuns(eqChars.Take(slashIdx).ToList()));
                        var den = new Denominator();
                        den.Append(CreateMathRuns(eqChars.Skip(slashIdx + 1).ToList()));
                        f.Append(new DocumentFormat.OpenXml.Math.FractionProperties(new DocumentFormat.OpenXml.Math.ControlProperties()));
                        f.Append(num);
                        f.Append(den);
                        oMath.Append(f);
                    }
                    else
                    {
                        oMath.Append(CreateMathRuns(eqChars));
                    }

                    newElements.Add(oMath);
                    currentIndex = endEq + 3;
                }

                var pPr = para.Elements<ParagraphProperties>().FirstOrDefault();
                para.RemoveAllChildren<WRun>();
                
                // If the paragraph became empty of text, we can append our elements.
                // It's safer to remove only the WRun elements so we don't accidentally remove bookmarks/hyperlinks if any are present.
                // However, our flattening didn't preserve them if they were inside.
                // We'll just remove them all to be safe and clean:
                para.RemoveAllChildren();
                if (pPr != null) para.Append(pPr.CloneNode(true));
                
                foreach (var el in newElements)
                {
                    para.Append(el);
                }
            }
            document.MainDocumentPart?.Document?.Save();
        }
    }

    private static List<WRun> CreateWordRuns(List<CharFormat> chars)
    {
        var runs = new List<WRun>();
        if (chars.Count == 0) return runs;

        var currentFormat = chars[0].Format;
        var currentText = new System.Text.StringBuilder();
        currentText.Append(chars[0].C);

        for (int i = 1; i < chars.Count; i++)
        {
            if (chars[i].Format == currentFormat)
            {
                currentText.Append(chars[i].C);
            }
            else
            {
                var run = new WRun();
                if (currentFormat != null) run.Append((RunProperties)currentFormat.CloneNode(true));
                run.Append(new WText(currentText.ToString()) { Space = SpaceProcessingModeValues.Preserve });
                runs.Add(run);

                currentFormat = chars[i].Format;
                currentText.Clear();
                currentText.Append(chars[i].C);
            }
        }

        if (currentText.Length > 0)
        {
            var run = new WRun();
            if (currentFormat != null) run.Append((RunProperties)currentFormat.CloneNode(true));
            run.Append(new WText(currentText.ToString()) { Space = SpaceProcessingModeValues.Preserve });
            runs.Add(run);
        }

        return runs;
    }

    private static List<MRun> CreateMathRuns(List<CharFormat> chars)
    {
        var runs = new List<MRun>();
        if (chars.Count == 0) return runs;

        var currentFormat = chars[0].Format;
        var currentText = new System.Text.StringBuilder();
        currentText.Append(chars[0].C);

        for (int i = 1; i < chars.Count; i++)
        {
            if (chars[i].Format == currentFormat)
            {
                currentText.Append(chars[i].C);
            }
            else
            {
                var mRun = new MRun();
                if (currentFormat != null) mRun.Append((RunProperties)currentFormat.CloneNode(true));
                mRun.Append(new MText(currentText.ToString()));
                runs.Add(mRun);

                currentFormat = chars[i].Format;
                currentText.Clear();
                currentText.Append(chars[i].C);
            }
        }

        if (currentText.Length > 0)
        {
            var mRun = new MRun();
            if (currentFormat != null) mRun.Append((RunProperties)currentFormat.CloneNode(true));
            mRun.Append(new MText(currentText.ToString()));
            runs.Add(mRun);
        }

        return runs;
    }

    private static void MergeWithTemplate(string tempDocx, string finalTemplatePath, string finalOutputPath)
    {
        File.Copy(finalTemplatePath, finalOutputPath, true);

        using (WordprocessingDocument finalDoc = WordprocessingDocument.Open(finalOutputPath, true))
        {
            finalDoc.ChangeDocumentType(DocumentFormat.OpenXml.WordprocessingDocumentType.Document);

            var body = finalDoc.MainDocumentPart?.Document?.Body;
            if (body == null) return;

            // Import the temp document
            string altChunkId = "AltChunkId" + Guid.NewGuid().ToString("N");
            AlternativeFormatImportPart chunk = finalDoc.MainDocumentPart.AddAlternativeFormatImportPart(
                AlternativeFormatImportPartType.WordprocessingML, altChunkId);

            using (FileStream fileStream = File.Open(tempDocx, FileMode.Open, FileAccess.Read))
            {
                chunk.FeedData(fileStream);
            }

            AltChunk altChunk = new AltChunk() { Id = altChunkId };
            
            // Find the paragraph with the first Section Break (which separates the cover from the rest)
            var sectionBreakPara = body.Elements<Paragraph>().FirstOrDefault(p => 
                p.Elements<ParagraphProperties>().Any(pp => pp.Elements<SectionProperties>().Any())
            );

            if (sectionBreakPara != null)
            {
                // Insert the generated content right AFTER the section break (at the very top of the 2nd page).
                // This pushes the existing 2nd page content (the back cover / team names) down to the end!
                sectionBreakPara.InsertAfterSelf(altChunk);
            }
            else
            {
                // Fallback if no section break is found
                body.AppendChild(altChunk);
            }

            finalDoc.MainDocumentPart?.Document?.Save();
        }
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