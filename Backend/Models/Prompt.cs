using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class Prompt
{
    [Key]
    public int PromptId { get; set; }
    
    public int WorkflowId { get; set; }
    
    [Required]
    public required string SystemCode { get; set; }
    
    [Required]
    public required string PromptName { get; set; }
    
    [Required]
    public required string PromptText { get; set; }
    
    public Workflow Workflow { get; set; } = null!;
}