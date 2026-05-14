namespace BlueBits.Api.DTOs.Responses;

public class SessionSummaryDto
{
    public int Id { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public string WorkflowType { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public int LectureNumber { get; set; }
}
