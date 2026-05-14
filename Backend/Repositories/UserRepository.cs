using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    private readonly BlueBitsDbContext _context;

    public UserRepository(BlueBitsDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<bool> ExistsByTelegramAndRoleAsync(string telegramUsername, string role)
    {
        return await _context.Users.AnyAsync(u => u.TelegramUsername == telegramUsername && u.UserRole == role);
    }
}
