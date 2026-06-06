using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using BlueBits.Api.Services.Interfaces;
using System.Text;
using System.Linq;

namespace BlueBits.Api.Services;

public class PromptService : IPromptService
{
    private readonly BlueBitsDbContext _db;
    private readonly ILogger<PromptService> _logger;

    public PromptService(BlueBitsDbContext db, ILogger<PromptService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Prompt?> GetPromptForSessionAsync(int sessionId, string systemCode)
    {
        var session = await _db.Sessions.FindAsync(sessionId);
        if (session == null) return null;

        return await _db.Prompts
            .FirstOrDefaultAsync(p => p.WorkflowId == session.WorkflowId && (p.SystemCode == systemCode || p.Workflow.SystemCode == systemCode));
    }

    public async Task<string> CompilePromptAsync(string systemCode, string? generalNotes, List<string> fileNotes)
    {
        var promptEntity = await _db.Prompts
            .Include(p => p.Workflow)
            .FirstOrDefaultAsync(p => p.Workflow.SystemCode == systemCode || p.SystemCode == systemCode);

        string basePrompt = promptEntity?.PromptText ?? string.Empty;

        _logger.LogInformation("Compiling prompt using system code {SystemCode}", systemCode);
        _logger.LogDebug("Compiled prompt body: {PromptBody}", basePrompt);

        var sb = new StringBuilder(basePrompt);
        
        if (!string.IsNullOrWhiteSpace(generalNotes))
        {
            sb.AppendLine();
            sb.AppendLine(generalNotes);
        }

        if (fileNotes != null && fileNotes.Any(fn => !string.IsNullOrWhiteSpace(fn)))
        {
            sb.AppendLine();
            sb.AppendLine("--- File Specific Notes ---");
            for (int i = 0; i < fileNotes.Count; i++)
            {
                if (!string.IsNullOrWhiteSpace(fileNotes[i]))
                {
                    sb.AppendLine($"File {i + 1}: {fileNotes[i]}");
                }
            }
        }

        return sb.ToString().Trim();
    }
}
