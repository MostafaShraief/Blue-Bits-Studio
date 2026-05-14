using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MaterialsController : ControllerBase
{
    private readonly IMaterialService _materialService;

    public MaterialsController(IMaterialService materialService)
    {
        _materialService = materialService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMaterials()
    {
        var materialNames = await _materialService.GetDistinctMaterialNamesAsync();
        return Ok(materialNames);
    }
}
