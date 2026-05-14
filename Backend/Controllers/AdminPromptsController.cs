using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/prompts")]
public class AdminPromptsController : ControllerBase
{
    private readonly IAdminPromptService _adminPromptService;

    public AdminPromptsController(IAdminPromptService adminPromptService)
    {
        _adminPromptService = adminPromptService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Prompt>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var prompts = await _adminPromptService.GetAllAsync();
        return Ok(prompts);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Prompt), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePromptText(int id, [FromBody] UpdatePromptRequest req)
    {
        var prompt = await _adminPromptService.UpdatePromptTextAsync(id, req);
        return Ok(prompt);
    }
}
