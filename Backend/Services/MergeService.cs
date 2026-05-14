using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using BlueBits.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace BlueBits.Api.Services;

public class MergeService : IMergeService
{
    public async Task<MergeResult> MergeDocxFilesAsync(
        IReadOnlyList<IFormFile> files,
        string materialName,
        string lectureType,
        string contentRootPath)
    {
        if (files == null || files.Count == 0)
        {
            return new MergeResult { Error = "No files uploaded." };
        }

        if (string.IsNullOrEmpty(materialName)) materialName = "Merged_Document";

        var typeLabel = lectureType.ToLower() != "practical" ? "نظري" : "عملي";

        var uploadsDir = Path.Combine(contentRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        string templateName = lectureType.ToLower() == "practical"
            ? "Pandoc-Prac-Final-Step.dotx"
            : "Pandoc-Theo-Final-Step.dotx";
        string templatePath = Path.Combine(contentRootPath, "..", "Resources", "PandocTemplates", templateName);

        if (!System.IO.File.Exists(templatePath))
        {
            return new MergeResult { Error = $"Template file {templateName} not found at {templatePath}." };
        }

        string finalFileName = $"{materialName} - {typeLabel} - ملف شامل.docx";
        string finalFilePath = Path.Combine(uploadsDir, finalFileName);

        System.IO.File.Copy(templatePath, finalFilePath, true);

        using (WordprocessingDocument finalDoc = WordprocessingDocument.Open(finalFilePath, true))
        {
            finalDoc.ChangeDocumentType(WordprocessingDocumentType.Document);
            var mainPart = finalDoc.MainDocumentPart;
            if (mainPart?.Document?.Body == null)
            {
                return new MergeResult { Error = "Invalid template." };
            }

            var body = mainPart.Document.Body;

            var p2 = body.Elements<Paragraph>().ElementAtOrDefault(2);
            if (p2 != null) p2.Remove();

            var templateSectPr = body.Elements<SectionProperties>().LastOrDefault();
            PageSize? templatePageSize = null;
            PageMargin? templatePageMargin = null;

            if (templateSectPr != null)
            {
                templatePageSize = templateSectPr.GetFirstChild<PageSize>();
                templatePageMargin = templateSectPr.GetFirstChild<PageMargin>();
            }

            var sectionBreakPara = body.Elements<Paragraph>().FirstOrDefault(p =>
                p.Elements<ParagraphProperties>().Any(pp => pp.Elements<SectionProperties>().Any())
            );

            OpenXmlElement? insertionPoint = sectionBreakPara;

            for (int i = 0; i < files.Count; i++)
            {
                var file = files[i];
                string tempFilePath = Path.Combine(uploadsDir, $"temp_{Guid.NewGuid()}.docx");

                using (var stream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                using (var tempDoc = WordprocessingDocument.Open(tempFilePath, true))
                {
                    var tempMainPart = tempDoc.MainDocumentPart;
                    if (tempMainPart != null && tempMainPart.Document?.Body != null)
                    {
                        var tempBody = tempMainPart.Document.Body;
                        var sectPrs = tempBody.Descendants<SectionProperties>().ToList();

                        if (sectPrs.Count > 0)
                        {
                            var firstSectPr = sectPrs.First();
                            var firstBlock = firstSectPr.Ancestors().FirstOrDefault(a => a.Parent == tempBody) ?? firstSectPr;

                            var nodesToRemovePrefix = new List<OpenXmlElement>();
                            var current = tempBody.FirstChild;
                            while (current != null && current != firstBlock)
                            {
                                nodesToRemovePrefix.Add(current);
                                current = current.NextSibling();
                            }
                            if (current == firstBlock)
                            {
                                nodesToRemovePrefix.Add(current);
                            }

                            foreach (var node in nodesToRemovePrefix)
                            {
                                if (node.Parent != null) node.Remove();
                            }

                            if (sectPrs.Count > 1)
                            {
                                var contentSectPr = sectPrs[sectPrs.Count - 2];
                                var contentBlock = contentSectPr.Ancestors().FirstOrDefault(a => a.Parent == tempBody) ?? contentSectPr;

                                var nodesToRemoveSuffix = new List<OpenXmlElement>();
                                current = contentBlock.NextSibling();
                                while (current != null)
                                {
                                    nodesToRemoveSuffix.Add(current);
                                    current = current.NextSibling();
                                }

                                foreach (var node in nodesToRemoveSuffix)
                                {
                                    if (node.Parent != null) node.Remove();
                                }

                                var clonedSectPr = (SectionProperties)contentSectPr.CloneNode(true);
                                contentSectPr.Remove();

                                var bodySectPr = tempBody.Elements<SectionProperties>().LastOrDefault();
                                if (bodySectPr != null) bodySectPr.Remove();

                                tempBody.AppendChild(clonedSectPr);
                            }
                        }

                        tempMainPart.Document.Save();
                    }
                }

                string altChunkId = $"AltChunkId_{i}_{Guid.NewGuid():N}";
                AlternativeFormatImportPart chunk = mainPart.AddAlternativeFormatImportPart(
                    AlternativeFormatImportPartType.WordprocessingML, altChunkId);

                using (var fs = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read))
                {
                    chunk.FeedData(fs);
                }

                AltChunk altChunk = new AltChunk { Id = altChunkId };

                if (insertionPoint != null)
                {
                    insertionPoint.InsertAfterSelf(altChunk);
                    insertionPoint = altChunk;
                }
                else
                {
                    body.AppendChild(altChunk);
                    insertionPoint = altChunk;
                }

                Paragraph breakPara = new Paragraph();
                ParagraphProperties breakParaPr = new ParagraphProperties();

                SectionProperties breakSectPr = new SectionProperties();

                if (templatePageSize != null)
                {
                    breakSectPr.AppendChild((PageSize)templatePageSize.CloneNode(true));
                }
                if (templatePageMargin != null)
                {
                    var clonedMargin = (PageMargin)templatePageMargin.CloneNode(true);
                    breakSectPr.AppendChild(clonedMargin);
                }

                breakParaPr.AppendChild(breakSectPr);
                breakPara.AppendChild(breakParaPr);

                Run pageBreakRun = new Run();
                pageBreakRun.AppendChild(new Break() { Type = BreakValues.Page });
                breakPara.PrependChild(pageBreakRun);

                insertionPoint.InsertAfterSelf(breakPara);
                insertionPoint = breakPara;

                if (System.IO.File.Exists(tempFilePath))
                {
                    System.IO.File.Delete(tempFilePath);
                }
            }

            var allBodySectPrs = body.Elements<SectionProperties>().ToList();
            foreach (var sectPr in allBodySectPrs)
            {
                if (templatePageSize != null)
                {
                    var existingSize = sectPr.Elements<PageSize>().FirstOrDefault();
                    if (existingSize != null)
                    {
                        existingSize.Width = templatePageSize.Width;
                        existingSize.Height = templatePageSize.Height;
                        existingSize.Orient = templatePageSize.Orient;
                    }
                }

                if (templatePageMargin != null)
                {
                    var existingMargin = sectPr.Elements<PageMargin>().FirstOrDefault();
                    if (existingMargin != null)
                    {
                        existingMargin.Top = templatePageMargin.Top;
                        existingMargin.Bottom = templatePageMargin.Bottom;
                        existingMargin.Left = templatePageMargin.Left;
                        existingMargin.Right = templatePageMargin.Right;
                        existingMargin.Header = templatePageMargin.Header;
                        existingMargin.Footer = templatePageMargin.Footer;
                        existingMargin.Gutter = templatePageMargin.Gutter;
                    }
                    else
                    {
                        sectPr.AppendChild((PageMargin)templatePageMargin.CloneNode(true));
                    }
                }
            }

            mainPart.Document?.Save();
        }

        string downloadUrl = $"/uploads/{Uri.EscapeDataString(finalFileName)}";
        return new MergeResult { Url = downloadUrl, FinalFileName = finalFileName };
    }
}
