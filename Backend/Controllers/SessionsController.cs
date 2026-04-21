using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;
    private readonly IWebHostEnvironment _env;

    public SessionsController(BlueBitsDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var role = User.FindFirstValue(ClaimTypes.Role);

        // Non-admins can only see their own sessions
        var query = _db.Sessions.AsQueryable();
        if (role != "Admin")
        {
            query = query.Where(s => s.UserId == userId);
        }

        var sessions = await query
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.SessionId,
                MaterialName = s.Material != null ? s.Material.MaterialName : "Unknown",
                s.LectureNumber,
                Type = s.LectureType,
                WorkflowType = s.Workflow.SystemCode,
                s.QuizData,
                s.CreatedAt
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSession(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var role = User.FindFirstValue(ClaimTypes.Role);

        var session = await _db.Sessions
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .Include(s => s.Workflow.Prompts)
            .Include(s => s.Notes)
            .Include(s => s.Files.OrderBy(f => f.OrderIndex))
            .FirstOrDefaultAsync(s => s.SessionId == id);

        if (session == null) return NotFound();
        if (role != "Admin" && session.UserId != userId) return Forbid();

        return Ok(session);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest req)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(userIdStr) || string.IsNullOrEmpty(role))
            return Unauthorized();
            
        int userId = int.Parse(userIdStr);

        // Dynamically find Workflow by SystemCode
        var workflow = await _db.Workflows
            .Include(w => w.Permissions)
            .FirstOrDefaultAsync(w => w.SystemCode == req.WorkflowSystemCode);

        if (workflow == null || workflow.IsActive == 0)
        {
            return BadRequest(new { message = "Invalid or inactive workflow." });
        }

        // RBAC Enforcement
        if (role != "Admin" && !workflow.Permissions.Any(p => p.RoleName == role))
        {
            return Forbid();
        }

        var session = new Session
        {
            UserId = userId,
            MaterialId = req.MaterialId,
            WorkflowId = workflow.WorkflowId,
            LectureNumber = req.LectureNumber,
            LectureType = req.LectureType,
            QuizData = req.QuizData
        };

        if (!string.IsNullOrEmpty(req.GeneralNotes))
        {
            session.Notes.Add(new Note { NoteText = req.GeneralNotes, NoteType = "GeneralNote" });
        }

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        return Created($"/api/sessions/{session.SessionId}", new { session.SessionId, session.WorkflowId });
    }

    [HttpPost("{id}/files")]
    public async Task<IActionResult> UploadFiles(int id, [FromForm] IFormCollection form)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        
        var session = await _db.Sessions
            .Include(s => s.Files)
            .Include(s => s.Notes)
            .FirstOrDefaultAsync(s => s.SessionId == id);

        if (session == null) return NotFound();
        if (session.UserId != userId && User.FindFirstValue(ClaimTypes.Role) != "Admin") return Forbid();

        var files = form.Files.GetFiles("files");
        var notes = form["notes"];

        if (files == null || files.Count == 0) return BadRequest("No files uploaded.");

        var uploadDir = Path.Combine(_env.ContentRootPath, "uploads", "sessions", id.ToString());
        if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

        int index = session.Files.Count;

        for (int i = 0; i < files.Count; i++)
        {
            var file = files[i];
            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(extension)) extension = ".png";
            
            var fileName = $"file-{index}{extension}";
            var localFilePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(localFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var isImage = new[] { ".png", ".jpg", ".jpeg", ".gif", ".webp" }.Contains(extension.ToLower());
            var isDocx = extension.ToLower() == ".docx";
            var fileType = isImage ? "Image" : (isDocx ? "Docx" : "Other");

            var fileEntity = new Models.File
            {
                SessionId = id,
                LocalFilePath = Path.GetFullPath(localFilePath),
                FileType = fileType,
                OrderIndex = index
            };

            _db.Files.Add(fileEntity);
            await _db.SaveChangesAsync(); // save immediately to get FileId

            if (notes.Count > i && !string.IsNullOrWhiteSpace(notes[i]))
            {
                _db.Notes.Add(new Note
                {
                    SessionId = id,
                    NoteText = notes[i]!,
                    NoteType = "FileNote",
                    FileId = fileEntity.FileId
                });
            }

            index++;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var role = User.FindFirstValue(ClaimTypes.Role);

        var session = await _db.Sessions.FindAsync(id);
        if (session == null) return NotFound();

        if (role != "Admin" && session.UserId != userId) return Forbid();

        // Note: The physical files will be caught by the nightly OrphanFileCleanupService
        _db.Sessions.Remove(session);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateSessionRequest
{
    public int? MaterialId { get; set; }
    public string WorkflowSystemCode { get; set; } = string.Empty;
    public int LectureNumber { get; set; }
    public string LectureType { get; set; } = string.Empty; // Theoretical or Practical
    public string? QuizData { get; set; }
    public string GeneralNotes { get; set; } = string.Empty;
}