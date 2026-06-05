using System.Security.Claims;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AdminMaterialService : IAdminMaterialService
{
    private readonly IMaterialRepository _materialRepository;
    private readonly ILogger<AdminMaterialService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AdminMaterialService(IMaterialRepository materialRepository, ILogger<AdminMaterialService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _materialRepository = materialRepository;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetCurrentAdminId() =>
        int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

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
        _logger.LogInformation("Admin {AdminId} created material {MaterialName} ({MaterialYear})", GetCurrentAdminId(), material.MaterialName, material.MaterialYear);
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
        _logger.LogInformation("Admin {AdminId} updated material {MaterialId} to {MaterialName} ({MaterialYear})", GetCurrentAdminId(), id, material.MaterialName, material.MaterialYear);
        return material;
    }

    public async Task DeleteAsync(int id)
    {
        var material = await _materialRepository.GetByIdAsync(id);
        if (material == null)
            throw new NotFoundException(nameof(Material), id);

        _materialRepository.Delete(material);
        await _materialRepository.SaveChangesAsync();
        _logger.LogInformation("Admin {AdminId} deleted material {MaterialId}", GetCurrentAdminId(), id);
    }
}
