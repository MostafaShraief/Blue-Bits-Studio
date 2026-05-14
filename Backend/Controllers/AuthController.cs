using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BlueBits.Api.DTOs.Requests;
using BlueBits.Api.DTOs.Responses;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid token claims" });
        }

        var result = await _authService.GetCurrentUserAsync(userId);

        if (result == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var (user, workflows) = result.Value;

        return Ok(new LoginResponse
        {
            UserId = user.UserId,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.UserRole,
            AuthorizedWorkflows = workflows
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request.Username, request.Password);

        if (result == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var (user, token, workflows) = result.Value;

        return Ok(new LoginResponse
        {
            Token = token,
            UserId = user.UserId,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.UserRole,
            AuthorizedWorkflows = workflows
        });
    }
}
