using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using System.Text;
using System.Linq;

namespace BlueBits.Api.Services;

public interface IPromptCompilationService
{
    Task<string> CompilePromptAsync(string systemCode, string? generalNotes, List<string> fileNotes);
}

public class PromptCompilationService : IPromptCompilationService
{
    private readonly BlueBitsDbContext _db;

    public PromptCompilationService(BlueBitsDbContext db)
    {
        _db = db;
    }

    public async Task<string> CompilePromptAsync(string systemCode, string? generalNotes, List<string> fileNotes)
    {
        // We look up the prompt by the WORKFLOW's SystemCode, since usually one main prompt per workflow
        // Or if the systemCode passed IS the Prompt's SystemCode, we check both just in case.
        var promptEntity = await _db.Prompts
            .Include(p => p.Workflow)
            .FirstOrDefaultAsync(p => p.Workflow.SystemCode == systemCode || p.SystemCode == systemCode);

        string basePrompt = promptEntity?.PromptText ?? string.Empty;

        var sb = new StringBuilder(basePrompt);
        
        if (!string.IsNullOrWhiteSpace(generalNotes))
        {
            sb.AppendLine();
            sb.AppendLine("--- General User Instructions ---");
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
