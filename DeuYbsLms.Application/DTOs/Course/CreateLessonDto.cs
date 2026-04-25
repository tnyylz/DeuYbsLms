// Path: DeuYbsLms.Application/DTOs/Course/CreateLessonDto.cs

namespace DeuYbsLms.Application.DTOs.Course;

public class CreateLessonDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public string? TextContent { get; set; }
    public string? ResourceUrl { get; set; }
    public int DurationInSeconds { get; set; }
    public int OrderIndex { get; set; }
    public int XpReward { get; set; } = 50;
    public Guid CourseId { get; set; }
}