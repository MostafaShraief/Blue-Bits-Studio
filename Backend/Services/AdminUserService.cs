using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Exceptions;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace BlueBits.Api.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AdminUserService> _logger;

    public AdminUserService(IUserRepository userRepository, ILogger<AdminUserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _userRepository.GetAllAsync();
    }

    public async Task<User> CreateAsync(CreateUserRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.TelegramUsername))
        {
            if (!request.TelegramUsername.StartsWith("@"))
            {
                request.TelegramUsername = "@" + request.TelegramUsername;
            }

            var exists = await _userRepository.ExistsByTelegramAndRoleAsync(
                request.TelegramUsername, request.UserRole);
            if (exists)
            {
                _logger.LogWarning(
                    "CreateUser failed: TelegramUsername '{Telegram}' already exists with role {Role}",
                    request.TelegramUsername, request.UserRole);
                throw new InvalidOperationException(
                    $"Telegram username '{request.TelegramUsername}' is already registered with role '{request.UserRole}'");
            }
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            Password = request.Password,
            UserRole = request.UserRole,
            BatchNumber = request.BatchNumber,
            TelegramUsername = request.TelegramUsername,
            TeamJoinDate = request.TeamJoinDate,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException(nameof(User), id);

        if (!string.IsNullOrWhiteSpace(request.TelegramUsername))
        {
            if (!request.TelegramUsername.StartsWith("@"))
            {
                request.TelegramUsername = "@" + request.TelegramUsername;
            }

            var exists = await _userRepository.ExistsByTelegramAndRoleAsync(
                request.TelegramUsername, request.UserRole);
            if (exists && user.UserId != id)
            {
                _logger.LogWarning(
                    "UpdateUser failed: TelegramUsername '{Telegram}' already exists with role {Role}",
                    request.TelegramUsername, request.UserRole);
                throw new InvalidOperationException(
                    $"Telegram username '{request.TelegramUsername}' is already registered with role '{request.UserRole}'");
            }
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.UserRole = request.UserRole;
        user.BatchNumber = request.BatchNumber;
        user.TelegramUsername = request.TelegramUsername;

        if (!string.IsNullOrWhiteSpace(request.TeamJoinDate))
        {
            user.TeamJoinDate = request.TeamJoinDate;
        }

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.Password = request.Password;
        }

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
        return user;
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException(nameof(User), id);

        _userRepository.Delete(user);
        await _userRepository.SaveChangesAsync();
    }
}
