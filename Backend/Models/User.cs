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
    [RegularExpression(@"^[a-zA-Z0-9._]+$", ErrorMessage = "يجب أن يحتوي اسم المستخدم على أحرف إنجليزية وأرقام ونقاط وشرطات سفلية فقط.")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "يجب أن يكون طول اسم المستخدم بين 3 و 20 حرفًا.")]
    public required string Username { get; set; }
    
    [Required]
    [RegularExpression(@"^[a-zA-Z0-9!@#$%^&*()_+=-]+$", ErrorMessage = "يجب أن تحتوي كلمة المرور على أحرف إنجليزية وأرقام ورموز قياسية بدون مسافات.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "يجب أن تكون كلمة المرور 6 أحرف على الأقل.")]
    public required string Password { get; set; }
    
    [Required]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");
    
    public string? TeamJoinDate { get; set; }

    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}