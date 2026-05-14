using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class MaterialService : IMaterialService
{
    private readonly IMaterialRepository _materialRepository;

    public MaterialService(IMaterialRepository materialRepository)
    {
        _materialRepository = materialRepository;
    }

    public async Task<List<string>> GetDistinctMaterialNamesAsync()
    {
        var materials = await _materialRepository.GetAllAsync();
        return materials
            .Select(m => m.MaterialName)
            .Distinct()
            .OrderBy(name => name)
            .ToList();
    }
}
