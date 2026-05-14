namespace BlueBits.Api.DTOs.Requests;

public class CreateSessionRequest
{
    public required string WorkflowSystemCode { get; set; }
    public required string MaterialName { get; set; }
    public required int LectureNumber { get; set; }
    public required string LectureType { get; set; }
    public string? GeneralNotes { get; set; }
}
