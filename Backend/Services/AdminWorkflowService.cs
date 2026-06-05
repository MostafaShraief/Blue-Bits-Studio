using System.Security.Claims;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminWorkflowService : IAdminWorkflowService
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<AdminWorkflowService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AdminWorkflowService(IWorkflowRepository workflowRepository, ILogger<AdminWorkflowService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetCurrentAdminId() =>
        int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

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
        _logger.LogInformation("Admin {AdminId} toggled workflow {WorkflowId} active to {IsActive}", GetCurrentAdminId(), id, request.IsActive);
        return workflow;
    }
}
