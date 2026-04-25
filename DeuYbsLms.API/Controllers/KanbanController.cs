// Path: DeuYbsLms.API/Controllers/KanbanController.cs

using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class KanbanController : ControllerBase
{
    private readonly IKanbanService _kanbanService;

    public KanbanController(IKanbanService kanbanService)
    {
        _kanbanService = kanbanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyBoard()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _kanbanService.GetMyBoardAsync(userId);
        return Ok(result.Data);
    }

    [HttpPost("move")]
    public async Task<IActionResult> MoveCard([FromBody] MoveCardRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _kanbanService.UpdateCardStatusAsync(userId, request.CourseId, request.NewStatus);
        
        if (!result.IsSuccess)
            return BadRequest(new { errorMessage = result.ErrorMessage });
            
        return Ok(new { message = "Kart taşındı." });
    }
}

public class MoveCardRequest
{
    public Guid CourseId { get; set; }
    public KanbanStatus NewStatus { get; set; }
}
