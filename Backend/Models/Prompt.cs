namespace BlueBits.Api.Models;

public class Prompt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public string PromptText { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    public Session Session { get; set; } = null!;
}
