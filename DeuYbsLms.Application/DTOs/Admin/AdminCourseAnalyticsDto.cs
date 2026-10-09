using DeuYbsLms.Application.DTOs.Admin;

namespace DeuYbsLms.Application.DTOs.Admin;

public class AdminCourseAnalyticsDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public DateTime CreatedAt { get; set; }

    // Core KPIs
    public int TotalEnrolled { get; set; }
    public int TotalCompleted { get; set; }
    public double CompletionRate { get; set; }
    public double AverageProgressRate { get; set; }
    public double FinalExamPassRate { get; set; }

    // Distributions & Lists
    public List<AdminLessonAnalyticsDto> Lessons { get; set; } = new();
    public List<MonthlyRegistrationDto> MonthlyEnrollmentTrends { get; set; } = new();
    public List<MonthlyRegistrationDto> MonthlyCompletionTrends { get; set; } = new();
    public AdminStudentSegmentationDto Segmentation { get; set; } = new();
    public List<AdminCourseStudentDto> Students { get; set; } = new();
}

public class AdminLessonAnalyticsDto
{
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool HasQuiz { get; set; }
    public int TotalViews { get; set; } // IsVideoCompleted olanlar
    public int QuizPassCount { get; set; } // IsQuizPassed olanlar
    public double QuizPassRate { get; set; } // (QuizPassCount / TotalViews) * 100
    public double CompletionRate { get; set; } // (TotalViews / TotalEnrolled) * 100
}

public class AdminStudentSegmentationDto
{
    public int Segment0to20 { get; set; }
    public int Segment21to50 { get; set; }
    public int Segment51to80 { get; set; }
    public int Segment81to99 { get; set; }
    public int Segment100 { get; set; }
}

public class AdminCourseStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public string StudentNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int CompletionPercentage { get; set; }
    public int FailedQuizAttempts { get; set; }
    public DateTime EnrolledAt { get; set; }
}
