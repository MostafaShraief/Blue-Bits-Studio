using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> ExistsByTelegramAndRoleAsync(string telegramUsername, string role);
}
