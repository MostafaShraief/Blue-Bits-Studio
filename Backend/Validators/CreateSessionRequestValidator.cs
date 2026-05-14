using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class CreateSessionRequestValidator : AbstractValidator<CreateSessionRequest>
{
    public CreateSessionRequestValidator()
    {
        RuleFor(x => x.WorkflowSystemCode).NotEmpty();
        RuleFor(x => x.MaterialName).NotEmpty();
        RuleFor(x => x.LectureNumber).GreaterThan(0);
        RuleFor(x => x.LectureType).NotEmpty();
    }
}
