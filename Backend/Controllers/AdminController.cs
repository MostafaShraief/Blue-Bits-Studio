using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // --- WORKFLOW MANAGEMENT ---
    [HttpGet("workflows")]
    public async Task<IActionResult> GetWorkflows()
    {
        return Ok(await _db.Workflows.ToListAsync());
    }

    [HttpPut("workflows/{systemCode}/toggle")]
    public async Task<IActionResult> ToggleWorkflowActive(string systemCode, [FromBody] ToggleWorkflowRequest req)
    {
        var workflow = await _db.Workflows.FirstOrDefaultAsync(w => w.SystemCode == systemCode);
        if (workflow == null) return NotFound();

        workflow.IsActive = req.IsActive ? 1 : 0;
        await _db.SaveChangesAsync();

        return Ok(workflow);
    }

    // --- PROMPT MANAGEMENT ---
    [HttpGet("prompts")]
    public async Task<IActionResult> GetPrompts()
    {
        return Ok(await _db.Prompts.ToListAsync());
    }

    [HttpPut("prompts/{systemCode}")]
    public async Task<IActionResult> UpdatePromptText(string systemCode, [FromBody] UpdatePromptRequest req)
    {
        var prompt = await _db.Prompts.FirstOrDefaultAsync(p => p.SystemCode == systemCode);
        if (prompt == null) return NotFound();

        prompt.PromptText = req.PromptText;
        await _db.SaveChangesAsync();

        return Ok(prompt);
    }

    // --- USER MANAGEMENT ---
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _db.Users.ToListAsync());
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] User user)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/users/{user.UserId}", user);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FirstName = updatedUser.FirstName;
        user.LastName = updatedUser.LastName;
        user.UserRole = updatedUser.UserRole;
        user.BatchNumber = updatedUser.BatchNumber;
        user.TelegramUsername = updatedUser.TelegramUsername;
        
        if (!string.IsNullOrEmpty(updatedUser.PasswordHash))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
        }

        await _db.SaveChangesAsync();
        return Ok(user);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- MATERIAL MANAGEMENT ---
    [HttpGet("materials")]
    public async Task<IActionResult> GetMaterials()
    {
        return Ok(await _db.Materials.ToListAsync());
    }

    [HttpPost("materials")]
    public async Task<IActionResult> CreateMaterial([FromBody] Material material)
    {
        _db.Materials.Add(material);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/materials/{material.MaterialId}", material);
    }

    [HttpPut("materials/{id}")]
    public async Task<IActionResult> UpdateMaterial(int id, [FromBody] Material updated)
    {
        var material = await _db.Materials.FindAsync(id);
        if (material == null) return NotFound();

        material.MaterialName = updated.MaterialName;
        material.MaterialYear = updated.MaterialYear;
        await _db.SaveChangesAsync();

        return Ok(material);
    }

    [HttpDelete("materials/{id}")]
    public async Task<IActionResult> DeleteMaterial(int id)
    {
        var material = await _db.Materials.FindAsync(id);
        if (material == null) return NotFound();

        _db.Materials.Remove(material);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class ToggleWorkflowRequest
{
    public bool IsActive { get; set; }
}

public class UpdatePromptRequest
{
    public string PromptText { get; set; } = string.Empty;
}