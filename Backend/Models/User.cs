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
    public required string Username { get; set; }
    
    [Required]
    public required string Password { get; set; }
    
    [Required]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");
    
    public string? TeamJoinDate { get; set; }

    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}