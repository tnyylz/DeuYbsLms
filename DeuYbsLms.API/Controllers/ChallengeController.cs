// Path: DeuYbsLms.API/Controllers/ChallengeController.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class ChallengeController : ControllerBase
{
    private readonly IChallengeService _challengeService;

    public ChallengeController(IChallengeService challengeService)
    {
        _challengeService = challengeService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyChallenges()
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _challengeService.GetMyChallengesAsync(studentId);
        
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
            
        return Ok(result.Data);
    }

    [HttpPost("claim/{id:guid}")]
    public async Task<IActionResult> ClaimReward(Guid id)
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _challengeService.ClaimChallengeRewardAsync(studentId, id);
        
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
            
        return Ok(result.Data);
    }

    [HttpPost("seed")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> SeedChallenges()
    {
        await _challengeService.CreateSeasonalChallengesAsync();
        return Ok(new { Message = "Sistem challenge'ları başarıyla oluşturuldu." });
    }
}
