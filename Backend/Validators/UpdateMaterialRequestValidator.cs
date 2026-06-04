using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class UpdateMaterialRequestValidator : AbstractValidator<UpdateMaterialRequest>
{
    public UpdateMaterialRequestValidator()
    {
        RuleFor(x => x.MaterialName)
            .NotEmpty()
            .WithMessage("اسم المادة مطلوب");

        RuleFor(x => x.MaterialYear)
            .InclusiveBetween(1, 5)
            .WithMessage("السنة الدراسية يجب أن تكون بين 1 و 5");
    }
}
