// Path: DeuYbsLms.API/Controllers/YouTubeController.cs

using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class YouTubeController : ControllerBase
{
    private readonly IYouTubeService _youtubeService;

    public YouTubeController(IYouTubeService youtubeService)
    {
        _youtubeService = youtubeService;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(4294967296)] // 4 GB
    public async Task<IActionResult> UploadVideo(IFormFile file, [FromForm] string title, [FromForm] string description)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya seçilmedi.");

        if (!file.ContentType.StartsWith("video/"))
            return BadRequest("Lütfen geçerli bir video dosyası yükleyin.");

        try
        {
            using var stream = file.OpenReadStream();
            var videoId = await _youtubeService.UploadVideoAsync(stream, title, description, file.ContentType);
            
            return Ok(new { VideoId = videoId, VideoUrl = $"https://www.youtube.com/watch?v={videoId}" });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
