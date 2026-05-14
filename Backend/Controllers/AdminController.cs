using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using BlueBits.Api.DTOs.Requests;
using Microsoft.Extensions.Logging;

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
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check for duplicate TelegramUsername + UserRole combination (allow null TelegramUsername)
        if (!string.IsNullOrWhiteSpace(dto.TelegramUsername))
        {
            // Add @ prefix if not present
            if (!dto.TelegramUsername.StartsWith("@"))
            {
                dto.TelegramUsername = "@" + dto.TelegramUsername;
            }

            var exists = await _db.Users.AnyAsync(u =>
                u.TelegramUsername == dto.TelegramUsername &&
                u.UserRole == dto.UserRole);
            if (exists)
            {
                _logger.LogWarning("CreateUser failed: TelegramUsername '{Telegram}' already exists with role {Role}",
                    dto.TelegramUsername, dto.UserRole);
                return Conflict(new { message = "DUPLICATE_TELEGRAM_ROLE",
                    detail = $"Telegram username '{dto.TelegramUsername}' is already registered with role '{dto.UserRole}'" });
            }
        }

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Username = dto.Username,
            Password = dto.Password,
            UserRole = dto.UserRole,
            BatchNumber = dto.BatchNumber,
            TelegramUsername = dto.TelegramUsername,
            TeamJoinDate = dto.TeamJoinDate,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/users/{user.UserId}", user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Log incoming payload for debugging
        _logger.LogInformation("UpdateUser {Id}: BatchNumber={BatchNumber}, Password={HasPassword}", 
            id, dto.BatchNumber, !string.IsNullOrEmpty(dto.Password));

        // Check for duplicate TelegramUsername + UserRole combination (allow null TelegramUsername, exclude current user)
        if (!string.IsNullOrWhiteSpace(dto.TelegramUsername))
        {
            // Add @ prefix if not present
            if (!dto.TelegramUsername.StartsWith("@"))
            {
                dto.TelegramUsername = "@" + dto.TelegramUsername;
            }

            var exists = await _db.Users.AnyAsync(u =>
                u.TelegramUsername == dto.TelegramUsername &&
                u.UserRole == dto.UserRole &&
                u.UserId != id);
            if (exists)
            {
                _logger.LogWarning("UpdateUser failed: TelegramUsername '{Telegram}' already exists with role {Role}",
                    dto.TelegramUsername, dto.UserRole);
                return Conflict(new { message = "DUPLICATE_TELEGRAM_ROLE",
                    detail = $"Telegram username '{dto.TelegramUsername}' is already registered with role '{dto.UserRole}'" });
            }
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.UserRole = dto.UserRole;
        user.BatchNumber = dto.BatchNumber;
        user.TelegramUsername = dto.TelegramUsername;
        
        // Only update TeamJoinDate if provided
        if (!string.IsNullOrWhiteSpace(dto.TeamJoinDate))
        {
            user.TeamJoinDate = dto.TeamJoinDate;
        }
        
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