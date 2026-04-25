using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

public class LearningPath : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Difficulty { get; set; } = "Intermediate"; // Beginner, Intermediate, Advanced
    
    public Guid? TeacherId { get; set; }
    public virtual DeuYbsLms.Domain.Entities.Identity.AppUser? Teacher { get; set; }
    
    public bool IsPublished { get; set; } = false;

    // Yollara ait kurslar (sıralı)
    public virtual ICollection<LearningPathCourse> Courses { get; set; } = new List<LearningPathCourse>();
}
