// Path: DeuYbsLms.Application/DTOs/Course/CourseDetailDto.cs

namespace DeuYbsLms.Application.DTOs.Course;

// Skill Tree sayfası için: Kurs + tüm dersler
public class CourseDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Level { get; set; } = string.Empty;
    public int TotalXpReward { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public List<LessonDto> Lessons { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public bool IsPublished { get; set; }
    public bool HasFinalExam { get; set; }
    public int? FinalExamMinPassingScore { get; set; }
}