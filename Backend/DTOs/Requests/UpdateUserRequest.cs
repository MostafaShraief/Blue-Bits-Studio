namespace BlueBits.Api.DTOs.Requests;

public class UpdateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public int BatchNumber { get; set; }
    public string? TelegramUsername { get; set; }
    public string? TeamJoinDate { get; set; }
    public string? Password { get; set; }
}
