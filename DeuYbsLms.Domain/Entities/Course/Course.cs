// Path: DeuYbsLms.Domain/Entities/Course/Course.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Course;

public class Course : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public CourseLevel Level { get; set; }
    public bool IsPublished { get; set; } = false;
    public int TotalXpReward { get; set; } = 500;

    public Guid TeacherId { get; set; }
    public AppUser Teacher { get; set; } = null!;

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public ICollection<CourseTag> Tags { get; set; } = new List<CourseTag>();
}