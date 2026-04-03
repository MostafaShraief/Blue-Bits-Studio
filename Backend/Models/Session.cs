namespace BlueBits.Api.Models;

public class Session
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MaterialName { get; set; } = string.Empty;
    public string LectureNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Theoretical/Practical
    public string WorkflowType { get; set; } = string.Empty; // Lecture/Bank/Draw/Pandoc
    private DateTime _createdAt = DateTime.UtcNow;
    public DateTime CreatedAt 
    { 
        get => _createdAt; 
        set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc); 
    }

    // Navigation properties
    public Prompt? Prompt { get; set; }
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<Image> Images { get; set; } = new List<Image>();
}
