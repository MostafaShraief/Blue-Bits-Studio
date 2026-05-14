using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Models;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/materials")]
public class AdminMaterialsController : ControllerBase
{
    private readonly IAdminMaterialService _materialService;

    public AdminMaterialsController(IAdminMaterialService materialService)
    {
        _materialService = materialService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var materials = await _materialService.GetAllAsync();
        return Ok(materials);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var material = await _materialService.GetByIdAsync(id);
        if (material == null) return NotFound();
        return Ok(material);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMaterialRequest request)
    {
        var material = await _materialService.CreateAsync(request);
        return Created($"/api/admin/materials/{material.MaterialId}", material);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMaterialRequest request)
    {
        var material = await _materialService.UpdateAsync(id, request);
        return Ok(material);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _materialService.DeleteAsync(id);
        return NoContent();
    }
}
