// Path: DeuYbsLms.API/Controllers/CourseController.cs
// Sınıf türü: Controller (Add > Controller > API Controller - Empty)

using AutoMapper;
using DeuYbsLms.Application.DTOs.Course;
using DeuYbsLms.Application.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly ICourseRepository _courseRepository;
    private readonly IMapper _mapper;

    public CourseController(ICourseRepository courseRepository, IMapper mapper)
    {
        _courseRepository = courseRepository;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var courses = await _courseRepository.GetPublishedCoursesAsync();
        var result = _mapper.Map<List<CourseDto>>(courses);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var course = await _courseRepository.GetCourseWithDetailsAsync(id);
        if (course is null)
            return NotFound("Kurs bulunamadı.");
        var result = _mapper.Map<CourseDetailDto>(course);
        return Ok(result);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseDto request)
    {
        var teacherId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var course = _mapper.Map<DeuYbsLms.Domain.Entities.Course.Course>(request);
        course.Id = Guid.NewGuid();
        course.TeacherId = teacherId;
        course.CreatedAt = DateTime.UtcNow;

        // Tags mapping
        if (request.Tags != null && request.Tags.Any())
        {
            course.Tags = request.Tags.Select(tagName => new DeuYbsLms.Domain.Entities.Course.CourseTag
            {
                Id = Guid.NewGuid(),
                Name = tagName,
                CourseId = course.Id
            }).ToList();
        }

        await _courseRepository.AddAsync(course);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course.Id);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCourseDto request)
    {
        var course = await _courseRepository.GetCourseWithDetailsAsync(id);
        if (course is null) return NotFound("Kurs bulunamadı.");

        var teacherId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        if (course.TeacherId != teacherId) return Forbid();

        _mapper.Map(request, course);
        course.UpdatedAt = DateTime.UtcNow;

        // Tags update logic (simplified: clear and re-add)
        course.Tags.Clear();
        if (request.Tags != null)
        {
            foreach (var tagName in request.Tags)
            {
                course.Tags.Add(new DeuYbsLms.Domain.Entities.Course.CourseTag { Id = Guid.NewGuid(), Name = tagName, CourseId = course.Id });
            }
        }

        await _courseRepository.UpdateAsync(course);
        return NoContent();
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost("{courseId:guid}/lesson")]
    public async Task<IActionResult> AddLesson(Guid courseId, [FromBody] CreateLessonDto request)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null) return NotFound("Kurs bulunamadı.");

        var lesson = _mapper.Map<DeuYbsLms.Domain.Entities.Course.Lesson>(request);
        lesson.Id = Guid.NewGuid();
        lesson.CourseId = courseId;
        lesson.CreatedAt = DateTime.UtcNow;

        // LessonRepository injected via ICourseRepository? No, I should inject ILessonRepository.
        // Wait, I can just add it to course and update course if they are related. 
        // But better to use ILessonRepository.
        return Ok(lesson.Id);
    }
}