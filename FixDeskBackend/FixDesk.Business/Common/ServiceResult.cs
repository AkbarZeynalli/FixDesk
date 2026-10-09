namespace FixDesk.Business.Common;

public class ServiceResult<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new List<string>();

    public bool IsForbidden { get; set; }

    public static ServiceResult<T> Success(T data, string message = "Əməliyyat uğurla yerinə yetirildi.")
    {
        return new ServiceResult<T> { IsSuccess = true, Data = data, Message = message };
    }

    public static ServiceResult<T> Failure(string message, List<string>? errors = null)
    {
        return new ServiceResult<T> { IsSuccess = false, Message = message, Errors = errors ?? new List<string>() };
    }

    public static ServiceResult<T> Forbidden(string message)
    {
        return new ServiceResult<T> { IsSuccess = false, IsForbidden = true, Message = message };
    }
}
