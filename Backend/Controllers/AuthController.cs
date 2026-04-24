using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BlueBits.Api.Data;

namespace BlueBits.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BlueBitsDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(BlueBitsDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Extract user ID from JWT claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid token claims" });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Get fresh authorized workflows from RBAC table mapping
        var authorizedWorkflows = await _db.Workflows
            .Where(w => w.IsActive == 1 && w.Permissions.Any(p => p.RoleName == user.UserRole))
            .Select(w => w.SystemCode)
            .ToListAsync();

        return Ok(new LoginResponse
        {
            UserId = user.UserId,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.UserRole,
            AuthorizedWorkflows = authorizedWorkflows
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        
        if (user == null || user.Password != request.Password)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        // Get authorized workflows from RBAC table mapping
        var authorizedWorkflows = await _db.Workflows
            .Where(w => w.IsActive == 1 && w.Permissions.Any(p => p.RoleName == user.UserRole))
            .Select(w => w.SystemCode)
            .ToListAsync();

        // Generate JWT
        var jwtSettings = _config.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key missing"));
        
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), 
            new Claim(ClaimTypes.Name, user.Username),                    
            new Claim(ClaimTypes.Role, user.UserRole)                     
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["ExpireDays"] ?? "30")),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new LoginResponse
        {
            Token = tokenString,
            UserId = user.UserId,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.UserRole,
            AuthorizedWorkflows = authorizedWorkflows
        });
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> AuthorizedWorkflows { get; set; } = new();
}