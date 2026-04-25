// Path: DeuYbsLms.Application/Interfaces/Services/IYouTubeService.cs

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IYouTubeService
{
    /// <summary>
    /// Videoyu YouTube'a yükler ve Video ID'sini döner.
    /// </summary>
    Task<string> UploadVideoAsync(Stream videoStream, string title, string description, string contentType);
}
