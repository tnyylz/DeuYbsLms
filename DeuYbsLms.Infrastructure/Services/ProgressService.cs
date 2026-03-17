// Path: DeuYbsLms.Infrastructure/Services/ProgressService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Domain.Entities.Progress;

namespace DeuYbsLms.Infrastructure.Services;

public class ProgressService : IProgressService
{
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IProgressRepository _progressRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IGamificationService _gamificationService;

    public interface IProgressService
    {
        Task<Result<bool>> EnrollStudentAsync(Guid studentId, Guid courseId);
        Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid studentId, Guid courseId);
        Task<Result<LessonProgressDto>> CompleteVideoAsync(Guid studentId, Guid lessonId);
        Task<Result<QuizResultDto>> SubmitQuizAsync(Guid studentId, SubmitQuizDto request);
    }

    public async Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid studentId, Guid courseId)
    {
        var enrollment = await _enrollmentRepository.GetEnrollmentWithProgressAsync(studentId, courseId);

        if (enrollment is null)
            return Result<CourseProgressDto>.Failure("Bu kursa kayıtlı değilsiniz.");

        var totalLessons = enrollment.Course.Lessons.Count;
        var completedLessons = enrollment.LessonProgresses.Count(lp => lp.IsQuizPassed);

        var lessonDtos = enrollment.Course.Lessons.Select(lesson =>
        {
            var progress = enrollment.LessonProgresses
                .FirstOrDefault(lp => lp.LessonId == lesson.Id);

            return new LessonProgressDto
            {
                LessonId = lesson.Id,
                LessonTitle = lesson.Title,
                OrderIndex = lesson.OrderIndex,
                IsUnlocked = progress?.IsUnlocked ?? false,
                IsVideoCompleted = progress?.IsVideoCompleted ?? false,
                IsQuizPassed = progress?.IsQuizPassed ?? false,
                LastQuizScore = progress?.LastQuizScore,
                QuizAttemptCount = progress?.QuizAttemptCount ?? 0
            };
        }).OrderBy(l => l.OrderIndex).ToList();

        return Result<CourseProgressDto>.Success(new CourseProgressDto
        {
            CourseId = courseId,
            CourseTitle = enrollment.Course.Title,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessons,
            CompletionPercentage = totalLessons > 0
                ? Math.Round((double)completedLessons / totalLessons * 100, 1)
                : 0,
            IsCompleted = enrollment.IsCourseCompleted,
            LessonProgresses = lessonDtos
        });
    }

    public async Task<Result<LessonProgressDto>> CompleteVideoAsync(Guid studentId, Guid lessonId)
    {
        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson is null)
            return Result<LessonProgressDto>.Failure("Ders bulunamadı.");

        var enrollment = await _enrollmentRepository
            .GetEnrollmentWithProgressAsync(studentId, lesson.CourseId);

        if (enrollment is null)
            return Result<LessonProgressDto>.Failure("Bu kursa kayıtlı değilsiniz.");

        var progress = enrollment.LessonProgresses
            .FirstOrDefault(lp => lp.LessonId == lessonId);

        if (progress is null || !progress.IsUnlocked)
            return Result<LessonProgressDto>.Failure("Bu ders henüz kilitli.");

        if (!progress.IsVideoCompleted)
        {
            progress.IsVideoCompleted = true;
            progress.VideoCompletedAt = DateTime.UtcNow;
            await _progressRepository.UpdateAsync(progress);

            // Video tamamlama XP'si
            await _gamificationService.AwardXpAsync(studentId, 10, $"Video tamamlandı: {lesson.Title}");
        }

        return Result<LessonProgressDto>.Success(MapToDto(progress, lesson.Title, lesson.OrderIndex));
    }

    public async Task<Result<QuizResultDto>> SubmitQuizAsync(Guid studentId, SubmitQuizDto request)
    {
        var lesson = await _lessonRepository.GetLessonWithQuizAsync(request.LessonId);

        if (lesson?.Quiz is null)
            return Result<QuizResultDto>.Failure("Bu derse ait quiz bulunamadı.");

        var enrollment = await _enrollmentRepository
            .GetEnrollmentWithProgressAsync(studentId, lesson.CourseId);

        if (enrollment is null)
            return Result<QuizResultDto>.Failure("Bu kursa kayıtlı değilsiniz.");

        var progress = enrollment.LessonProgresses
            .FirstOrDefault(lp => lp.LessonId == request.LessonId);

        if (progress is null || !progress.IsVideoCompleted)
            return Result<QuizResultDto>.Failure("Önce videoyu tamamlamalısınız.");

        // Quiz puanlama motoru
        var quiz = lesson.Quiz;
        int correctCount = 0;

        foreach (var question in quiz.Questions)
        {
            var studentAnswer = request.Answers
                .FirstOrDefault(a => a.QuestionId == question.Id);

            if (studentAnswer is null) continue;

            var correctOption = question.AnswerOptions
                .FirstOrDefault(ao => ao.IsCorrect);

            if (correctOption?.Id == studentAnswer.SelectedAnswerOptionId)
                correctCount++;
        }

        double score = quiz.Questions.Count > 0
            ? Math.Round((double)correctCount / quiz.Questions.Count * 100, 1)
            : 0;

        bool isPassed = score >= quiz.MinimumPassingScore;

        // Progress güncelle
        progress.QuizAttemptCount++;
        progress.LastQuizScore = score;

        if (isPassed && !progress.IsQuizPassed)
        {
            progress.IsQuizPassed = true;
            progress.QuizPassedAt = DateTime.UtcNow;

            // Sonraki dersi aç
            await UnlockNextLessonAsync(enrollment, lesson.OrderIndex);

            // Quiz geçme XP'si
            await _gamificationService.AwardXpAsync(studentId, 25, $"Quiz geçildi: {lesson.Title}");

            // Kurs tamamlandı mı kontrol et
            await CheckCourseCompletionAsync(enrollment, studentId);
        }

        await _progressRepository.UpdateAsync(progress);

        return Result<QuizResultDto>.Success(new QuizResultDto
        {
            LessonId = request.LessonId,
            Score = score,
            IsPassed = isPassed,    
            CorrectAnswers = correctCount,
            TotalQuestions = quiz.Questions.Count,
            MinimumPassingScore = quiz.MinimumPassingScore,
            AttemptCount = progress.QuizAttemptCount,
            Message = isPassed
                ? "Tebrikler! Quiz'i geçtiniz. 🎉"
                : $"Başarısız. Puanınız: {score}. Geçme puanı: {quiz.MinimumPassingScore}"
        });
    }

    public async Task<Result<bool>> EnrollStudentAsync(Guid studentId, Guid courseId)
    {
        if (await _enrollmentRepository.IsStudentEnrolledAsync(studentId, courseId))
            return Result<bool>.Failure("Bu kursa zaten kayıtlısınız.");

        var enrollment = new CourseEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            CourseId = courseId,
            EnrolledAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _enrollmentRepository.AddAsync(enrollment);

        // İlk dersi otomatik aç
        var lessons = await _lessonRepository.GetCourseLessonsOrderedAsync(courseId);
        if (lessons.Any())
        {
            var firstProgress = new LessonProgress
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollment.Id,
                LessonId = lessons.First().Id,
                IsUnlocked = true, // İlk ders her zaman açık
                CreatedAt = DateTime.UtcNow
            };
            await _progressRepository.AddAsync(firstProgress);
        }

        // Kayıt XP'si
        await _gamificationService.AwardXpAsync(studentId, 5, "Kursa kayıt olundu");

        return Result<bool>.Success(true);
    }

    // --- Private Yardımcı Metodlar ---

    private async Task UnlockNextLessonAsync(CourseEnrollment enrollment, int currentOrderIndex)
    {
        var nextLesson = await _lessonRepository
            .GetNextLessonAsync(enrollment.CourseId, currentOrderIndex);

        if (nextLesson is null) return;

        var existingProgress = enrollment.LessonProgresses
            .FirstOrDefault(lp => lp.LessonId == nextLesson.Id);

        if (existingProgress is not null)
        {
            existingProgress.IsUnlocked = true;
            await _progressRepository.UpdateAsync(existingProgress);
        }
        else
        {
            await _progressRepository.AddAsync(new LessonProgress
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollment.Id,
                LessonId = nextLesson.Id,
                IsUnlocked = true,
                CreatedAt = DateTime.UtcNow
            });
        }
    }

    private async Task CheckCourseCompletionAsync(CourseEnrollment enrollment, Guid studentId)
    {
        var allProgresses = await _progressRepository.GetEnrollmentProgressAsync(enrollment.Id);
        var totalLessons = enrollment.Course.Lessons.Count;

        if (allProgresses.Count(lp => lp.IsQuizPassed) == totalLessons)
        {
            enrollment.IsCourseCompleted = true;
            enrollment.CompletedAt = DateTime.UtcNow;
            await _enrollmentRepository.UpdateAsync(enrollment);

            // Kurs tamamlama XP + rozet
            await _gamificationService.AwardXpAsync(studentId, 100, "Kurs tamamlandı!");
            await _gamificationService.CheckAndAwardBadgesAsync(studentId);
        }
    }

    private static LessonProgressDto MapToDto(LessonProgress lp, string title, int orderIndex) =>
        new()
        {
            LessonId = lp.LessonId,
            LessonTitle = title,
            OrderIndex = orderIndex,
            IsUnlocked = lp.IsUnlocked,
            IsVideoCompleted = lp.IsVideoCompleted,
            IsQuizPassed = lp.IsQuizPassed,
            LastQuizScore = lp.LastQuizScore,
            QuizAttemptCount = lp.QuizAttemptCount
        };

    
}
