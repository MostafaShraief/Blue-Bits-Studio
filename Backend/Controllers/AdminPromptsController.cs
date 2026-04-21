using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/prompts")]
public class AdminPromptsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminPromptsController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // GET: /api/admin/prompts
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.Prompts.ToListAsync());
    }

    // PUT: /api/admin/prompts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePromptText(int id, [FromBody] UpdatePromptRequest req)
    {
        var prompt = await _db.Prompts.FindAsync(id);
        if (prompt == null) return NotFound();

        prompt.PromptText = req.PromptText;
        await _db.SaveChangesAsync();

        return Ok(prompt);
    }
}

public class UpdatePromptRequest
{
    public string PromptText { get; set; } = string.Empty;
}
