// Path: DeuYbsLms.Domain/Entities/Progress/CourseEnrollment.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;
using CourseEntities = DeuYbsLms.Domain.Entities.Course;  // Alias verdik

namespace DeuYbsLms.Domain.Entities.Progress;

public class CourseEnrollment : BaseEntity
{
    public Guid StudentId { get; set; }
    public AppUser Student { get; set; } = null!;

    public Guid CourseId { get; set; }
    public CourseEntities.Course Course { get; set; } = null!;  // Alias ile çağırıyoruz

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public bool IsCourseCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public KanbanStatus KanbanStatus { get; set; } = KanbanStatus.ToDo;

    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public Certificate? Certificate { get; set; }
}