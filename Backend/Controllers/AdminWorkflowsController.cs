using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/workflows")]
[Produces("application/json")]
public class AdminWorkflowsController : ControllerBase
{
    private readonly IAdminWorkflowService _adminWorkflowService;

    public AdminWorkflowsController(IAdminWorkflowService adminWorkflowService)
    {
        _adminWorkflowService = adminWorkflowService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Workflow>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var workflows = await _adminWorkflowService.GetAllAsync();
        return Ok(workflows);
    }

    [HttpPut("{id}/toggle")]
    [ProducesResponseType(typeof(Workflow), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleActive(int id, [FromBody] ToggleWorkflowRequest req)
    {
        var workflow = await _adminWorkflowService.ToggleActiveAsync(id, req);
        return Ok(workflow);
    }
}
