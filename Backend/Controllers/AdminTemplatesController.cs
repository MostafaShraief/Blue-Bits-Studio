using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/templates")]
public class AdminTemplatesController : ControllerBase
{
    private readonly IAdminTemplateService _adminTemplateService;

    public AdminTemplatesController(IAdminTemplateService adminTemplateService)
    {
        _adminTemplateService = adminTemplateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await _adminTemplateService.GetTemplatesAsync();
        return Ok(templates);
    }

    [HttpPut]
    public async Task<IActionResult> UploadTemplate([FromForm] string type, IFormFile file)
    {
        var result = await _adminTemplateService.UploadTemplateAsync(type, file);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { error = result.ErrorMessage });
        return Ok(new { message = "تم تحديث القالب بنجاح." });
    }
}
