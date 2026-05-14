using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminPromptService : IAdminPromptService
{
    private readonly IPromptRepository _promptRepository;

    public AdminPromptService(IPromptRepository promptRepository)
    {
        _promptRepository = promptRepository;
    }

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
        return prompt;
    }
}
