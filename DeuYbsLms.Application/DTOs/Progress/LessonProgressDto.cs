// Path: DeuYbsLms.Application/DTOs/Progress/LessonProgressDto.cs

namespace DeuYbsLms.Application.DTOs.Progress;

// Skill Tree'deki her düğümün durumu bu DTO ile taşınır
public class LessonProgressDto
{
    public Guid LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsUnlocked { get; set; }
    public bool IsVideoCompleted { get; set; }
    public bool IsQuizPassed { get; set; }
    public int QuizAttemptCount { get; set; }
    public double? LastQuizScore { get; set; }
    

    // Frontend Skill Tree için node durumu
    // "completed" | "available" | "locked"
    public string NodeStatus => !IsUnlocked ? "locked"
        : IsQuizPassed ? "completed"
        : "available";
}