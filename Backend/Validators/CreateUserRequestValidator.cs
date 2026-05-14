using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .Length(3, 20)
            .Matches(@"^[a-zA-Z0-9._]+$");

        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(6, 100)
            .Matches(@"^[a-zA-Z0-9!@#$%^&*()_+=-]+$");

        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.UserRole).NotEmpty();
        RuleFor(x => x.BatchNumber).GreaterThan(0);

        When(x => !string.IsNullOrEmpty(x.TelegramUsername), () =>
        {
            RuleFor(x => x.TelegramUsername)
                .Must(BeValidTelegramUsername)
                .WithMessage("Telegram username must be 5-32 characters and contain only letters, numbers, and underscores.");
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
