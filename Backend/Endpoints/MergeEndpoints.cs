using Microsoft.AspNetCore.Mvc;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using OpenXmlParagraph = DocumentFormat.OpenXml.Wordprocessing.Paragraph;
using OpenXmlParagraphProperties = DocumentFormat.OpenXml.Wordprocessing.ParagraphProperties;
using OpenXmlRun = DocumentFormat.OpenXml.Wordprocessing.Run;
using OpenXmlBreak = DocumentFormat.OpenXml.Wordprocessing.Break;
using System.IO;

namespace BlueBits.Api.Endpoints;

public static class MergeEndpoints
{
    public static RouteGroupBuilder MapMergeEndpoints(this RouteGroupBuilder group)
    {
        // Debug endpoint to test if route is registered
        group.MapGet("/test", () => Results.Ok("Merge endpoint working"));

        group.MapPost("/execute", async (
            HttpRequest request, 
            IWebHostEnvironment env) =>
        {
            if (!request.HasFormContentType) return Results.BadRequest("Expected form data.");

            var form = await request.ReadFormAsync();
            var files = form.Files.GetFiles("files");
            if (files == null || files.Count == 0) return Results.BadRequest("No files uploaded.");

            var materialName = form["materialName"].ToString() ?? "";
            if (string.IsNullOrEmpty(materialName)) materialName = "Merged_Document";

            // Get lecture type (default to theoretical)
            var lectureTypeRaw = form["lectureType"].ToString() ?? "";
            var lectureType = string.IsNullOrEmpty(lectureTypeRaw) ? "theoretical" : lectureTypeRaw;
            var typeLabel = lectureType.ToLower() != "practical" ? "نظري" : "عملي";

            var uploadsDir = Path.Combine(env.ContentRootPath, "uploads");
            Directory.CreateDirectory(uploadsDir);

            // Select template based on lecture type (default to theoretical)
            string templateName = lectureType.ToLower() == "practical"
                ? "Pandoc-Prac-Final-Step.dotx" 
                : "Pandoc-Theo-Final-Step.dotx";
            string templatePath = Path.Combine(env.ContentRootPath, "..", "Resources", "PandocTemplates", templateName);

            if (!System.IO.File.Exists(templatePath))
            {
                return Results.NotFound(new { error = $"Template file {templateName} not found at {templatePath}." });
            }

            // Naming: {MaterialName} - {Type} - ملف شامل.docx
            string finalFileName = $"{materialName} - {typeLabel} - ملف شامل.docx";
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
                var p2 = body.Elements<OpenXmlParagraph>().ElementAtOrDefault(2);
                if (p2 != null) p2.Remove();

                // 2. Find the first SectionBreak paragraph (end of cover page) to insert content after
                var sectionBreakPara = body.Elements<OpenXmlParagraph>().FirstOrDefault(p => 
                    p.Elements<OpenXmlParagraphProperties>().Any(pp => pp.Elements<SectionProperties>().Any())
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

                    // Extract middle content from temp file (remove cover and end pages)
                    List<OpenXmlElement> contentElements = new List<OpenXmlElement>();
                    List<(string ContentType, byte[] Data)> imageDataList = new List<(string, byte[])>();
                    
                    using (var tempDoc = WordprocessingDocument.Open(tempFilePath, true))
                    {
                        var tempMainPart = tempDoc.MainDocumentPart;
                        if (tempMainPart != null && tempMainPart.Document?.Body != null)
                        {
                            var tempBody = tempMainPart.Document.Body;
                            var sectPrs = tempBody.Descendants<SectionProperties>().ToList();
                            
                            if (sectPrs.Count > 0)
                            {
                                // Find content boundaries
                                var firstSectPr = sectPrs.First();
                                var firstBlock = firstSectPr.Ancestors().FirstOrDefault(a => a.Parent == tempBody) ?? firstSectPr;
                                
                                // Get content start (after first section break)
                                OpenXmlElement contentStart = firstBlock.NextSibling();
                                
                                // Find content end (before last section break)
                                OpenXmlElement contentEnd = null;
                                if (sectPrs.Count > 1)
                                {
                                    var lastSectPr = sectPrs[sectPrs.Count - 2];
                                    contentEnd = lastSectPr.Ancestors().FirstOrDefault(a => a.Parent == tempBody) ?? lastSectPr;
                                }
                                else if (sectPrs.Count == 1)
                                {
                                    // Only one section - content is everything after first block
                                    contentEnd = tempBody.LastChild;
                                }
                                
                                // Collect content elements
                                var current = contentStart;
                                while (current != null)
                                {
                                    if (current == contentEnd) break;
                                    contentElements.Add(current);
                                    current = current.NextSibling();
                                }
                                if (contentEnd != null && contentElements.All(e => e != contentEnd))
                                {
                                    contentElements.Add(contentEnd);
                                }
                            }
                            else
                            {
                                // No section properties - copy all elements
                                contentElements = tempBody.ChildElements.ToList();
                            }
                            
                            // Read image data while document is open
                            if (tempMainPart.ImageParts != null)
                            {
                                foreach (var imagePart in tempMainPart.ImageParts)
                                {
                                    using var imageStream = imagePart.GetStream();
                                    using var ms = new MemoryStream();
                                    imageStream.CopyTo(ms);
                                    imageDataList.Add((imagePart.ContentType, ms.ToArray()));
                                }
                            }
                        }
                    }

                    // Copy image data to final document
                    foreach (var (contentType, data) in imageDataList)
                    {
                        var newImagePart = mainPart.AddNewPart<ImagePart>(contentType);
                        using var ms = new MemoryStream(data);
                        newImagePart.FeedData(ms);
                    }

                    // Insert content elements directly into final document (clone to preserve styles)
                    foreach (var element in contentElements)
                    {
                        var clonedElement = (OpenXmlElement)element.CloneNode(true);
                        
                        if (insertionPoint != null)
                        {
                            insertionPoint.InsertAfterSelf(clonedElement);
                            insertionPoint = clonedElement;
                        }
                        else
                        {
                            body.AppendChild(clonedElement);
                            insertionPoint = clonedElement;
                        }
                    }

                    // Force a section break + page break to ensure next content starts on fresh page
                    // This isolates the section properties to prevent end page formatting overlap
                    OpenXmlParagraph sectionBreakPara2 = new OpenXmlParagraph();
                    OpenXmlParagraphProperties sectionBreakProps = new OpenXmlParagraphProperties();
                    sectionBreakProps.AppendChild(new SectionProperties());
                    sectionBreakPara2.AppendChild(sectionBreakProps);
                    
                    // Add page break in same paragraph
                    OpenXmlRun pageBreakRun = new OpenXmlRun();
                    pageBreakRun.AppendChild(new OpenXmlBreak() { Type = BreakValues.Page });
                    sectionBreakPara2.PrependChild(pageBreakRun);
                    
                    if (insertionPoint != null)
                    {
                        insertionPoint.InsertAfterSelf(sectionBreakPara2);
                        insertionPoint = sectionBreakPara2;
                    }
                    else
                    {
                        body.AppendChild(sectionBreakPara2);
                        insertionPoint = sectionBreakPara2;
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