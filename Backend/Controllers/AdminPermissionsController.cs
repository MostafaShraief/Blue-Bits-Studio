using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/permissions")]
public class AdminPermissionsController : ControllerBase
{
    private readonly IAdminPermissionService _permissionService;

    public AdminPermissionsController(IAdminPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var permissions = await _permissionService.GetAllAsync();
        return Ok(permissions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePermissionRequest request)
    {
        try
        {
            var permission = await _permissionService.CreateAsync(request);
            return Created($"/api/admin/permissions/{permission.PermissionId}", permission);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _permissionService.DeleteAsync(id);
        return NoContent();
    }
}
