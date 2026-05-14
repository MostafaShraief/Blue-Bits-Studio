using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminPermissionService : IAdminPermissionService
{
    private readonly IWorkflowPermissionRepository _permissionRepository;

    public AdminPermissionService(IWorkflowPermissionRepository permissionRepository)
    {
        _permissionRepository = permissionRepository;
    }

    public async Task<IEnumerable<WorkflowPermission>> GetAllAsync()
    {
        return await _permissionRepository.GetAllWithWorkflowAsync();
    }

    public async Task<WorkflowPermission> CreateAsync(CreatePermissionRequest request)
    {
        if (request.roleName != "TechMember" && request.roleName != "ScientificMember")
        {
            throw new InvalidOperationException("Role must be 'TechMember' or 'ScientificMember'");
        }

        var existing = await _permissionRepository.ExistsByRoleAndWorkflowAsync(request.roleName, request.workflowId);
        if (existing)
        {
            throw new InvalidOperationException("This role-to-workflow mapping already exists");
        }

        var permission = new WorkflowPermission
        {
            RoleName = request.roleName,
            WorkflowId = request.workflowId
        };

        await _permissionRepository.AddAsync(permission);
        await _permissionRepository.SaveChangesAsync();
        return permission;
    }

    public async Task DeleteAsync(int id)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);
        if (permission == null)
            throw new NotFoundException(nameof(WorkflowPermission), id);

        _permissionRepository.Delete(permission);
        await _permissionRepository.SaveChangesAsync();
    }
}
