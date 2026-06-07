using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class CreateSessionRequestValidator : AbstractValidator<CreateSessionRequest>
{
    public CreateSessionRequestValidator()
    {
        RuleFor(x => x.WorkflowSystemCode).NotEmpty().WithMessage("رمز السير مطلوب.");
        RuleFor(x => x.MaterialName).NotEmpty().WithMessage("اسم المادة مطلوب.");
        RuleFor(x => x.LectureNumber).GreaterThan(0).WithMessage("رقم المحاضرة يجب أن يكون أكبر من 0.");
        RuleFor(x => x.LectureType).NotEmpty().WithMessage("نوع المحاضرة مطلوب.");
    }
}
