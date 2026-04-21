using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/[controller]")]
public class AdminMaterialsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public AdminMaterialsController(BlueBitsDbContext db)
    {
        _db = db;
    }

    // GET: /api/admin/materials
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.Materials.ToListAsync());
    }

    // GET: /api/admin/materials/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var material = await _db.Materials.FindAsync(id);
        if (material == null) return NotFound();
        return Ok(material);
    }

    // POST: /api/admin/materials
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Material material)
    {
        _db.Materials.Add(material);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/materials/{material.MaterialId}", material);
    }

    // PUT: /api/admin/materials/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Material updated)
    {
        var material = await _db.Materials.FindAsync(id);
        if (material == null) return NotFound();

        material.MaterialName = updated.MaterialName;
        material.MaterialYear = updated.MaterialYear;
        await _db.SaveChangesAsync();

        return Ok(material);
    }

    // DELETE: /api/admin/materials/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var material = await _db.Materials.FindAsync(id);
        if (material == null) return NotFound();

        _db.Materials.Remove(material);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
