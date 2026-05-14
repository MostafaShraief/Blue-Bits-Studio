using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IAdminMaterialService
{
    Task<IEnumerable<Material>> GetAllAsync();
    Task<Material?> GetByIdAsync(int id);
    Task<Material> CreateAsync(CreateMaterialRequest request);
    Task<Material> UpdateAsync(int id, UpdateMaterialRequest request);
    Task DeleteAsync(int id);
}
