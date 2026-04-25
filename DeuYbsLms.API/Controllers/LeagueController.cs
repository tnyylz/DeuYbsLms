// Path: DeuYbsLms.API/Controllers/LeagueController.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class LeagueController : ControllerBase
{
    private readonly ILeagueService _leagueService;

    public LeagueController(ILeagueService leagueService)
    {
        _leagueService = leagueService;
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetMyLeagueLeaderboard()
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _leagueService.GetMyLeagueLeaderboardAsync(studentId);
        
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
            
        return Ok(result.Data);
    }

    [HttpPost("ensure-group")]
    public async Task<IActionResult> EnsureInGroup()
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _leagueService.EnsureStudentInLeagueGroupAsync(studentId);
        
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);
            
        return Ok(new { LeagueGroupId = result.Data });
    }
}
