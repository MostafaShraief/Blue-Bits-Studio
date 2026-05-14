using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IAdminPermissionService
{
    Task<IEnumerable<WorkflowPermission>> GetAllAsync();
    Task<WorkflowPermission> CreateAsync(CreatePermissionRequest request);
    Task DeleteAsync(int id);
}
