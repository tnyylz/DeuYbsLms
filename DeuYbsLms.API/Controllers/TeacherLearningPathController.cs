using DeuYbsLms.Application.Abstractions.Services;
using DeuYbsLms.Application.DTOs.Course;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[Authorize(Roles = "Teacher")]
[ApiController]
[Route("api/teacher/learning-paths")]
public class TeacherLearningPathController : ControllerBase
{
    private readonly ILearningPathService _learningPathService;

    public TeacherLearningPathController(ILearningPathService learningPathService)
    {
        _learningPathService = learningPathService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPaths()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _learningPathService.GetTeacherPathsAsync(userId);
        
        if (!result.IsSuccess)
            return BadRequest(new { errorMessage = result.ErrorMessage });
            
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePath([FromBody] CreateLearningPathDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _learningPathService.CreatePathAsync(userId, dto);
        
        if (!result.IsSuccess)
            return BadRequest(new { errorMessage = result.ErrorMessage });
            
        return Ok(new { id = result.Data });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePath(Guid id, [FromBody] CreateLearningPathDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _learningPathService.UpdatePathAsync(userId, id, dto);
        
        if (!result.IsSuccess)
            return BadRequest(new { errorMessage = result.ErrorMessage });
            
        return Ok(new { message = "Yol haritası güncellendi." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePath(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _learningPathService.DeletePathAsync(userId, id);
        
        if (!result.IsSuccess)
            return BadRequest(new { errorMessage = result.ErrorMessage });
            
        return Ok(new { message = "Yol haritası silindi." });
    }
}
