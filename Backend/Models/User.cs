using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlueBits.Api.Models;

public class User
{
    [Key]
    public int UserId { get; set; }
    
    [Required]
    public required string FirstName { get; set; }
    
    [Required]
    public required string LastName { get; set; }
    
    [Required]
    public required string UserRole { get; set; }
    
    public int BatchNumber { get; set; }
    
    public string? TelegramUsername { get; set; }
    
    [Required]
    [RegularExpression(@"^[a-zA-Z0-9._]+$", ErrorMessage = "Username must contain only English letters, numbers, dots or underscores.")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 20 characters.")]
    public required string Username { get; set; }
    
    [Required]
    [RegularExpression(@"^[a-zA-Z0-9!@#$%^&*()_+=-]+$", ErrorMessage = "Password must contain only English letters, numbers, and standard symbols without spaces.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters.")]
    public required string Password { get; set; }
    
    [Required]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");
    
    public string? TeamJoinDate { get; set; }

    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}