namespace DeuYbsLms.Application.DTOs.Admin;

public class AdminCourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public int Level { get; set; }
    public bool IsPublished { get; set; }
    public int EnrollmentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
