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

    /// <summary>Fetches the AI prompt for a session by session ID and workflow system code.</summary>
    /// <param name="sessionId">The session ID.</param>
    /// <param name="systemCode">The workflow system code (e.g. LEC_EXT).</param>
    /// <returns>The prompt text and name.</returns>
    /// <response code="200">Returns the prompt text and name.</response>
    /// <response code="403">Forbidden for Admin users.</response>
    /// <response code="404">Prompt not found for this workflow.</response>
    [HttpGet("{sessionId}/{systemCode}")]
    public async Task<IActionResult> GetPromptForSession(int sessionId, string systemCode)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        if (User.IsInRole("Admin")) return Forbid();

        var prompt = await _promptService.GetPromptForSessionAsync(sessionId, systemCode);

        if (prompt == null)
            return NotFound("لم يتم العثور على الموجه لهذا السير.");

        return Ok(new { prompt.PromptText, prompt.PromptName });
    }

    /// <summary>Compiles a prompt with user notes.</summary>
    /// <param name="req">The compile request containing systemCode, general notes, and file notes.</param>
    /// <returns>The compiled prompt text.</returns>
    /// <response code="200">Returns the compiled prompt.</response>
    /// <response code="400">systemCode is required.</response>
    /// <response code="403">Forbidden for Admin users.</response>
    [HttpPost("compile")]
    public async Task<IActionResult> CompilePrompt([FromBody] CompilePromptRequest req)
    {
        if (User.IsInRole("Admin")) return Forbid();

        if (string.IsNullOrWhiteSpace(req.systemCode))
            return BadRequest("رمز النظام مطلوب.");

        var compiled = await _promptService.CompilePromptAsync(
            req.systemCode,
            req.GeneralNotes,
            req.FileNotes ?? []
        );

        return Ok(new { CompiledPrompt = compiled });
    }
}
