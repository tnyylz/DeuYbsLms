// Path: DeuYbsLms.Domain/Entities/Course/Lesson.cs

using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

// Skill Tree'deki her düğüm bir Lesson'dır.
// OrderIndex = Kilit sisteminin kalbi. 1. ders bitmeden 2. ders açılmaz.
public class Lesson : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public string? TextContent { get; set; }
    public string? ResourceUrl { get; set; }
    public int DurationInSeconds { get; set; }
    public int OrderIndex { get; set; }   // KİLİT SIRASI — bu alan her şeyi yönetir
    public int XpReward { get; set; } = 50;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Quiz? Quiz { get; set; }
}