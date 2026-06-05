using System.Security.Claims;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminPromptService : IAdminPromptService
{
    private readonly IPromptRepository _promptRepository;
    private readonly ILogger<AdminPromptService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AdminPromptService(IPromptRepository promptRepository, ILogger<AdminPromptService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _promptRepository = promptRepository;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetCurrentAdminId() =>
        int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    public async Task<IEnumerable<Prompt>> GetAllAsync()
    {
        return await _promptRepository.GetAllAsync();
    }

    public async Task<Prompt> UpdatePromptTextAsync(int id, UpdatePromptRequest request)
    {
        var prompt = await _promptRepository.GetByIdAsync(id);
        if (prompt == null)
            throw new NotFoundException(nameof(Prompt), id);

        prompt.PromptText = request.PromptText;
        _promptRepository.Update(prompt);
        await _promptRepository.SaveChangesAsync();
        _logger.LogInformation("Admin {AdminId} updated prompt {PromptId} for workflow {WorkflowId}", GetCurrentAdminId(), id, prompt.WorkflowId);
        return prompt;
    }
}
