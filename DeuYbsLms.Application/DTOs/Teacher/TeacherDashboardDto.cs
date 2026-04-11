// Path: DeuYbsLms.Application/DTOs/Teacher/TeacherDashboardDto.cs

namespace DeuYbsLms.Application.DTOs.Teacher;

public class TeacherDashboardDto
{
    public int TotalCourses { get; set; }
    public int TotalStudents { get; set; }
    public int TotalEnrollments { get; set; }
    public List<TeacherCourseDto> Courses { get; set; } = new();
}

public class TeacherCourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public int EnrollmentCount { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsPublished { get; set; }
}
