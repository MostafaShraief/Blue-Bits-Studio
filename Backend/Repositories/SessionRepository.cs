using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class SessionRepository : GenericRepository<Session>, ISessionRepository
{
    private readonly BlueBitsDbContext _context;

    public SessionRepository(BlueBitsDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<Session> Sessions, int TotalCount)> GetSessionsByUserIdPaginatedAsync(int userId, int page, int limit)
    {
        var query = _context.Sessions
            .Where(s => s.UserId == userId);

        var totalCount = await query.CountAsync();

        var sessions = await query
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return (sessions, totalCount);
    }

    public async Task<Session?> GetSessionWithAllIncludesAsync(int sessionId)
    {
        return await _context.Sessions
            .Include(s => s.User)
            .Include(s => s.Material)
            .Include(s => s.Workflow)
            .Include(s => s.Workflow.Prompts)
            .Include(s => s.Notes)
            .Include(s => s.Files.OrderBy(f => f.OrderIndex))
            .Include(s => s.SessionContents)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);
    }

    public async Task<int> GetMaxOrderIndexAsync(int sessionId)
    {
        var files = _context.Files.Where(f => f.SessionId == sessionId);
        var maxOrder = await files.MaxAsync(f => (int?)f.OrderIndex);
        return maxOrder ?? 0;
    }
}
