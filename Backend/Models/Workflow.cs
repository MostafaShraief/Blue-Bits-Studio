using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class Workflow
{
    [Key]
    public int WorkflowId { get; set; }
    
    [Required]
    public required string SystemCode { get; set; }
    
    [Required]
    public required string AdminNote { get; set; }
    
    public int IsActive { get; set; } = 1;

    public ICollection<WorkflowPermission> Permissions { get; set; } = new List<WorkflowPermission>();
    public ICollection<Prompt> Prompts { get; set; } = new List<Prompt>();
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}