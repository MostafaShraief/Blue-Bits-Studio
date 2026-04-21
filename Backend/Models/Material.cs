using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class Material
{
    [Key]
    public int MaterialId { get; set; }
    
    [Required]
    public required string MaterialName { get; set; }
    
    public int MaterialYear { get; set; }
    
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}