using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class PromptRepository : GenericRepository<Prompt>, IPromptRepository
{
    public PromptRepository(BlueBitsDbContext context) : base(context)
    {
    }
}
