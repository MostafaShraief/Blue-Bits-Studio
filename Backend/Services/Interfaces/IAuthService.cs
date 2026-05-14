using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IAuthService
{
    Task<(User user, string token, List<string> workflows)?> LoginAsync(string username, string password);
    Task<(User user, List<string> workflows)?> GetCurrentUserAsync(int userId);
}
