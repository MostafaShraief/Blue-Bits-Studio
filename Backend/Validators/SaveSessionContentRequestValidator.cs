using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class SaveSessionContentRequestValidator : AbstractValidator<SaveSessionContentRequest>
{
    public SaveSessionContentRequestValidator()
    {
        RuleFor(x => x.ContentBody).NotEmpty().WithMessage("محتوى الجلسة مطلوب.");
    }
}
