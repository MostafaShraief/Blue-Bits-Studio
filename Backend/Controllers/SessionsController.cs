using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.Services.Interfaces;
using BlueBits.Api.Exceptions;

namespace BlueBits.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(role))
            return Unauthorized();

        var result = await _sessionService.GetSessionsAsync(userId, role, page, limit);
        return Ok(new { sessions = result.Sessions, result.TotalCount, result.Page, result.Limit, result.HasMore });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSession(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(role))
            return Unauthorized();

        var result = await _sessionService.GetSessionAsync(id, userId, role);

        var response = new
        {
            id = result.Session.SessionId,
            sessionId = result.Session.SessionId,
            result.Session.UserId,
            result.Session.MaterialId,
            result.Session.WorkflowId,
            lectureNumber = result.Session.LectureNumber,
            lectureType = result.Session.LectureType,
            createdAt = result.Session.CreatedAt,
            result.Session.User,
            result.Session.Material,
            result.Session.Workflow,
            result.Session.Files,
            result.Session.Notes,
            result.Session.SessionContents,
            compiledPrompt = result.CompiledPrompt
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest req)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(userIdStr) || string.IsNullOrEmpty(role))
            return Unauthorized();

        int userId = int.Parse(userIdStr);

        var result = await _sessionService.CreateSessionAsync(userId, role, req);
        return Created($"/api/sessions/{result.SessionId}", new { result.SessionId, result.WorkflowId });
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveSessionContent([FromBody] SaveSessionContentRequest req, [FromQuery] int? sessionId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);

        await _sessionService.SaveSessionContentAsync(userId, sessionId, req);
        return Ok(new { sessionId = sessionId, message = "Content saved successfully" });
    }

    [HttpPost("{id}/files")]
    public async Task<IActionResult> UploadFiles(int id, [FromForm] IFormCollection form)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = string.IsNullOrEmpty(userIdStr) ? 0 : int.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(role))
            return Unauthorized();

        await _sessionService.UploadFilesAsync(id, userId, role, form);
        return Ok();
    }
}
