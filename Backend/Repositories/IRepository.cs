using System.Linq.Expressions;

namespace BlueBits.Api.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(object id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<int> SaveChangesAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
}
