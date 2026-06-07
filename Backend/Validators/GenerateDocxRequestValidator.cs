using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class GenerateDocxRequestValidator : AbstractValidator<GenerateDocxRequest>
{
    public GenerateDocxRequestValidator()
    {
        RuleFor(x => x.MarkdownText).NotEmpty().WithMessage("نص الماركداون مطلوب.");
        RuleFor(x => x.MaterialName).NotEmpty().WithMessage("اسم المادة مطلوب.");
        RuleFor(x => x.Type).NotEmpty().WithMessage("النوع مطلوب.");
        RuleFor(x => x.LectureNumber).NotEmpty().WithMessage("رقم المحاضرة مطلوب.");
    }
}
