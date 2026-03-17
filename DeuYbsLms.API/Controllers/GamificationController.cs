// Path: DeuYbsLms.API/Controllers/GamificationController.cs
// Sınıf türü: Controller (Add > Controller > API Controller - Empty)

using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class GamificationController : ControllerBase
{
    private readonly IGamificationService _gamificationService;

    public GamificationController(IGamificationService gamificationService)
    {
        _gamificationService = gamificationService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetGamificationProfile()
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _gamificationService.GetStudentGamificationAsync(studentId);
        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);
        return Ok(result.Data);
    }
}