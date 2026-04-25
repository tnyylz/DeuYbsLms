using DeuYbsLms.Application.Abstractions.Services;
using DeuYbsLms.Application.DTOs.Course;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LearningPathController : ControllerBase
{
    private readonly ILearningPathService _learningPathService;

    public LearningPathController(ILearningPathService learningPathService)
    {
        _learningPathService = learningPathService;
    }

    [HttpGet]
    public async Task<ActionResult<List<LearningPathDto>>> GetAll()
    {
        var paths = await _learningPathService.GetAllPathsAsync();
        return Ok(paths);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LearningPathDto>> GetById(Guid id)
    {
        var path = await _learningPathService.GetPathByIdAsync(id);
        if (path == null) return NotFound();
        return Ok(path);
    }

    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        await _learningPathService.SeedDefaultPathsAsync();
        return Ok(new { message = "Öğrenme yolları başarıyla oluşturuldu." });
    }
}
