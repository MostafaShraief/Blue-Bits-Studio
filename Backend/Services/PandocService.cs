using System.Diagnostics;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using BlueBits.Api.Services.Interfaces;
using WRun = DocumentFormat.OpenXml.Wordprocessing.Run;
using WText = DocumentFormat.OpenXml.Wordprocessing.Text;
using MRun = DocumentFormat.OpenXml.Math.Run;
using MText = DocumentFormat.OpenXml.Math.Text;
using OfficeMath = DocumentFormat.OpenXml.Math.OfficeMath;
using Fraction = DocumentFormat.OpenXml.Math.Fraction;
using Numerator = DocumentFormat.OpenXml.Math.Numerator;
using Denominator = DocumentFormat.OpenXml.Math.Denominator;

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
        var safeType = string.IsNullOrWhiteSpace(type) ? "Unknown" : string.Join("_", type.Split(Path.GetInvalidFileNameChars()));
        var safeLectureNumber = string.IsNullOrWhiteSpace(lectureNumber) ? "Unknown" : string.Join("_", lectureNumber.Split(Path.GetInvalidFileNameChars()));

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
            return new PandocResult { Success = false, Error = "Pandoc generation failed", Details = error };
        }

        try
        {
            ProcessEquations(tempOutputDocx);
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

    private sealed class CharFormat
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
