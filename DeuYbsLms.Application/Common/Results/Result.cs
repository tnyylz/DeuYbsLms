// Path: DeuYbsLms.Application/Common/Results/Result.cs

namespace DeuYbsLms.Application.Common.Results;

public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string? ErrorMessage { get; private set; }
    public int StatusCode { get; private set; }

    private Result() { }

    public static Result<T> Success(T data, int statusCode = 200)
        => new() { IsSuccess = true, Data = data, StatusCode = statusCode };

    public static Result<T> Failure(string errorMessage, int statusCode = 400)
        => new() { IsSuccess = false, ErrorMessage = errorMessage, StatusCode = statusCode };

    public static Result<T> NotFound(string errorMessage)
        => new() { IsSuccess = false, ErrorMessage = errorMessage, StatusCode = 404 };

    public static Result<T> Unauthorized(string errorMessage = "Bu işlem için yetkiniz yok.")
        => new() { IsSuccess = false, ErrorMessage = errorMessage, StatusCode = 401 };
}