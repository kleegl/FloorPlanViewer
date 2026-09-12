namespace Granel3D.Application.Exceptions;

/// <summary>
/// Бросается, когда запрашиваемый ресурс не найден. 
/// Обрабатывается ExceptionHandlingMiddleware как HTTP 404.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}
