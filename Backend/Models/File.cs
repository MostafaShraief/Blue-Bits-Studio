using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class File
{
    [Key]
    public int FileId { get; set; }
    
    public int SessionId { get; set; }
    
    [Required]
    public required string LocalFilePath { get; set; }
    
    [Required]
    public required string FileType { get; set; }
    
    public int OrderIndex { get; set; }

    public Session Session { get; set; } = null!;
    public ICollection<Note> Notes { get; set; } = new List<Note>();
}