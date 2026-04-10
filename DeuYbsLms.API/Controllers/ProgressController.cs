// Path: DeuYbsLms.API/Controllers/ProgressController.cs
// Sınıf türü: Controller (Add > Controller > API Controller - Empty)

using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    private Guid GetStudentId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("enroll/{courseId:guid}")]
    public async Task<IActionResult> Enroll(Guid courseId)
    {
        var result = await _progressService.EnrollStudentAsync(GetStudentId(), courseId);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
        return Ok("Kursa başarıyla kayıt oldunuz.");
    }

    [HttpGet("{courseId:guid}")]
    public async Task<IActionResult> GetProgress(Guid courseId)
    {
        var result = await _progressService.GetCourseProgressAsync(GetStudentId(), courseId);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
        return Ok(result.Data);
    }

    [HttpPost("complete-video/{lessonId:guid}")]
    public async Task<IActionResult> CompleteVideo(Guid lessonId)
    {
        var result = await _progressService.CompleteVideoAsync(GetStudentId(), lessonId);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
        return Ok(result.Data);
    }

    [HttpPost("submit-quiz")]
    public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizDto request)
    {
        var result = await _progressService.SubmitQuizAsync(GetStudentId(), request);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
        return Ok(result.Data);
    }

    [HttpGet("my-enrollments")]
    public async Task<IActionResult> GetMyEnrollments()
    {
        var result = await _progressService.GetStudentEnrollmentsAsync(GetStudentId());
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
        return Ok(result.Data);
    }
}