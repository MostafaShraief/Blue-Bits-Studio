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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        
        if (user == null || user.Password != request.Password)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        // Get authorized workflows from RBAC table mapping
        // Admin gets ALL active workflows (no permission entry needed)
        // Other roles get workflows where they have explicit permission AND workflow is active
        List<string> authorizedWorkflows;
        if (user.UserRole == "Admin")
        {
            authorizedWorkflows = await _db.Workflows
                .Where(w => w.IsActive == 1)
                .Select(w => w.SystemCode)
                .ToListAsync();
        }
        else
        {
            authorizedWorkflows = await _db.Workflows
                .Where(w => w.IsActive == 1 && w.Permissions.Any(p => p.RoleName == user.UserRole))
                .Select(w => w.SystemCode)
                .ToListAsync();
        }

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
            Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["ExpireDays"] ?? "7")),
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