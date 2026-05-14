namespace BlueBits.Api.DTOs.Requests;

public class CreateMaterialRequest
{
    public string MaterialName { get; set; } = string.Empty;
    public int MaterialYear { get; set; }
}
