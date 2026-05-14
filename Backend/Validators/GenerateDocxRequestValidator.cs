using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class GenerateDocxRequestValidator : AbstractValidator<GenerateDocxRequest>
{
    public GenerateDocxRequestValidator()
    {
        RuleFor(x => x.MarkdownText).NotEmpty();
        RuleFor(x => x.MaterialName).NotEmpty();
        RuleFor(x => x.Type).NotEmpty();
        RuleFor(x => x.LectureNumber).NotEmpty();
    }
}
