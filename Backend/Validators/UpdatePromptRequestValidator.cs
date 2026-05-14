using FluentValidation;
using BlueBits.Api.DTOs.Requests;

namespace BlueBits.Api.Validators;

public class UpdatePromptRequestValidator : AbstractValidator<UpdatePromptRequest>
{
    public UpdatePromptRequestValidator()
    {
        RuleFor(x => x.PromptText).NotEmpty();
    }
}
