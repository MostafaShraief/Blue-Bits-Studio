using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/permissions")]
public class AdminPermissionsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminPermissionsController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // GET: /api/admin/permissions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.WorkflowPermissions
            .Include(p => p.Workflow)
            .ToListAsync());
    }

    // POST: /api/admin/permissions
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePermissionRequest request)
    {
        // Validate role name
        if (request.roleName != "TechMember" && request.roleName != "ScientificMember")
        {
            return BadRequest(new { message = "Role must be 'TechMember' or 'ScientificMember'" });
        }

        // Check if mapping already exists
        var existing = await _db.WorkflowPermissions
            .FirstOrDefaultAsync(p => p.RoleName == request.roleName && p.WorkflowId == request.workflowId);
        
        if (existing != null)
        {
            return BadRequest(new { message = "This role-to-workflow mapping already exists" });
        }

        var permission = new WorkflowPermission
        {
            RoleName = request.roleName,
            WorkflowId = request.workflowId
        };

        _db.WorkflowPermissions.Add(permission);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/permissions/{permission.PermissionId}", permission);
    }

    // DTO
    public class CreatePermissionRequest
    {
        public required string roleName { get; set; }
        public required int workflowId { get; set; }
    }

    // DELETE: /api/admin/permissions/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var permission = await _db.WorkflowPermissions.FindAsync(id);
        if (permission == null) return NotFound();

        _db.WorkflowPermissions.Remove(permission);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}