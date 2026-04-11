// Path: DeuYbsLms.Application/DTOs/Teacher/StudentAnalyticsDto.cs

namespace DeuYbsLms.Application.DTOs.Teacher;

public class StudentAnalyticsDto
{
    public Guid StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int CompletionPercentage { get; set; }
    public int FailedQuizAttempts { get; set; }
    public bool IsRedFlag { get; set; } // e.g. low progress or high failures
}
