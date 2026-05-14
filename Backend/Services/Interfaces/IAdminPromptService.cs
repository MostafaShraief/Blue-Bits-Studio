using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IAdminPromptService
{
    Task<IEnumerable<Prompt>> GetAllAsync();
    Task<Prompt> UpdatePromptTextAsync(int id, UpdatePromptRequest request);
}
