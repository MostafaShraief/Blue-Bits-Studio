using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PromptsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public PromptsController(BlueBitsDbContext db)
    {
        _db = db;
    }

    [HttpGet("{sessionId}/{systemCode}")]
    public async Task<IActionResult> GetPromptForSession(int sessionId, string systemCode)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var role = User.FindFirstValue(ClaimTypes.Role);

        // Fetch session to check ownership and get its WorkflowId
        var session = await _db.Sessions.FindAsync(sessionId);
        if (session == null) return NotFound("Session not found");
        
        if (role != "Admin" && session.UserId != userId) 
            return Forbid();

        // Fetch the Prompt based on the Session's WorkflowId AND the requested SystemCode
        var prompt = await _db.Prompts
            .FirstOrDefaultAsync(p => p.WorkflowId == session.WorkflowId && p.SystemCode == systemCode);

        if (prompt == null)
            return NotFound("Prompt not found for this workflow.");

        return Ok(new { prompt.PromptText, prompt.PromptName });
    }
}