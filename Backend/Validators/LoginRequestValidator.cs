using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("اسم المستخدم مطلوب.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("كلمة المرور مطلوبة.");
    }
}
