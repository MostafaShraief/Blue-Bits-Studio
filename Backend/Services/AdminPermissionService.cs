using System.Security.Claims;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminPermissionService : IAdminPermissionService
{
    private readonly IWorkflowPermissionRepository _permissionRepository;
    private readonly ILogger<AdminPermissionService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AdminPermissionService(IWorkflowPermissionRepository permissionRepository, ILogger<AdminPermissionService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _permissionRepository = permissionRepository;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetCurrentAdminId() =>
        int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    public async Task<IEnumerable<WorkflowPermission>> GetAllAsync()
    {
        return await _permissionRepository.GetAllWithWorkflowAsync();
    }

    public async Task<WorkflowPermission> CreateAsync(CreatePermissionRequest request)
    {
        if (request.roleName != "TechMember" && request.roleName != "ScientificMember")
        {
            throw new InvalidOperationException("يجب أن يكون الدور 'TechMember' أو 'ScientificMember'");
        }

        var existing = await _permissionRepository.ExistsByRoleAndWorkflowAsync(request.roleName, request.workflowId);
        if (existing)
        {
            throw new InvalidOperationException("هذا الربط بين الدور والسير موجود مسبقاً");
        }

        var permission = new WorkflowPermission
        {
            RoleName = request.roleName,
            WorkflowId = request.workflowId
        };

        await _permissionRepository.AddAsync(permission);
        await _permissionRepository.SaveChangesAsync();
        _logger.LogInformation("Admin {AdminId} granted {Role} permission to workflow {WorkflowId}", GetCurrentAdminId(), request.roleName, request.workflowId);
        return permission;
    }

    public async Task DeleteAsync(int id)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);
        if (permission == null)
            throw new NotFoundException(nameof(WorkflowPermission), id);

        _permissionRepository.Delete(permission);
        await _permissionRepository.SaveChangesAsync();
        _logger.LogInformation("Admin {AdminId} revoked permission {PermissionId} ({Role} -> Workflow {WorkflowId})", GetCurrentAdminId(), id, permission.RoleName, permission.WorkflowId);
    }
}
