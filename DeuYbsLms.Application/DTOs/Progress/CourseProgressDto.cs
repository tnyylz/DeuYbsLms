// Path: DeuYbsLms.Application/DTOs/Progress/CourseProgressDto.cs

namespace DeuYbsLms.Application.DTOs.Progress;

public class CourseProgressDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public double CompletionPercentage { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsFinalExamPassed { get; set; }
    public double? LastFinalExamScore { get; set; }
    public List<LessonProgressDto> LessonProgresses { get; set; } = new();
}