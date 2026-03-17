// Path: DeuYbsLms.Application/DTOs/Gamification/BadgeCheckContextDto.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Gamification;

// GamificationService'e "hangi bağlamda rozet kontrolü yapılacak?" diye söyler
public class BadgeCheckContextDto
{
    public bool JustPassedFirstQuiz { get; set; }
    public bool JustGotPerfectScore { get; set; }
    public bool JustCompletedCourse { get; set; }
    public bool JustPassedAfterMultipleFailures { get; set; }
    public Guid? RelatedCourseId { get; set; }
    public Guid? RelatedLessonId { get; set; }
    public int? QuizScore { get; set; }
}