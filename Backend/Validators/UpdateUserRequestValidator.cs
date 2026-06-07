using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        When(x => !string.IsNullOrEmpty(x.Password), () =>
        {
            RuleFor(x => x.Password)
                .Length(6, 100).WithMessage("يجب أن تكون كلمة المرور بين 6 و 100 حرف.")
                .Matches(@"^[a-zA-Z0-9!@#$%^&*()_+=-]+$").WithMessage("يجب أن تحتوي كلمة المرور على أحرف إنجليزية وأرقام ورموز قياسية بدون مسافات.");
        });

        When(x => !string.IsNullOrEmpty(x.TelegramUsername), () =>
        {
            RuleFor(x => x.TelegramUsername)
                .Must(BeValidTelegramUsername)
                .WithMessage("اسم المستخدم في تلغرام يجب أن يكون بين 5 و 32 حرفاً وأن يحتوي على أحرف وأرقام وشرطات سفلية فقط.");
        });
    }

    private static bool BeValidTelegramUsername(string? name)
    {
        if (string.IsNullOrEmpty(name)) return true;
        var normalized = name.StartsWith('@') ? name[1..] : name;
        return normalized.Length >= 5 && normalized.Length <= 32 &&
               System.Text.RegularExpressions.Regex.IsMatch(normalized, @"^[a-zA-Z0-9_]+$");
    }
}
