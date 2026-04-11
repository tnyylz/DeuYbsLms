// Path: DeuYbsLms.API/Controllers/UploadController.cs

using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require login for uploads
public class UploadController : ControllerBase
{
    private readonly IFileService _fileService;

    public UploadController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "general")
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya seçilmedi.");

        // Simple validation: only images
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest("Sadece görsel dosyaları (.jpg, .png, .webp) yüklenebilir.");

        try
        {
            using var stream = file.OpenReadStream();
            var relativeUrl = await _fileService.SaveFileAsync(stream, file.FileName, folder);
            return Ok(new { url = relativeUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Dosya yüklenirken hata oluştu: {ex.Message}");
        }
    }
}
