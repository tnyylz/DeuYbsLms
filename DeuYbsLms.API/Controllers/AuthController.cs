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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);
            return Ok(result.Data);
        }
        catch (Exception ex)
        {
            // Log the error (could use a logger)
            Console.WriteLine($"Register Error: {ex}");
            return StatusCode(500, new { message = "Sunucu tarafında bir hata oluştu.", details = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.IsSuccess)
            return Unauthorized(result.ErrorMessage);
        return Ok(result.Data);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _authService.GetProfileAsync(userId);
        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);
        return Ok(result.Data);
    }
}