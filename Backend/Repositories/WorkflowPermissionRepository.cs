using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class WorkflowPermissionRepository : GenericRepository<WorkflowPermission>, IWorkflowPermissionRepository
{
    private readonly BlueBitsDbContext _context;

    public WorkflowPermissionRepository(BlueBitsDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByRoleAndWorkflowAsync(string role, int workflowId)
    {
        return await _context.WorkflowPermissions
            .AnyAsync(p => p.RoleName == role && p.WorkflowId == workflowId);
    }

    public async Task<IEnumerable<WorkflowPermission>> GetAllWithWorkflowAsync()
    {
        return await _context.WorkflowPermissions
            .Include(p => p.Workflow)
            .ToListAsync();
    }
}
