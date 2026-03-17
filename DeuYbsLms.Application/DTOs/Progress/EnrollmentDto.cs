// Path: DeuYbsLms.Application/DTOs/Progress/EnrollmentDto.cs

namespace DeuYbsLms.Application.DTOs.Progress;

public class EnrollmentDto
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
    public bool IsCourseCompleted { get; set; }
    public int CompletedLessonsCount { get; set; }
    public int TotalLessonsCount { get; set; }
    public double ProgressPercentage => TotalLessonsCount == 0 ? 0
        : Math.Round((double)CompletedLessonsCount / TotalLessonsCount * 100, 1);
}