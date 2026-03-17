// Path: DeuYbsLms.Domain/Entities/Progress/LessonProgress.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Course;

namespace DeuYbsLms.Domain.Entities.Progress;

// KİLİT SİSTEMİNİN KALBİ
// Her öğrenci için her ders için 1 kayıt tutulur.
// IsVideoCompleted = true VE QuizScore >= MinimumPassingScore → sonraki ders açılır
public class LessonProgress : BaseEntity
{
    public Guid EnrollmentId { get; set; }
    public CourseEnrollment Enrollment { get; set; } = null!;

    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;

    public bool IsUnlocked { get; set; } = false;        // Önceki ders geçilince true olur
    public bool IsVideoCompleted { get; set; } = false;  // Video bitince true olur (onEnded)
    public int QuizAttemptCount { get; set; } = 0;       // 3+ olursa Early Warning Radar'da kırmızı
    public double? LastQuizScore { get; set; }              // 0-100 arası yüzde
    public bool IsQuizPassed { get; set; } = false;      // LastQuizScore >= MinimumPassingScore ise true
    public DateTime? VideoCompletedAt { get; set; }
    public DateTime? QuizPassedAt { get; set; }
}