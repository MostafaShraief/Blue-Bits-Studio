using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using BlueBits.Api.Services;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IPromptCompilationService _promptCompilationService;

    public SessionsController(BlueBitsDbContext db, IWebHostEnvironment env, IPromptCompilationService promptCompilationService)
    {
        _db = db;
        _env = env;
        _promptCompilationService = promptCompilationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var query = _db.Sessions.AsQueryable();
        if (role != "Admin")
        {
            query = query.Where(s => s.UserId == userId);
        }

        var sessions = await query
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SessionSummaryDto
            {
                Id = s.SessionId,
                MaterialName = s.Material != null ? s.Material.MaterialName : "Unknown",
                WorkflowType = s.Workflow.SystemCode,
                CreatedAt = s.CreatedAt,
                LectureNumber = s.LectureNumber
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSession(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var session = await _db.Sessions
            .Include(s => s.User)
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .Include(s => s.Workflow.Prompts)
            .Include(s => s.Notes)
            .Include(s => s.Files.OrderBy(f => f.OrderIndex))
            .FirstOrDefaultAsync(s => s.SessionId == id);

        if (session == null) return NotFound();
        if (role != "Admin" && session.UserId != userId) return Forbid();

        var generalNotes = session.Notes.FirstOrDefault(n => n.NoteType == "GeneralNote")?.NoteText;
        var fileNotes = session.Notes.Where(n => n.NoteType == "FileNote").OrderBy(n => n.FileId).Select(n => n.NoteText).ToList();

        // Default to the first prompt associated with this workflow, or fallback to workflow's system code
        string targetSystemCode = session.Workflow.Prompts.FirstOrDefault()?.SystemCode ?? session.Workflow.SystemCode;

        var compiledPrompt = await _promptCompilationService.CompilePromptAsync(
            targetSystemCode,
            generalNotes,
            fileNotes
        );

        var result = new
        {
            id = session.SessionId,
            sessionId = session.SessionId,
            session.UserId,
            session.MaterialId,
            session.WorkflowId,
            lectureNumber = session.LectureNumber,
            lectureType = session.LectureType,
            quizData = session.QuizData,
            createdAt = session.CreatedAt,
            session.User,
            session.Material,
            session.Workflow,
            session.Files,
            session.Notes,
            compiledPrompt = compiledPrompt
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest req)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(userIdStr) || string.IsNullOrEmpty(role))
            return Unauthorized();
            
        int userId = int.Parse(userIdStr);

        var workflow = await _db.Workflows
            .Include(w => w.Permissions)
            .FirstOrDefaultAsync(w => w.SystemCode == req.WorkflowSystemCode);

        if (workflow == null || workflow.IsActive == 0)
            return BadRequest(new { message = "Invalid or inactive workflow." });

        if (role != "Admin" && !workflow.Permissions.Any(p => p.RoleName == role))
            return Forbid();

        int? materialId = null;
        if (!string.IsNullOrWhiteSpace(req.MaterialName))
        {
            var material = await _db.Materials
                .FirstOrDefaultAsync(m => m.MaterialName == req.MaterialName);
            if (material != null)
                materialId = material.MaterialId;
        }

        var session = new Session
        {
            UserId = userId,
            MaterialId = materialId,
            WorkflowId = workflow.WorkflowId,
            LectureNumber = req.LectureNumber,
            LectureType = req.LectureType,
            QuizData = req.QuizData
        };

        if (!string.IsNullOrEmpty(req.GeneralNotes))
            session.Notes.Add(new Note { NoteText = req.GeneralNotes, NoteType = "GeneralNote" });

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        return Created($"/api/sessions/{session.SessionId}", new { session.SessionId, session.WorkflowId });
    }

    [HttpPost("{id}/files")]
    public async Task<IActionResult> UploadFiles(int id, [FromForm] IFormCollection form)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);
        
        var session = await _db.Sessions
            .Include(s => s.Files)
            .Include(s => s.Notes)
            .FirstOrDefaultAsync(s => s.SessionId == id);

        if (session == null) return NotFound();
        if (session.UserId != userId && role != "Admin") return Forbid();

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
            await _db.SaveChangesAsync();

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
}

// DTO for creating a session
public class CreateSessionRequest
{
    public required string WorkflowSystemCode { get; set; }
    public required string MaterialName { get; set; }
    public required int LectureNumber { get; set; }
    public required string LectureType { get; set; }
    public string? QuizData { get; set; }
    public string? GeneralNotes { get; set; }
}

// DTO for session list summary (lightweight - avoids fetching heavy fields like QuizData, CompiledPrompt)
public class SessionSummaryDto
{
    public int Id { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public string WorkflowType { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public int LectureNumber { get; set; }
}
