using DeuYbsLms.Application.DTOs.Admin;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IChallengeService _challengeService;
    private readonly IShopService _shopService;
    private readonly IAuthService _authService;

    public AdminController(
        IAdminService adminService, 
        IChallengeService challengeService,
        IShopService shopService,
        IAuthService authService)
    {
        _adminService = adminService;
        _challengeService = challengeService;
        _shopService = shopService;
        _authService = authService;
    }

    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] DeuYbsLms.Application.DTOs.Auth.RegisterRequestDto request)
    {
        try
        {
            var result = await _authService.CreateUserAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { errorMessage = result.ErrorMessage });
            return Ok(new { id = result.Data, message = "Kullanıcı başarıyla oluşturuldu." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { errorMessage = "Sunucu tarafında bir hata oluştu.", details = ex.Message });
        }
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserDetail(Guid id)
    {
        try
        {
            var userDetail = await _adminService.GetUserDetailAsync(id);
            return Ok(userDetail);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("users/{userId}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] UserRole role)
    {
        try
        {
            await _adminService.UpdateUserRoleAsync(userId, role);
            return Ok(new { message = "Kullanıcı rolü başarıyla güncellendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("users/{userId}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId)
    {
        try
        {
            await _adminService.ToggleUserStatusAsync(userId);
            return Ok(new { message = "Kullanıcı durumu başarıyla güncellendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("courses")]
    public async Task<IActionResult> GetAllCourses()
    {
        var courses = await _adminService.GetAllCoursesAsync();
        return Ok(courses);
    }

    [HttpDelete("courses/{courseId}")]
    public async Task<IActionResult> DeleteCourse(Guid courseId)
    {
        try
        {
            await _adminService.DeleteCourseAsync(courseId);
            return Ok(new { message = "Kurs başarıyla silindi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("courses/{courseId:guid}/assign")]
    public async Task<IActionResult> AssignCourse(Guid courseId, [FromBody] CourseAssignmentDto request)
    {
        try
        {
            await _adminService.AssignCourseAsync(courseId, request);
            return Ok(new { message = "Öğrenciler kursa başarıyla atandı." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("courses/{courseId:guid}/analytics")]
    public async Task<IActionResult> GetCourseAnalytics(Guid courseId)
    {
        try
        {
            var analytics = await _adminService.GetCourseAnalyticsAsync(courseId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // --- Challenge Management ---

    [HttpGet("challenges")]
    public async Task<IActionResult> GetAllChallenges()
    {
        var result = await _challengeService.GetAllChallengesForAdminAsync();
        return Ok(result.Data);
    }

    [HttpPost("challenges")]
    public async Task<IActionResult> CreateChallenge([FromBody] DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto dto)
    {
        var result = await _challengeService.CreateChallengeAsync(dto);
        return Ok(new { id = result.Data });
    }

    [HttpPut("challenges/{id}")]
    public async Task<IActionResult> UpdateChallenge(Guid id, [FromBody] DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto dto)
    {
        var result = await _challengeService.UpdateChallengeAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });
        return Ok(new { message = "Görev güncellendi." });
    }

    [HttpDelete("challenges/{id}")]
    public async Task<IActionResult> DeleteChallenge(Guid id)
    {
        var result = await _challengeService.DeleteChallengeAsync(id);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });
        return Ok(new { message = "Görev silindi." });
    }

    // --- Shop Management ---

    [HttpGet("shop-items")]
    public async Task<IActionResult> GetAllShopItems()
    {
        var result = await _shopService.GetAllItemsForAdminAsync();
        return Ok(result.Data);
    }

    [HttpPost("shop-items")]
    public async Task<IActionResult> CreateShopItem([FromBody] DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto dto)
    {
        var result = await _shopService.CreateItemAsync(dto);
        return Ok(new { id = result.Data });
    }

    [HttpPut("shop-items/{id}")]
    public async Task<IActionResult> UpdateShopItem(Guid id, [FromBody] DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto dto)
    {
        var result = await _shopService.UpdateItemAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });
        return Ok(new { message = "Ürün güncellendi." });
    }

    [HttpDelete("shop-items/{id}")]
    public async Task<IActionResult> DeleteShopItem(Guid id)
    {
        var result = await _shopService.DeleteItemAsync(id);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });
        return Ok(new { message = "Ürün silindi." });
    }
}
