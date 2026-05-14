using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class NoteRepository : GenericRepository<Note>, INoteRepository
{
    public NoteRepository(BlueBitsDbContext context) : base(context)
    {
    }
}
