using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IPromptService
{
    Task<string> CompilePromptAsync(string systemCode, string? generalNotes, List<string> fileNotes);
    Task<Prompt?> GetPromptForSessionAsync(int sessionId, string systemCode);
}
