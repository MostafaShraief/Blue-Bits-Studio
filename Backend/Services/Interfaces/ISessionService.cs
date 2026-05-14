using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.DTOs.Responses;
using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface ISessionService
{
    Task<SessionListResult> GetSessionsAsync(int userId, string role, int page, int limit);
    Task<SessionDetailResult> GetSessionAsync(int sessionId, int userId, string role);
    Task<CreateSessionResult> CreateSessionAsync(int userId, string role, CreateSessionRequest req);
    Task SaveSessionContentAsync(int userId, int? sessionId, SaveSessionContentRequest req);
    Task UploadFilesAsync(int sessionId, int userId, string role, IFormCollection form);
}

public record SessionListResult
{
    public required IEnumerable<SessionSummaryDto> Sessions { get; init; }
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int Limit { get; init; }
    public bool HasMore { get; init; }
}

public record SessionDetailResult
{
    public required Session Session { get; init; }
    public string? CompiledPrompt { get; init; }
}

public record CreateSessionResult
{
    public int SessionId { get; init; }
    public int WorkflowId { get; init; }
}
