// Path: DeuYbsLms.Domain/Entities/Course/CourseTag.cs

using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

public class CourseTag : BaseEntity
{
    public string Name { get; set; } = string.Empty; // "SQL", "Python", "Veri Analizi"
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
}