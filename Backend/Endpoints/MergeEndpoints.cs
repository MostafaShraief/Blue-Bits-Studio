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
                if (mainPart == null) return Results.Problem("Invalid template.");

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
                            var body = tempMainPart.Document.Body;
                            var sectPrs = body.Descendants<SectionProperties>().ToList();
                            
                            if (sectPrs.Count > 0)
                            {
                                var firstSectPr = sectPrs.First();
                                OpenXmlElement? firstNode = body.FirstChild;
                                
                                while (firstNode != null && firstNode != firstSectPr)
                                {
                                    var nextNode = firstNode.NextSibling();
                                    firstNode.Remove();
                                    firstNode = nextNode;
                                }
                                
                                if (firstNode == firstSectPr)
                                {
                                    firstNode.Remove();
                                }
                                
                                if (sectPrs.Count > 1)
                                {
                                    var lastSectPr = sectPrs.Last();
                                    OpenXmlElement? toRemove = lastSectPr;
                                    while (toRemove != null)
                                    {
                                        var next = toRemove.NextSibling();
                                        toRemove.Remove();
                                        toRemove = next;
                                    }
                                }
                            }
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
                    
                    var templateBody = mainPart.Document?.Body;
                    var templateLastSectPr = templateBody?.Elements<SectionProperties>().LastOrDefault();
                    if (templateLastSectPr != null)
                    {
                        templateBody?.InsertBefore(altChunk, templateLastSectPr);
                    }
                    else
                    {
                        templateBody?.AppendChild(altChunk);
                    }

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