// Path: DeuYbsLms.Domain/Entities/Course/Quiz.cs

using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Course;

public class Quiz : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    // KİLİT KAPIСИ: Öğrenci bu puanın altında kalırsa bir sonraki ders açılmaz
    public int MinimumPassingScore { get; set; } = 70;

    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}