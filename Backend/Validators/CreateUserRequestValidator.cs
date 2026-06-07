using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("اسم المستخدم مطلوب.")
            .Length(3, 20).WithMessage("يجب أن يكون طول اسم المستخدم بين 3 و 20 حرفًا.")
            .Matches(@"^[a-zA-Z0-9._]+$").WithMessage("يجب أن يحتوي اسم المستخدم على أحرف إنجليزية وأرقام ونقاط وشرطات سفلية فقط.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("كلمة المرور مطلوبة.")
            .Length(6, 100).WithMessage("يجب أن تكون كلمة المرور بين 6 و 100 حرف.")
            .Matches(@"^[a-zA-Z0-9!@#$%^&*()_+=-]+$").WithMessage("يجب أن تحتوي كلمة المرور على أحرف إنجليزية وأرقام ورموز قياسية بدون مسافات.");

        RuleFor(x => x.FirstName).NotEmpty().WithMessage("الاسم الأول مطلوب.");
        RuleFor(x => x.LastName).NotEmpty().WithMessage("الاسم الأخير مطلوب.");
        RuleFor(x => x.UserRole).NotEmpty().WithMessage("الدور مطلوب.");
        RuleFor(x => x.BatchNumber).GreaterThan(0).WithMessage("رقم الدفعة يجب أن يكون أكبر من 0.");

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
