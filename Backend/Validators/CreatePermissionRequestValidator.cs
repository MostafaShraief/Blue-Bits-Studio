using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class CreatePermissionRequestValidator : AbstractValidator<CreatePermissionRequest>
{
    public CreatePermissionRequestValidator()
    {
        RuleFor(x => x.roleName)
            .NotEmpty()
            .Must(r => r == "TechMember" || r == "ScientificMember")
            .WithMessage("Role must be 'TechMember' or 'ScientificMember'.");

        RuleFor(x => x.workflowId).GreaterThan(0);
    }
}
