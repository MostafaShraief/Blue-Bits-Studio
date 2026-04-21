using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/workflows")]
public class AdminWorkflowsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminWorkflowsController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // GET: /api/admin/workflows
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.Workflows.ToListAsync());
    }

    // PUT: /api/admin/workflows/{id}/toggle
    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleActive(int id, [FromBody] ToggleWorkflowRequest req)
    {
        var workflow = await _db.Workflows.FindAsync(id);
        if (workflow == null) return NotFound();

        workflow.IsActive = req.IsActive ? 1 : 0;
        await _db.SaveChangesAsync();

        return Ok(workflow);
    }
}

public class ToggleWorkflowRequest
{
    public bool IsActive { get; set; }
}
