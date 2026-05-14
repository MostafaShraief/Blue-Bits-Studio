using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminMaterialService : IAdminMaterialService
{
    private readonly IMaterialRepository _materialRepository;

    public AdminMaterialService(IMaterialRepository materialRepository)
    {
        _materialRepository = materialRepository;
    }

    public async Task<IEnumerable<Material>> GetAllAsync()
    {
        return await _materialRepository.GetAllAsync();
    }

    public async Task<Material?> GetByIdAsync(int id)
    {
        return await _materialRepository.GetByIdAsync(id);
    }

    public async Task<Material> CreateAsync(CreateMaterialRequest request)
    {
        var material = new Material
        {
            MaterialName = request.MaterialName,
            MaterialYear = request.MaterialYear
        };

        await _materialRepository.AddAsync(material);
        await _materialRepository.SaveChangesAsync();
        return material;
    }

    public async Task<Material> UpdateAsync(int id, UpdateMaterialRequest request)
    {
        var material = await _materialRepository.GetByIdAsync(id);
        if (material == null)
            throw new NotFoundException(nameof(Material), id);

        material.MaterialName = request.MaterialName;
        material.MaterialYear = request.MaterialYear;

        _materialRepository.Update(material);
        await _materialRepository.SaveChangesAsync();
        return material;
    }

    public async Task DeleteAsync(int id)
    {
        var material = await _materialRepository.GetByIdAsync(id);
        if (material == null)
            throw new NotFoundException(nameof(Material), id);

        _materialRepository.Delete(material);
        await _materialRepository.SaveChangesAsync();
    }
}
