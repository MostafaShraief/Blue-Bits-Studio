using System.ComponentModel.DataAnnotations;

namespace BlueBits.Api.Models;

public class WorkflowPermission
{
    [Key]
    public int PermissionId { get; set; }
    
    [Required]
    public required string RoleName { get; set; }
    
    public int WorkflowId { get; set; }
    
    public Workflow Workflow { get; set; } = null!;
}