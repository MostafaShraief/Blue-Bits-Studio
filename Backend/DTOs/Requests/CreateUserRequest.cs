namespace BlueBits.Api.DTOs.Requests;

public class CreateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public int BatchNumber { get; set; }
    public string? TelegramUsername { get; set; }
    public string? TeamJoinDate { get; set; }
    public required string Username { get; set; }
    public required string Password { get; set; }
}
