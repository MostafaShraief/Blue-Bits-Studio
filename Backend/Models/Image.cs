namespace BlueBits.Api.Models;

public class Image
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public string LocalFilePath { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    public Session Session { get; set; } = null!;
}
