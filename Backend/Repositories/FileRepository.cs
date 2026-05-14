using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using File = BlueBits.Api.Models.File;

namespace BlueBits.Api.Repositories;

public class FileRepository : GenericRepository<File>, IFileRepository
{
    private readonly BlueBitsDbContext _context;

    public FileRepository(BlueBitsDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<string>> GetAllLocalPathsAsync()
    {
        return await _context.Files
            .Select(f => f.LocalFilePath)
            .ToListAsync();
    }
}
