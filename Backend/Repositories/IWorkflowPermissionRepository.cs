using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public interface IWorkflowPermissionRepository : IRepository<WorkflowPermission>
{
    Task<bool> ExistsByRoleAndWorkflowAsync(string role, int workflowId);
}
