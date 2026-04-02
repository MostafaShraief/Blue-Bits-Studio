namespace BlueBits.Api.Models;

public class Note
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public string NoteText { get; set; } = string.Empty;
    public string NoteType { get; set; } = "General"; // General or ImageLinked
    public Guid? ImageId { get; set; }

    public Session Session { get; set; } = null!;
}
