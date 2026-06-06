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
    private readonly IPromptService _promptService;
    private readonly ILogger<SessionService> _logger;

    public SessionService(BlueBitsDbContext db, IWebHostEnvironment env, IPromptService promptCompilationService, ILogger<SessionService> logger)
    {
        _db = db;
        _env = env;
        _promptService = promptCompilationService;
        _logger = logger;
    }

    public async Task<SessionListResult> GetSessionsAsync(int userId, string role, int page, int limit)
    {
        if (role == "Admin")
        {
            _logger.LogWarning("Admin user {UserId} attempted to access session list", userId);
            throw new ForbiddenException("Admins cannot access session list.");
        }

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
                LectureNumber = s.LectureNumber,
                LectureType = s.LectureType
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
        {
            _logger.LogWarning("Session {SessionId} not found for user {UserId}", sessionId, userId);
            throw new NotFoundException(nameof(Session), sessionId);
        }

        if (session.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to access session {SessionId} owned by {OwnerId}", userId, sessionId, session.UserId);
            throw new ForbiddenException("You do not own this session.");
        }

        var hasPermission = await _db.WorkflowPermissions
            .AnyAsync(p => p.RoleName == role && p.WorkflowId == session.WorkflowId);
        if (!hasPermission)
        {
            _logger.LogWarning("User {UserId} with role {Role} lacks permission for session {SessionId} workflow {WorkflowId}", userId, role, sessionId, session.WorkflowId);
            throw new ForbiddenException("ليس لديك إذن للوصول إلى هذا النوع من الجلسات");
        }

        var generalNotes = session.Notes.FirstOrDefault(n => n.NoteType == "GeneralNote")?.NoteText;
        var fileNotes = session.Notes.Where(n => n.NoteType == "FileNote").OrderBy(n => n.FileId).Select(n => n.NoteText).ToList();

        string targetSystemCode = session.Workflow.Prompts.FirstOrDefault()?.SystemCode ?? session.Workflow.SystemCode;

        var compiledPrompt = await _promptService.CompilePromptAsync(
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
        {
            _logger.LogWarning("Admin user {UserId} attempted to create a session", userId);
            throw new ForbiddenException("Admins cannot create sessions.");
        }

        var material = await _db.Materials
            .FirstOrDefaultAsync(m => m.MaterialName == req.MaterialName);
        if (material == null)
        {
            _logger.LogWarning("Material {MaterialName} not found for session creation by user {UserId}", req.MaterialName, userId);
            throw new NotFoundException(nameof(Material), req.MaterialName);
        }

        var workflow = await _db.Workflows
            .Include(w => w.Permissions)
            .FirstOrDefaultAsync(w => w.SystemCode == req.WorkflowSystemCode);

        if (workflow == null || workflow.IsActive == 0)
        {
            _logger.LogWarning("Invalid or inactive workflow {SystemCode} for user {UserId}", req.WorkflowSystemCode, userId);
            throw new ForbiddenException("Invalid or inactive workflow.");
        }

        if (!workflow.Permissions.Any(p => p.RoleName == role))
        {
            _logger.LogWarning("User {UserId} with role {Role} lacks permission for workflow {SystemCode}", userId, role, req.WorkflowSystemCode);
            throw new ForbiddenException("Role does not have permission for this workflow.");
        }

        // --- Enforce per-user session limit ---
        var existingCount = await _db.Sessions
            .CountAsync(s => s.UserId == userId && s.WorkflowId == workflow.WorkflowId);

        if (existingCount >= workflow.MaxSessionsPerUser)
        {
            var toPrune = await _db.Sessions
                .Where(s => s.UserId == userId && s.WorkflowId == workflow.WorkflowId)
                .OrderBy(s => s.CreatedAt)
                .Take(existingCount - workflow.MaxSessionsPerUser + 1)
                .ToListAsync();

            var pruneIds = toPrune.Select(s => s.SessionId).ToList();

            // Delete physical files from disk
            foreach (var sid in pruneIds)
            {
                var dir = Path.Combine(_env.ContentRootPath, "uploads", "sessions", sid.ToString());
                if (Directory.Exists(dir))
                {
                    Directory.Delete(dir, recursive: true);
                    _logger.LogInformation("Deleted physical files for session {SessionId} (limit pruning)", sid);
                }
            }

            // Delete associated DB records (Session rows stay for counting)
            var files = await _db.Files.Where(f => pruneIds.Contains(f.SessionId)).ToListAsync();
            _db.Files.RemoveRange(files);

            var notes = await _db.Notes.Where(n => pruneIds.Contains(n.SessionId)).ToListAsync();
            _db.Notes.RemoveRange(notes);

            var contents = await _db.SessionContents.Where(sc => pruneIds.Contains(sc.SessionId)).ToListAsync();
            _db.SessionContents.RemoveRange(contents);

            await _db.SaveChangesAsync();

            _logger.LogInformation("Pruned data for {Count} old session(s) of workflow {SystemCode} for user {UserId}", pruneIds.Count, req.WorkflowSystemCode, userId);
        }

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

        _logger.LogInformation("User {UserId} created session {SessionId} for material {MaterialName}, workflow {WorkflowSystemCode}, lecture {LectureNumber}", userId, session.SessionId, req.MaterialName, req.WorkflowSystemCode, req.LectureNumber);

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
        {
            _logger.LogWarning("Session {SessionId} not found for SaveSessionContent by user {UserId}", sessionId, userId);
            throw new NotFoundException(nameof(Session), sessionId);
        }

        if (session.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to save content to session {SessionId} owned by {OwnerId}", userId, sessionId, session.UserId);
            throw new ForbiddenException("You do not own this session.");
        }

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
        _logger.LogInformation("User {UserId} saved content to session {SessionId}", userId, sessionId);
    }

    public async Task DeleteSessionAsync(int sessionId, int userId, string role)
    {
        if (role == "Admin")
        {
            _logger.LogWarning("Admin user {UserId} attempted to delete session {SessionId}", userId, sessionId);
            throw new ForbiddenException("Admins cannot delete sessions.");
        }

        var session = await _db.Sessions
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for deletion by user {UserId}", sessionId, userId);
            throw new NotFoundException(nameof(Session), sessionId);
        }

        if (session.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to delete session {SessionId} owned by {OwnerId}", userId, sessionId, session.UserId);
            throw new ForbiddenException("You do not own this session.");
        }

        _db.Sessions.Remove(session);
        await _db.SaveChangesAsync();
        _logger.LogInformation("User {UserId} deleted session {SessionId}", userId, sessionId);
    }

    public async Task UploadFilesAsync(int sessionId, int userId, string role, IFormCollection form)
    {
        if (role == "Admin")
        {
            _logger.LogWarning("Admin user {UserId} attempted to upload files to session {SessionId}", userId, sessionId);
            throw new ForbiddenException("Admins cannot upload files.");
        }

        var session = await _db.Sessions
            .Include(s => s.Files)
            .Include(s => s.Notes)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for file upload by user {UserId}", sessionId, userId);
            throw new NotFoundException(nameof(Session), sessionId);
        }

        if (session.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to upload files to session {SessionId} owned by {OwnerId}", userId, sessionId, session.UserId);
            throw new ForbiddenException("You do not own this session.");
        }

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

        var extensions = files.Select(f => Path.GetExtension(f.FileName)?.ToLowerInvariant()).Where(e => e != null);
        _logger.LogInformation("User {UserId} uploaded {FileCount} files to session {SessionId}. Extensions: {Extensions}", userId, files.Count, sessionId, string.Join(", ", extensions));
    }
}
