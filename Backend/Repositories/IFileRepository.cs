using File = BlueBits.Api.Models.File;

namespace BlueBits.Api.Repositories;

public interface IFileRepository : IRepository<File>
{
    Task<List<string>> GetAllLocalPathsAsync();
}
