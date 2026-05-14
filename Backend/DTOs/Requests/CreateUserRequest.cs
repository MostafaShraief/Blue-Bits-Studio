using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.DTOs.Requests;

public class CreateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public int BatchNumber { get; set; }
    public string? TelegramUsername { get; set; }
    public string? TeamJoinDate { get; set; }

    [Required]
    [RegularExpression(@"^[a-zA-Z0-9._]+$", ErrorMessage = "Username must contain only English letters, numbers, dots or underscores.")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 20 characters.")]
    public required string Username { get; set; }

    [Required]
    [RegularExpression(@"^[a-zA-Z0-9!@#$%^&*()_+=-]+$", ErrorMessage = "Password must contain only English letters, numbers, and standard symbols without spaces.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters.")]
    public required string Password { get; set; }
}
