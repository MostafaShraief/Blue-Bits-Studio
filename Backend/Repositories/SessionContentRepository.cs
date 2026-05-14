using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class SessionContentRepository : GenericRepository<SessionContent>, ISessionContentRepository
{
    public SessionContentRepository(BlueBitsDbContext context) : base(context)
    {
    }
}
