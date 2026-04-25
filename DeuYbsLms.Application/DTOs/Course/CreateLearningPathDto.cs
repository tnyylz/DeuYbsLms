namespace DeuYbsLms.Application.DTOs.Course;

public class CreateLearningPathDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Difficulty { get; set; } = "Intermediate";
    public bool IsPublished { get; set; }
    public List<Guid> CourseIds { get; set; } = new();
}
