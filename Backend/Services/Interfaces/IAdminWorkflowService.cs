using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IAdminWorkflowService
{
    Task<IEnumerable<Workflow>> GetAllAsync();
    Task<Workflow> ToggleActiveAsync(int id, ToggleWorkflowRequest request);
}
