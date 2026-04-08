using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Endpoints;

public static class SessionsEndpoints
{
    public static RouteGroupBuilder MapSessionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", async (BlueBitsDbContext db) =>
        {
            return await db.Sessions
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.MaterialName,
                    s.LectureNumber,
                    s.Type,
                    s.WorkflowType,
                    s.CreatedAt
                })
                .ToListAsync();
        });

        group.MapGet("/{id}", async (Guid id, BlueBitsDbContext db) =>
        {
            var session = await db.Sessions
                .Include(s => s.Prompt)
                .Include(s => s.Notes)
                .Include(s => s.Images.OrderBy(i => i.OrderIndex))
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session is null) return Results.NotFound();
            return Results.Ok(session);
        });

        group.MapPost("/", async (BlueBitsDbContext db, CreateSessionRequest req) =>
        {
            var session = new Session
            {
                MaterialName = req.MaterialName,
                LectureNumber = req.LectureNumber,
                Type = req.Type,
                WorkflowType = req.WorkflowType
            };

            if (!string.IsNullOrEmpty(req.PromptText))
            {
                session.Prompt = new Prompt { PromptText = req.PromptText };
            }

            if (!string.IsNullOrEmpty(req.GeneralNotes))
            {
                session.Notes.Add(new Note { NoteText = req.GeneralNotes, NoteType = "General" });
            }

            // Notice: Image files uploading is complex if handled via a simple JSON POST.
            // For now, this handles creating records via JSON. 
            // In a real scenario with File objects, we would use a multipart/form-data endpoint 
            // or separate upload endpoint.
            if (req.ImageNotes != null)
            {
                foreach (var imgNote in req.ImageNotes)
                {
                    // Since we don't have binary upload here yet, we just store the note
                    session.Notes.Add(new Note 
                    { 
                        NoteText = imgNote.Note ?? string.Empty, 
                        NoteType = "ImageLinked" 
                    });
                }
            }

            db.Sessions.Add(session);
            await db.SaveChangesAsync();

            return Results.Created($"/api/sessions/{session.Id}", session);
        });

        group.MapPost("/{id}/images", async (Guid id, HttpRequest request, BlueBitsDbContext db, IWebHostEnvironment env) =>
        {
            var session = await db.Sessions
                .Include(s => s.Images)
                .Include(s => s.Notes)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session is null) return Results.NotFound();

            if (!request.HasFormContentType) return Results.BadRequest("Expected form data.");

            var form = await request.ReadFormAsync();
            var images = form.Files.GetFiles("images");
            var notes = form["notes"];

            if (images == null || images.Count == 0) return Results.BadRequest("No images uploaded.");

            var sessionUploadPath = Path.Combine(env.ContentRootPath, "uploads", "sessions", id.ToString());
            if (!Directory.Exists(sessionUploadPath))
            {
                Directory.CreateDirectory(sessionUploadPath);
            }

            int index = session.Images.Count;

            for (int i = 0; i < images.Count; i++)
            {
                var file = images[i];
                var extension = Path.GetExtension(file.FileName);
                if (string.IsNullOrEmpty(extension)) extension = ".png"; // default for pasted images
                var fileName = $"image-{index}{extension}";
                var localFilePath = Path.Combine(sessionUploadPath, fileName);

                using (var stream = new FileStream(localFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create Image entity
                var imageEntity = new Image
                {
                    SessionId = id,
                    LocalFilePath = $"sessions/{id}/{fileName}",
                    OrderIndex = index
                };

                db.Images.Add(imageEntity);

                // Check if a corresponding note exists
                if (notes.Count > i && !string.IsNullOrWhiteSpace(notes[i]))
                {
                    db.Notes.Add(new Note
                    {
                        SessionId = id,
                        NoteText = notes[i]!,
                        NoteType = $"Image-{index}" // Note type referencing the image index
                    });
                }

                index++;
            }

            await db.SaveChangesAsync();

            return Results.Ok(session.Images);
        }).DisableAntiforgery(); // Important for IFormFile mapping in minimal APIs

        group.MapDelete("/{id}", async (Guid id, BlueBitsDbContext db, IWebHostEnvironment env) =>
        {
            var session = await db.Sessions
                .Include(s => s.Images)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session is null) return Results.NotFound();

            // Delete files first
            foreach (var img in session.Images)
            {
                if (!string.IsNullOrEmpty(img.LocalFilePath))
                {
                    var filePath = Path.Combine(env.ContentRootPath, "uploads", img.LocalFilePath);
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }
            }

            db.Sessions.Remove(session);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        return group;
    }
}

public class CreateSessionRequest
{
    public string MaterialName { get; set; } = string.Empty;
    public string LectureNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string WorkflowType { get; set; } = string.Empty;
    public string PromptText { get; set; } = string.Empty;
    public string GeneralNotes { get; set; } = string.Empty;
    public List<ImageNoteDto>? ImageNotes { get; set; }
}

public class ImageNoteDto
{
    public string? Note { get; set; }
}
