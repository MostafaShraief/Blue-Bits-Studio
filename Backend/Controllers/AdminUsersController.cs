using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/[controller]")]
public class AdminUsersController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminUsersController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // GET: /api/admin/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.Users.ToListAsync());
    }

    // GET: /api/admin/users/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    // POST: /api/admin/users
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] User user)
    {
        // Password is stored as plain text (no hashing)
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/users/{user.UserId}", user);
    }

    // PUT: /api/admin/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] User updatedUser)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FirstName = updatedUser.FirstName;
        user.LastName = updatedUser.LastName;
        user.UserRole = updatedUser.UserRole;
        user.BatchNumber = updatedUser.BatchNumber;
        user.TelegramUsername = updatedUser.TelegramUsername;
        
        // Update password only if provided (plain text, no hashing)
        if (!string.IsNullOrEmpty(updatedUser.Password))
        {
            user.Password = updatedUser.Password;
        }

        await _db.SaveChangesAsync();
        return Ok(user);
    }

    // DELETE: /api/admin/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        // Prevent deletion of master Admin user (UserId = 1)
        if (id == 1)
        {
            return BadRequest(new { message = "Cannot delete the master Admin user" });
        }

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}