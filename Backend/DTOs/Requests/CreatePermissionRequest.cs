namespace BlueBits.Api.DTOs.Requests;

public class CreatePermissionRequest
{
    public required string roleName { get; set; }
    public required int workflowId { get; set; }
}
