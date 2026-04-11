// Path: DeuYbsLms.Application/DTOs/Course/CourseDto.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Course;

public class CourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Level { get; set; } = string.Empty;
    public int TotalXpReward { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public int TotalDurationInSeconds { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}