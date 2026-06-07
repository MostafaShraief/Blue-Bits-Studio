namespace BlueBits.Api.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string resourceName, object resourceId)
        : base($"لم يتم العثور على {resourceName} بالمعرّف '{resourceId}'")
    {
    }
}
