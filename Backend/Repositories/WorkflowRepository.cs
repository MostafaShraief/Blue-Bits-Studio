using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class WorkflowRepository : GenericRepository<Workflow>, IWorkflowRepository
{
    private readonly BlueBitsDbContext _context;

    public WorkflowRepository(BlueBitsDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Workflow?> GetBySystemCodeAsync(string systemCode)
    {
        return await _context.Workflows
            .Include(w => w.Permissions)
            .FirstOrDefaultAsync(w => w.SystemCode == systemCode);
    }

    public async Task<IEnumerable<Workflow>> GetActiveWorkflowsForRoleAsync(string role)
    {
        return await _context.Workflows
            .Where(w => w.IsActive == 1 && w.Permissions.Any(p => p.RoleName == role))
            .ToListAsync();
    }
}
