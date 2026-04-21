using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Models;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MaterialsController : ControllerBase
{
    private readonly BlueBitsDbContext _db;

    public MaterialsController(BlueBitsDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetMaterials()
    {
        var materialNames = await _db.Materials
            .Select(m => m.MaterialName)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();

        return Ok(materialNames);
    }
}
