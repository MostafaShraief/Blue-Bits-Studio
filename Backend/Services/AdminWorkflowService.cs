using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminWorkflowService : IAdminWorkflowService
{
    private readonly IWorkflowRepository _workflowRepository;

    public AdminWorkflowService(IWorkflowRepository workflowRepository)
    {
        _workflowRepository = workflowRepository;
    }

    public async Task<IEnumerable<Workflow>> GetAllAsync()
    {
        return await _workflowRepository.GetAllAsync();
    }

    public async Task<Workflow> ToggleActiveAsync(int id, ToggleWorkflowRequest request)
    {
        var workflow = await _workflowRepository.GetByIdAsync(id);
        if (workflow == null)
            throw new NotFoundException(nameof(Workflow), id);

        workflow.IsActive = request.IsActive ? 1 : 0;
        _workflowRepository.Update(workflow);
        await _workflowRepository.SaveChangesAsync();
        return workflow;
    }
}
