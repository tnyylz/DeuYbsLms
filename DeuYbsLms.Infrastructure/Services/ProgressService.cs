// Path: DeuYbsLms.Infrastructure/Services/ProgressService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Progress;

namespace DeuYbsLms.Infrastructure.Services;

public class ProgressService : IProgressService
{
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IProgressRepository _progressRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IGamificationService _gamificationService;

    public ProgressService(
        IEnrollmentRepository enrollmentRepository,
        IProgressRepository progressRepository,
        ILessonRepository lessonRepository,
        IGamificationService gamificationService)
    {
        _enrollmentRepository = enrollmentRepository;
        _progressRepository = progressRepository;
        _lessonRepository = lessonRepository;
        _gamificationService = gamificationService;
    }

    public async Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid studentId, Guid courseId)
    {
        var enrollment = await _enrollmentRepository.GetEnrollmentWithProgressAsync(studentId, courseId);

        if (enrollment is null)
            return Result<CourseProgressDto>.Failure("Bu kursa kayıtlı değilsiniz.");

        var totalLessons = enrollment.Course.Lessons.Count;
        var completedLessons = enrollment.LessonProgresses.Count(lp => 
        {
            var lesson = enrollment.Course.Lessons.FirstOrDefault(l => l.Id == lp.LessonId);
            if (lesson == null) return false;
            return lesson.Quiz == null ? lp.IsVideoCompleted : lp.IsQuizPassed;
        });

        var lessonDtos = enrollment.Course.Lessons.Select(lesson =>
        {
            var progress = enrollment.LessonProgresses
                .FirstOrDefault(lp => lp.LessonId == lesson.Id);

            return new LessonProgressDto
            {
                LessonId = lesson.Id,
                LessonTitle = lesson.Title,
                OrderIndex = lesson.OrderIndex,
                IsUnlocked = progress?.IsUnlocked ?? (lesson.OrderIndex == 1 || enrollment.Course.Lessons.OrderBy(l => l.OrderIndex).First().Id == lesson.Id),
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

            // Eğer quizi yoksa, video bitince sonraki dersi aç
            var lessonWithQuiz = await _lessonRepository.GetLessonWithQuizAsync(lessonId);
            if (lessonWithQuiz?.Quiz == null)
            {
                await UnlockNextLessonAsync(enrollment, lesson.OrderIndex);
                await CheckCourseCompletionAsync(enrollment, studentId);
            }

            await _progressRepository.UpdateAsync(progress);
            await _gamificationService.AwardXpAsync(studentId, lesson.XpReward, $"Video tamamlandı: {lesson.Title}");
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
            var studentAnswer = request.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            if (studentAnswer is null) continue;

            var correctOption = question.AnswerOptions.FirstOrDefault(ao => ao.IsCorrect);
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

        Guid? nextLessonId = null;
        bool nextLessonUnlocked = false;
        int xpEarned = 0;

        bool justPassed = isPassed && !progress.IsQuizPassed;

        if (justPassed)
        {
            progress.IsQuizPassed = true;
            progress.QuizPassedAt = DateTime.UtcNow;

            var nextLesson = await _lessonRepository.GetNextLessonAsync(lesson.CourseId, lesson.OrderIndex);
            if (nextLesson is not null)
            {
                nextLessonId = nextLesson.Id;
                nextLessonUnlocked = true;
            }

            await UnlockNextLessonAsync(enrollment, lesson.OrderIndex);

            xpEarned = await _gamificationService.AwardXpAsync(studentId, lesson.XpReward, $"Quiz geçildi: {lesson.Title}");
        }

        await _progressRepository.UpdateAsync(progress); // önce DB'ye yaz

        if (justPassed)
            await CheckCourseCompletionAsync(enrollment, studentId); // sonra kontrol et

        return Result<QuizResultDto>.Success(new QuizResultDto
        {
            LessonId = request.LessonId,
            Score = score,
            IsPassed = isPassed,
            CorrectAnswers = correctCount,
            TotalQuestions = quiz.Questions.Count,
            MinimumPassingScore = quiz.MinimumPassingScore,
            AttemptCount = progress.QuizAttemptCount,
            NextLessonUnlocked = nextLessonUnlocked,
            NextLessonId = nextLessonId,
            XpEarned = xpEarned,
            IsCourseCompleted = enrollment.IsCourseCompleted, // ✅ burası güncellendi
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

        var lessons = await _lessonRepository.GetCourseLessonsOrderedAsync(courseId);
        if (lessons.Any())
        {
            var firstProgress = new LessonProgress
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollment.Id,
                LessonId = lessons.First().Id,
                IsUnlocked = true,
                CreatedAt = DateTime.UtcNow
            };
            await _progressRepository.AddAsync(firstProgress);
        }

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

        var completedCount = allProgresses.Count(lp => 
        {
            var lesson = enrollment.Course.Lessons.FirstOrDefault(l => l.Id == lp.LessonId);
            if (lesson == null) return false;
            return lesson.Quiz == null ? lp.IsVideoCompleted : lp.IsQuizPassed;
        });

        if (completedCount == totalLessons && totalLessons > 0)
        {
            enrollment.IsCourseCompleted = true;
            enrollment.CompletedAt = DateTime.UtcNow;
            await _enrollmentRepository.UpdateAsync(enrollment);

            await _gamificationService.AwardXpAsync(studentId, 100, "Kurs tamamlandı!");
            await _gamificationService.CheckAndAwardBadgesAsync(studentId);
        }
    }

    public async Task<Result<List<EnrollmentDto>>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        var enrollments = await _enrollmentRepository.GetStudentEnrollmentsAsync(studentId);

        var enrollmentDtos = enrollments.Select(e => new EnrollmentDto
        {
            EnrollmentId = e.Id,
            CourseId = e.CourseId,
            CourseTitle = e.Course.Title,
            ThumbnailUrl = e.Course.ThumbnailUrl,
            EnrolledAt = e.EnrolledAt,
            IsCourseCompleted = e.IsCourseCompleted,
            CompletedLessonsCount = e.LessonProgresses.Count(lp => 
            {
                var lesson = e.Course.Lessons.FirstOrDefault(l => l.Id == lp.LessonId);
                if (lesson == null) return false;
                return lesson.Quiz == null ? lp.IsVideoCompleted : lp.IsQuizPassed;
            }),
            TotalLessonsCount = e.Course.Lessons.Count
        }).ToList();

        return Result<List<EnrollmentDto>>.Success(enrollmentDtos);
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