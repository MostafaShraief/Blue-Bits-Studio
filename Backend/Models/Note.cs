using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class Note
{
    [Key]
    public int NoteId { get; set; }
    
    public int SessionId { get; set; }
    
    [Required]
    public required string NoteText { get; set; }
    
    [Required]
    public required string NoteType { get; set; }
    
    public int? FileId { get; set; }

    public Session Session { get; set; } = null!;
    public File? File { get; set; }
}