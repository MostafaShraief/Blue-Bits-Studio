namespace BlueBits.Api.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string resourceName, object resourceId)
        : base($"{resourceName} with identifier '{resourceId}' was not found")
    {
    }
}
