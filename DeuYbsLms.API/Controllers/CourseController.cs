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
        var course = _mapper.Map<DeuYbsLms.Domain.Entities.Course.Course>(request);
        course.Id = Guid.NewGuid();
        course.CreatedAt = DateTime.UtcNow;
        await _courseRepository.AddAsync(course);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course.Id);
    }
}