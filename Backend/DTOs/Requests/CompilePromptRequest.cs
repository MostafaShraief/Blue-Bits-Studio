namespace BlueBits.Api.DTOs.Requests;

public class CompilePromptRequest
{
    public string systemCode { get; set; } = string.Empty;
    public string? GeneralNotes { get; set; }
    public List<string>? FileNotes { get; set; }
}
