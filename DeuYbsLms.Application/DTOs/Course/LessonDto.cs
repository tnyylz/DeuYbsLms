// Path: DeuYbsLms.Application/DTOs/Course/LessonDto.cs

namespace DeuYbsLms.Application.DTOs.Course;

public class LessonDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
    public string? VideoUrl { get; set; }
    public string? TextContent { get; set; }
    public string? ResourceUrl { get; set; }
    public int DurationInSeconds { get; set; }
    public int XpReward { get; set; }
    public bool HasQuiz { get; set; }
    public int? QuizMinPassingScore { get; set; }
}