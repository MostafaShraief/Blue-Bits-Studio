using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public interface ISessionRepository : IRepository<Session>
{
    Task<(IEnumerable<Session> Sessions, int TotalCount)> GetSessionsByUserIdPaginatedAsync(int userId, int page, int limit);
    Task<Session?> GetSessionWithAllIncludesAsync(int sessionId);
    Task<int> GetMaxOrderIndexAsync(int sessionId);
}
