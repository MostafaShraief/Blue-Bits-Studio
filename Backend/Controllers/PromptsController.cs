using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlueBits.Api.Data;
using BlueBits.Api.Models;
using BlueBits.Api.Services;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PromptsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;
    private readonly IPromptCompilationService _promptCompilationService;

    public PromptsController(BlueBitsDbContext db, IPromptCompilationService promptCompilationService)
    {
        _db = db;
        _promptCompilationService = promptCompilationService;
    }

    [HttpGet("{sessionId}/{systemCode}")]
    public async Task<IActionResult> GetPromptForSession(int sessionId, string systemCode)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var role = User.FindFirstValue(ClaimTypes.Role);

        // Block Admins from accessing prompts
        if (User.IsInRole("Admin")) return Forbid();

        // Fetch session to check ownership and get its WorkflowId
        var session = await _db.Sessions.FindAsync(sessionId);
        if (session == null) return NotFound("Session not found");
        
        if (session.UserId != userId) 
            return Forbid();

        // Fetch the Prompt based on the Session's WorkflowId AND the requested SystemCode
        var prompt = await _db.Prompts
            .FirstOrDefaultAsync(p => p.WorkflowId == session.WorkflowId && (p.SystemCode == systemCode || p.Workflow.SystemCode == systemCode));

        if (prompt == null)
            return NotFound("Prompt not found for this workflow.");

        return Ok(new { prompt.PromptText, prompt.PromptName });
    }

    [HttpPost("compile")]
    public async Task<IActionResult> CompilePrompt([FromBody] CompilePromptRequest req)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        // Block Admins from compiling prompts
        if (User.IsInRole("Admin")) return Forbid();

        if (string.IsNullOrWhiteSpace(req.systemCode))
        {
            return BadRequest("systemCode is required.");
        }

        var compiled = await _promptCompilationService.CompilePromptAsync(
            req.systemCode, 
            req.GeneralNotes, 
            req.FileNotes ?? new List<string>()
        );

        return Ok(new { CompiledPrompt = compiled });
    }
}

public class CompilePromptRequest
{
    public string systemCode { get; set; } = string.Empty;
    public string? GeneralNotes { get; set; }
    public List<string>? FileNotes { get; set; }
}
