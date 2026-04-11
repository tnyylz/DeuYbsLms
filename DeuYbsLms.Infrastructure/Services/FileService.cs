// Path: DeuYbsLms.Infrastructure/Services/FileService.cs

using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Hosting;

namespace DeuYbsLms.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _environment;

    public FileService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder)
    {
        // Use ContentRootPath to consistently find the project root
        var wwwrootPath = _environment.WebRootPath;
        if (string.IsNullOrEmpty(wwwrootPath))
        {
            wwwrootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var uploadsFolder = Path.Combine(wwwrootPath, "uploads", folder);
        
        // Ensure directory exists
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var file = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(file);
        }

        // Return path formatted for web (always forward slashes)
        return $"/uploads/{folder}/{uniqueFileName}";
    }
}
