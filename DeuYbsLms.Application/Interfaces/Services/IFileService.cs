// Path: DeuYbsLms.Application/Interfaces/Services/IFileService.cs

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IFileService
{
    /// <summary>
    /// Saves an uploaded file to the storage and returns the relative URL.
    /// </summary>
    /// <param name="file">File data</param>
    /// <param name="fileName">Desired file name</param>
    /// <param name="folder">Subfolder (e.g., "thumbnails")</param>
    /// <returns>Relative URL of the saved file</returns>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder);
}
