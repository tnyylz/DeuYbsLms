// Path: DeuYbsLms.API/Controllers/AuthController.cs
// Sınıf türü: Controller (Add > Controller > API Controller - Empty)

using DeuYbsLms.Application.DTOs.Auth;
using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.IsSuccess)
            return Unauthorized(new { errorMessage = result.ErrorMessage });
        return Ok(result.Data);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _authService.GetProfileAsync(userId);
        if (!result.IsSuccess)
            return NotFound(new { errorMessage = result.ErrorMessage });
        return Ok(result.Data);
    }
}