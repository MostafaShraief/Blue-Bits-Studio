namespace BlueBits.Api.DTOs.Responses;

public class ErrorResponse
{
    public string Error { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string TraceId { get; set; } = string.Empty;
}
