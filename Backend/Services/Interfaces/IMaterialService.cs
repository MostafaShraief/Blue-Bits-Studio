namespace BlueBits.Api.Services.Interfaces;

public interface IMaterialService
{
    Task<List<string>> GetDistinctMaterialNamesAsync();
}
