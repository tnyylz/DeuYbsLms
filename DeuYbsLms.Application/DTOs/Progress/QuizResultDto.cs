using DeuYbsLms.Application.DTOs.Gamification;

namespace DeuYbsLms.Application.DTOs.Progress;

// Quiz gönderildikten sonra frontend'e dönen sonuç
public class QuizResultDto
{
    public Guid LessonId { get; set; }
    public double Score { get; set; }              // 0-100 yüzde
    public double MinimumPassingScore { get; set; }
    public bool IsPassed { get; set; }
    public int CorrectAnswers { get; set; }
    public int TotalQuestions { get; set; }
    public string Message { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public bool NextLessonUnlocked { get; set; }
    public Guid? NextLessonId { get; set; }
    public bool IsCourseCompleted { get; set; }
    public string? EarnedBadge { get; set; }    // Varsa kazanılan rozet adı
    public XpResultDto? XpResult { get; set; }
    public Guid? EnrollmentId { get; set; }
}