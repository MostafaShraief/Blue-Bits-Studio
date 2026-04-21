using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // --- USER MANAGEMENT ---
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _db.Users.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = new User
        {
            FirstName = request.firstName,
            LastName = request.lastName,
            Username = request.username,
            Password = request.password ?? "",
            UserRole = request.userRole,
            BatchNumber = request.batchNumber,
            TelegramUsername = request.telegramUsername
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/users/{user.UserId}", user);
    }

    // DTO
    public class CreateUserRequest
    {
        public required string firstName { get; set; }
        public required string lastName { get; set; }
        public required string username { get; set; }
        public required string userRole { get; set; }
        public required int batchNumber { get; set; }
        public string? telegramUsername { get; set; }
        public string? password { get; set; }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FirstName = request.firstName;
        user.LastName = request.lastName;
        user.UserRole = request.userRole;
        user.BatchNumber = request.batchNumber;
        user.TelegramUsername = request.telegramUsername;
        
        if (!string.IsNullOrEmpty(request.password))
        {
            user.Password = request.password;
        }

        await _db.SaveChangesAsync();
        return Ok(user);
    }

    // DTO
    public class UpdateUserRequest
    {
        public required string firstName { get; set; }
        public required string lastName { get; set; }
        public required string userRole { get; set; }
        public required int batchNumber { get; set; }
        public string? telegramUsername { get; set; }
        public string? password { get; set; }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}