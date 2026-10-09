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
    private readonly IAdminService _adminService;

    public TeacherController(ITeacherService teacherService, IAdminService adminService)
    {
        _teacherService = teacherService;
        _adminService = adminService;
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

    [HttpGet("courses/{courseId:guid}/analytics")]
    public async Task<IActionResult> GetCourseAnalyticsDetail(Guid courseId)
    {
        // First check if this course belongs to the logged-in teacher
        var isOwner = await _teacherService.IsTeacherCourseOwnerAsync(courseId, GetUserId());
        if (!isOwner)
        {
            return Forbid();
        }

        // Return the exact same rich analytics DTO as the admin panel
        var analytics = await _adminService.GetCourseAnalyticsAsync(courseId);
        return Ok(analytics);
    }
}
