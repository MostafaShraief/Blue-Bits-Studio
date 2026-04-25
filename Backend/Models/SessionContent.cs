using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class SessionContent
{
    [Key]
    public int ContentId { get; set; }
    
    public int SessionId { get; set; }
    
    public required string ContentBody { get; set; }
    
    public Session Session { get; set; } = null!;
}