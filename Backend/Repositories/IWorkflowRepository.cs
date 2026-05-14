using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public interface IWorkflowRepository : IRepository<Workflow>
{
    Task<Workflow?> GetBySystemCodeAsync(string systemCode);
    Task<IEnumerable<Workflow>> GetActiveWorkflowsForRoleAsync(string role);
}
