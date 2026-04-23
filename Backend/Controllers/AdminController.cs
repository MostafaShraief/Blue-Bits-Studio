using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using Microsoft.Extensions.Logging;

namespace BlueBits.Api.Controllers;

// DTO for updating users (separate from entity to avoid validation on required fields)
public class UpdateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public int BatchNumber { get; set; }
    public string? TelegramUsername { get; set; }
    public string? Password { get; set; } // Optional: only updated if provided
}

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminController : ControllerBase
{
    private readonly BlueBitsDbContext _db;
    private readonly ILogger<AdminController> _logger;

    public AdminController(BlueBitsDbContext db, ILogger<AdminController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // --- USER MANAGEMENT ---
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _db.Users.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/users/{user.UserId}", user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Log incoming payload for debugging
        _logger.LogInformation("UpdateUser {Id}: BatchNumber={BatchNumber}, Password={HasPassword}", 
            id, dto.BatchNumber, !string.IsNullOrEmpty(dto.Password));

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.UserRole = dto.UserRole;
        user.BatchNumber = dto.BatchNumber;
        user.TelegramUsername = dto.TelegramUsername;
        
        // Only update password if provided
        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.Password = dto.Password;
        }

        await _db.SaveChangesAsync();
        return Ok(user);
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