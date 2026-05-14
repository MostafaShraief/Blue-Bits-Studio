using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;

namespace BlueBits.Api.Services.Interfaces;

public interface IAdminUserService
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> CreateAsync(CreateUserRequest request);
    Task<User> UpdateAsync(int id, UpdateUserRequest request);
    Task DeleteAsync(int id);
}
