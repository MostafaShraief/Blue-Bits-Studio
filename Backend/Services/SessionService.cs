using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.DTOs.Responses;
using BlueBits.Api.Services.Interfaces;
using File = BlueBits.Api.Models.File;

namespace BlueBits.Api.Services;

public class SessionService : ISessionService
{
    private readonly BlueBitsDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IPromptCompilationService _promptCompilationService;

    public SessionService(BlueBitsDbContext db, IWebHostEnvironment env, IPromptCompilationService promptCompilationService)
    {
        _db = db;
        _env = env;
        _promptCompilationService = promptCompilationService;
    }

    public async Task<SessionListResult> GetSessionsAsync(int userId, string role, int page, int limit)
    {
        if (role == "Admin")
            throw new ForbiddenException("Admins cannot access session list.");

        var query = _db.Sessions
            .Where(s => s.UserId == userId)
            .Where(s => _db.WorkflowPermissions
                .Any(p => p.RoleName == role && p.WorkflowId == s.WorkflowId));

        var totalCount = await query.CountAsync();

        var sessions = await query
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(s => new SessionSummaryDto
            {
                Id = s.SessionId,
                MaterialName = s.Material != null ? s.Material.MaterialName : "Unknown",
                WorkflowType = s.Workflow.SystemCode,
                CreatedAt = s.CreatedAt,
                LectureNumber = s.LectureNumber
            })
            .ToListAsync();

        return new SessionListResult
        {
            Sessions = sessions,
            TotalCount = totalCount,
            Page = page,
            Limit = limit,
            HasMore = (page * limit) < totalCount
        };
    }

    public async Task<SessionDetailResult> GetSessionAsync(int sessionId, int userId, string role)
    {
        var session = await _db.Sessions
            .Include(s => s.User)
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .Include(s => s.Workflow.Prompts)
            .Include(s => s.Notes)
            .Include(s => s.Files.OrderBy(f => f.OrderIndex))
            .Include(s => s.SessionContents)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
            throw new NotFoundException(nameof(Session), sessionId);

        if (session.UserId != userId)
            throw new ForbiddenException("You do not own this session.");

        var hasPermission = await _db.WorkflowPermissions
            .AnyAsync(p => p.RoleName == role && p.WorkflowId == session.WorkflowId);
        if (!hasPermission)
            throw new ForbiddenException("ليس لديك إذن للوصول إلى هذا النوع من الجلسات");

        var generalNotes = session.Notes.FirstOrDefault(n => n.NoteType == "GeneralNote")?.NoteText;
        var fileNotes = session.Notes.Where(n => n.NoteType == "FileNote").OrderBy(n => n.FileId).Select(n => n.NoteText).ToList();

        string targetSystemCode = session.Workflow.Prompts.FirstOrDefault()?.SystemCode ?? session.Workflow.SystemCode;

        var compiledPrompt = await _promptCompilationService.CompilePromptAsync(
            targetSystemCode,
            generalNotes,
            fileNotes
        );

        return new SessionDetailResult
        {
            Session = session,
            CompiledPrompt = compiledPrompt
        };
    }

    public async Task<CreateSessionResult> CreateSessionAsync(int userId, string role, CreateSessionRequest req)
    {
        if (role == "Admin")
            throw new ForbiddenException("Admins cannot create sessions.");

        var material = await _db.Materials
            .FirstOrDefaultAsync(m => m.MaterialName == req.MaterialName);
        if (material == null)
            throw new NotFoundException(nameof(Material), req.MaterialName);

        var workflow = await _db.Workflows
            .Include(w => w.Permissions)
            .FirstOrDefaultAsync(w => w.SystemCode == req.WorkflowSystemCode);

        if (workflow == null || workflow.IsActive == 0)
            throw new ForbiddenException("Invalid or inactive workflow.");

        if (!workflow.Permissions.Any(p => p.RoleName == role))
            throw new ForbiddenException("Role does not have permission for this workflow.");

        var session = new Session
        {
            UserId = userId,
            MaterialId = material.MaterialId,
            WorkflowId = workflow.WorkflowId,
            LectureNumber = req.LectureNumber,
            LectureType = req.LectureType
        };

        if (!string.IsNullOrEmpty(req.GeneralNotes))
            session.Notes.Add(new Note { NoteText = req.GeneralNotes, NoteType = "GeneralNote" });

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        return new CreateSessionResult
        {
            SessionId = session.SessionId,
            WorkflowId = session.WorkflowId
        };
    }

    public async Task SaveSessionContentAsync(int userId, int? sessionId, SaveSessionContentRequest req)
    {
        if (sessionId == null || sessionId == 0)
            throw new NotFoundException("Session ID is required.");

        var session = await _db.Sessions
            .Include(s => s.SessionContents)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
            throw new NotFoundException(nameof(Session), sessionId);

        if (session.UserId != userId)
            throw new ForbiddenException("You do not own this session.");

        var existingContent = session.SessionContents.FirstOrDefault();
        if (existingContent != null)
        {
            existingContent.ContentBody = req.ContentBody;
        }
        else
        {
            _db.SessionContents.Add(new SessionContent
            {
                SessionId = sessionId.Value,
                ContentBody = req.ContentBody
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task UploadFilesAsync(int sessionId, int userId, string role, IFormCollection form)
    {
        if (role == "Admin")
            throw new ForbiddenException("Admins cannot upload files.");

        var session = await _db.Sessions
            .Include(s => s.Files)
            .Include(s => s.Notes)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
            throw new NotFoundException(nameof(Session), sessionId);

        if (session.UserId != userId)
            throw new ForbiddenException("You do not own this session.");

        var files = form.Files.GetFiles("files");
        var notes = form["notes"];

        if (files == null || files.Count == 0)
            throw new NotFoundException("No files uploaded.");

        var uploadDir = Path.Combine(_env.ContentRootPath, "uploads", "sessions", sessionId.ToString());
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

            var fileEntity = new File
            {
                SessionId = sessionId,
                LocalFilePath = $"sessions/{sessionId}/{fileName}",
                FileType = fileType,
                OrderIndex = index
            };

            _db.Files.Add(fileEntity);
            await _db.SaveChangesAsync();

            if (notes.Count > i && !string.IsNullOrWhiteSpace(notes[i]))
            {
                _db.Notes.Add(new Note
                {
                    SessionId = sessionId,
                    NoteText = notes[i]!,
                    NoteType = "FileNote",
                    FileId = fileEntity.FileId
                });
            }

            index++;
        }

        await _db.SaveChangesAsync();
    }
}
