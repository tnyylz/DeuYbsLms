// Path: DeuYbsLms.API/Controllers/LessonController.cs

using AutoMapper;
using DeuYbsLms.Application.DTOs.Course;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Course;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class LessonController : ControllerBase
{
    private readonly ILessonRepository _lessonRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IMapper _mapper;

    public LessonController(ILessonRepository lessonRepository, ICourseRepository courseRepository, IMapper mapper)
    {
        _lessonRepository = lessonRepository;
        _courseRepository = courseRepository;
        _mapper = mapper;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lesson = await _lessonRepository.GetLessonWithQuizAsync(id);
        if (lesson == null) return NotFound("Ders bulunamadı.");
        var result = _mapper.Map<LessonDto>(lesson);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLessonDto request)
    {
        var course = await _courseRepository.GetCourseWithDetailsAsync(request.CourseId);
        if (course == null) return NotFound("Kurs bulunamadı.");

        // Permission check: is the user the teacher of this course?
        var teacherId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        if (course.TeacherId != teacherId) return Forbid();

        var lesson = _mapper.Map<Lesson>(request);
        lesson.Id = Guid.NewGuid();
        lesson.CreatedAt = DateTime.UtcNow;
        lesson.OrderIndex = course.Lessons.Any() ? course.Lessons.Max(l => l.OrderIndex) + 1 : 1;

        await _lessonRepository.AddAsync(lesson);
        return Ok(lesson.Id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateLessonDto request)
    {
        try
        {
            var lesson = await _lessonRepository.GetByIdAsync(id);
            if (lesson == null) return NotFound("Ders bulunamadı.");

            var course = await _courseRepository.GetByIdAsync(lesson.CourseId);
            if (course == null) return NotFound("Kurs bulunamadı.");

            var teacherIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(teacherIdStr)) return Unauthorized();
            var teacherId = Guid.Parse(teacherIdStr);

            if (course.TeacherId != teacherId) return Forbid();

            // AutoMapper'ın üzerine yazmaması gereken kritik alanları koru
            var originalOrderIndex = lesson.OrderIndex;
            var originalCourseId = lesson.CourseId;
            var originalCreatedAt = lesson.CreatedAt;

            _mapper.Map(request, lesson);

            // Korunan alanları geri yükle
            lesson.OrderIndex = originalOrderIndex;
            lesson.CourseId = originalCourseId;
            lesson.CreatedAt = originalCreatedAt;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _lessonRepository.UpdateAsync(lesson);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ders güncellenirken hata oluştu: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var lesson = await _lessonRepository.GetByIdAsync(id);
            if (lesson == null) return NotFound("Ders bulunamadı.");

            var course = await _courseRepository.GetByIdAsync(lesson.CourseId);
            if (course == null) return NotFound("Kurs bulunamadı.");

            var teacherIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(teacherIdStr)) return Unauthorized();
            var teacherId = Guid.Parse(teacherIdStr);

            if (course.TeacherId != teacherId) return Forbid();

            await _lessonRepository.DeleteAsync(lesson);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ders silinirken hata oluştu: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<LessonReorderDto> orders)
    {
        foreach (var item in orders)
        {
            var lesson = await _lessonRepository.GetByIdAsync(item.Id);
            if (lesson != null)
            {
                lesson.OrderIndex = item.OrderIndex;
                await _lessonRepository.UpdateAsync(lesson);
            }
        }
        return Ok();
    }
}

public class LessonReorderDto
{
    public Guid Id { get; set; }
    public int OrderIndex { get; set; }
}
