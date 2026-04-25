using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

public class LearningPathCourse : BaseEntity
{
    public Guid LearningPathId { get; set; }
    public virtual LearningPath LearningPath { get; set; } = null!;
    
    public Guid CourseId { get; set; }
    public virtual Course Course { get; set; } = null!;
    
    public int OrderIndex { get; set; }
}
