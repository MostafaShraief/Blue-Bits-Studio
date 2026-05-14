using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BlueBits.Api.Services.Interfaces;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PromptsController : ControllerBase
{
    private readonly IPromptService _promptService;

    public PromptsController(IPromptService promptService)
    {
        _promptService = promptService;
    }

    [HttpGet("{sessionId}/{systemCode}")]
    public async Task<IActionResult> GetPromptForSession(int sessionId, string systemCode)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        if (User.IsInRole("Admin")) return Forbid();

        var prompt = await _promptService.GetPromptForSessionAsync(sessionId, systemCode);

        if (prompt == null)
            return NotFound("Prompt not found for this workflow.");

        return Ok(new { prompt.PromptText, prompt.PromptName });
    }

    [HttpPost("compile")]
    public async Task<IActionResult> CompilePrompt([FromBody] CompilePromptRequest req)
    {
        if (User.IsInRole("Admin")) return Forbid();

        if (string.IsNullOrWhiteSpace(req.systemCode))
        {
            return BadRequest("systemCode is required.");
        }

        var compiled = await _promptService.CompilePromptAsync(
            req.systemCode,
            req.GeneralNotes,
            req.FileNotes ?? new List<string>()
        );

        return Ok(new { CompiledPrompt = compiled });
    }
}
