using BlueBits.Api.Data;
using BlueBits.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BlueBits.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/login", async (LoginRequest request, BlueBitsDbContext db) =>
        {
            // IMPORTANT: In production, verify PasswordHash using BCrypt or Argon2.
            // Since this is Phase 2, we are simulating the DB lookup to demonstrate the RBAC logic.
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.PasswordHash == request.Password);
            
            if (user == null)
            {
                return Results.Unauthorized();
            }

            // Central RBAC Logic: 
            // We use the authenticated user's RoleName to query WorkflowPermissions.
            // We only fetch workflows that are IsActive == 1.
            var authorizedWorkflows = await db.Workflows
                .Where(w => w.IsActive == 1 && w.Permissions.Any(p => p.RoleName == user.UserRole))
                .Select(w => w.SystemCode)
                .ToListAsync();

            var response = new LoginResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.UserRole,
                AuthorizedWorkflows = authorizedWorkflows
            };

            return Results.Ok(response);
        });

        return group;
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> AuthorizedWorkflows { get; set; } = new();
}