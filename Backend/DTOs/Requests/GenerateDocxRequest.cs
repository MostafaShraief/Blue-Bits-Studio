namespace BlueBits.Api.DTOs.Requests;

public class GenerateDocxRequest
{
    public string MarkdownText { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string LectureNumber { get; set; } = string.Empty;
}
