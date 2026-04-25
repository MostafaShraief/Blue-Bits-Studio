using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class Session
{
    [Key]
    public int SessionId { get; set; }
    
    public int UserId { get; set; }
    
    public int? MaterialId { get; set; }
    
    public int WorkflowId { get; set; }
    
    public int LectureNumber { get; set; }
    
    [Required]
    public required string LectureType { get; set; }
    
    [Required]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");

    public User User { get; set; } = null!;
    public Material? Material { get; set; }
    public Workflow Workflow { get; set; } = null!;

    public ICollection<File> Files { get; set; } = new List<File>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<SessionContent> SessionContents { get; set; } = new List<SessionContent>();
}