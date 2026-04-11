// Path: DeuYbsLms.API/Controllers/TeacherController.cs

using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class TeacherController : ControllerBase
{
    private readonly ITeacherService _teacherService;

    public TeacherController(ITeacherService teacherService)
    {
        _teacherService = teacherService;
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userId!);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = await _teacherService.GetDashboardStatsAsync(GetUserId());
        return Ok(stats);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAllAnalytics()
    {
        var analytics = await _teacherService.GetAllStudentsAnalyticsAsync(GetUserId());
        return Ok(analytics);
    }

    [HttpGet("analytics/{courseId:guid}")]
    public async Task<IActionResult> GetCourseAnalytics(Guid courseId)
    {
        var analytics = await _teacherService.GetCourseAnalyticsAsync(courseId);
        return Ok(analytics);
    }
}
