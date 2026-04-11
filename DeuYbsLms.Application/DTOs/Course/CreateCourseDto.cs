// Path: DeuYbsLms.Application/DTOs/Course/CreateCourseDto.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Course;

// Teacher'ın kurs oluştururken gönderdiği veri
public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public CourseLevel Level { get; set; }
    public int TotalXpReward { get; set; } = 500;
    public List<string> Tags { get; set; } = new();
    public bool IsPublished { get; set; }
}