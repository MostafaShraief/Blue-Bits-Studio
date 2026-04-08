using Microsoft.AspNetCore.Mvc;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace BlueBits.Api.Endpoints;

public static class MergeEndpoints
{
    public static RouteGroupBuilder MapMergeEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/execute", async (
            HttpRequest request, 
            IWebHostEnvironment env) =>
        {
            if (!request.HasFormContentType) return Results.BadRequest("Expected form data.");

            var form = await request.ReadFormAsync();
            var files = form.Files.GetFiles("files");
            if (files == null || files.Count == 0) return Results.BadRequest("No files uploaded.");

            var materialName = form["materialName"].ToString();
            var lectureType = form["lectureType"].ToString();
            if (string.IsNullOrEmpty(lectureType)) lectureType = "theoretical";
            if (string.IsNullOrEmpty(materialName)) materialName = "Merged_Document";

            var uploadsDir = Path.Combine(env.ContentRootPath, "uploads");
            Directory.CreateDirectory(uploadsDir);

            // Select template
            string templateName = lectureType.ToLower() == "practical" ? "Pandoc-Prac-Final-Step.dotx" : "Pandoc-Theo-Final-Step.dotx";
            string templatePath = Path.Combine(env.ContentRootPath, "..", "Resources", "PandocTemplates", templateName);

            if (!System.IO.File.Exists(templatePath))
            {
                return Results.NotFound(new { error = $"Template file {templateName} not found at {templatePath}." });
            }

            string finalFileName = $"{materialName}_{DateTime.Now:yyyyMMdd_HHmmss}.docx";
            string finalFilePath = Path.Combine(uploadsDir, finalFileName);

            // Copy template to final path
            System.IO.File.Copy(templatePath, finalFilePath, true);

            // Process each file
            using (WordprocessingDocument finalDoc = WordprocessingDocument.Open(finalFilePath, true))
            {
                finalDoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                var mainPart = finalDoc.MainDocumentPart;
                if (mainPart?.Document?.Body == null) return Results.Problem("Invalid template.");
                
                var body = mainPart.Document.Body;

                // 1. Remove the second page from the template (index 2) which is the empty paragraph with SectPr
                var p2 = body.Elements<Paragraph>().ElementAtOrDefault(2);
                if (p2 != null) p2.Remove();

                // 2. Find the first SectionBreak paragraph (end of cover page) to insert AltChunks after
                var sectionBreakPara = body.Elements<Paragraph>().FirstOrDefault(p => 
                    p.Elements<ParagraphProperties>().Any(pp => pp.Elements<SectionProperties>().Any())
                );
                
                OpenXmlElement insertionPoint = sectionBreakPara;

                for (int i = 0; i < files.Count; i++)
                {
                    var file = files[i];
                    string tempFilePath = Path.Combine(uploadsDir, $"temp_{Guid.NewGuid()}.docx");

                    using (var stream = new FileStream(tempFilePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // Trim nodes (before first sectPr and after last sectPr)
                    using (var tempDoc = WordprocessingDocument.Open(tempFilePath, true))
                    {
                        var tempMainPart = tempDoc.MainDocumentPart;
                        if (tempMainPart != null && tempMainPart.Document?.Body != null)
                        {
                            var tempBody = tempMainPart.Document.Body;
                            var sectPrs = tempBody.Descendants<SectionProperties>().ToList();
                            
                            if (sectPrs.Count > 0)
                            {
                                // Remove Cover
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
                                
                                // Remove Back Cover
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

                                    // Retain content page layout and avoid default margins
                                    var clonedSectPr = (SectionProperties)contentSectPr.CloneNode(true);
                                    contentSectPr.Remove(); // Remove from inside the paragraph to prevent an extra break
                                    
                                    var bodySectPr = tempBody.Elements<SectionProperties>().LastOrDefault();
                                    if (bodySectPr != null) bodySectPr.Remove();
                                    
                                    tempBody.AppendChild(clonedSectPr);
                                }
                            }
                            
                            tempMainPart.Document.Save();
                        }
                    }

                    // Inject via AltChunk
                    string altChunkId = $"AltChunkId_{i}_{Guid.NewGuid():N}";
                    AlternativeFormatImportPart chunk = mainPart.AddAlternativeFormatImportPart(AlternativeFormatImportPartType.WordprocessingML, altChunkId);

                    using (var fs = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read))
                    {
                        chunk.FeedData(fs);
                    }

                    AltChunk altChunk = new AltChunk { Id = altChunkId };
                    
                    AltChunkProperties altChunkPr = new AltChunkProperties();
                    altChunkPr.MatchSource = new MatchSource() { Val = true };
                    altChunk.Append(altChunkPr);
                    
                    if (insertionPoint != null)
                    {
                        insertionPoint.InsertAfterSelf(altChunk);
                        insertionPoint = altChunk; // ensure multiple files don't insert in reverse
                    }
                    else
                    {
                        body.AppendChild(altChunk);
                        insertionPoint = altChunk;
                    }

                    // Force a hard page break after the inserted file to prevent overlapping backgrounds 
                    // and ensure the next document (or the final End Page) starts on a fresh page.
                    Paragraph breakPara = new Paragraph(
                        new Run(
                            new Break() { Type = BreakValues.Page }
                        )
                    );
                    insertionPoint.InsertAfterSelf(breakPara);
                    insertionPoint = breakPara;

                    if (System.IO.File.Exists(tempFilePath))
                    {
                        System.IO.File.Delete(tempFilePath);
                    }
                }
                
                mainPart.Document?.Save();
            }

            string downloadUrl = $"/uploads/{Uri.EscapeDataString(finalFileName)}";
            return Results.Ok(new { url = downloadUrl, finalFileName = finalFileName });
        }).DisableAntiforgery();

        return group;
    }
}
