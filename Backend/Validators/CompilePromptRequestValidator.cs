using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class CompilePromptRequestValidator : AbstractValidator<CompilePromptRequest>
{
    public CompilePromptRequestValidator()
    {
        RuleFor(x => x.systemCode).NotEmpty().WithMessage("رمز النظام مطلوب.");
    }
}
