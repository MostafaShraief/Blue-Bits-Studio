using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BlueBits.Api.Models;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services.Interfaces;

namespace BlueBits.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IWorkflowRepository _workflowRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IWorkflowRepository workflowRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _workflowRepository = workflowRepository;
        _configuration = configuration;
    }

    public async Task<(User user, string token, List<string> workflows)?> LoginAsync(string username, string password)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        if (user == null || user.Password != password)
            return null;

        var workflows = (await _workflowRepository.GetActiveWorkflowsForRoleAsync(user.UserRole))
            .Select(w => w.SystemCode)
            .ToList();

        var token = GenerateJwt(user);

        return (user, token, workflows);
    }

    public async Task<(User user, List<string> workflows)?> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var workflows = (await _workflowRepository.GetActiveWorkflowsForRoleAsync(user.UserRole))
            .Select(w => w.SystemCode)
            .ToList();

        return (user, workflows);
    }

    private string GenerateJwt(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
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
        return tokenHandler.WriteToken(token);
    }
}
