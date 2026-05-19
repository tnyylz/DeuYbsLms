// Path: DeuYbsLms.Infrastructure/Services/ProgressService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Infrastructure.Services;

public class ProgressService : IProgressService
{
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IProgressRepository _progressRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IGamificationService _gamificationService;
    private readonly IChallengeService _challengeService;

    public ProgressService(
        IEnrollmentRepository enrollmentRepository,
        IProgressRepository progressRepository,
        ILessonRepository lessonRepository,
        IGamificationService gamificationService,
        IChallengeService challengeService)
    {
        _enrollmentRepository = enrollmentRepository;
        _progressRepository = progressRepository;
        _lessonRepository = lessonRepository;
        _gamificationService = gamificationService;
        _challengeService = challengeService;
    }

    public async Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid studentId, Guid courseId)
    {
        var enrollment = await _enrollmentRepository.GetEnrollmentWithProgressAsync(studentId, courseId);

        if (enrollment is null)
            return Result<CourseProgressDto>.Failure("Bu kursa kayıtlı değilsiniz.");

        var totalLessons = enrollment.Course.Lessons.Count;
        var completedLessons = GetCompletedLessonsCount(enrollment.Course.Lessons, enrollment.LessonProgresses);

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
                LastWatchedSecond = progress?.LastWatchedSecond ?? 0,
                QuizAttemptCount = progress?.QuizAttemptCount ?? 0
            };
        }).OrderBy(l => l.OrderIndex).ToList();

        var isTrulyCompleted = totalLessons > 0 && completedLessons == totalLessons;

        // DB bayrağını senkronize et (Örn: yeni ders eklenmişse IsCourseCompleted hala true olabilir)
        if (enrollment.IsCourseCompleted != isTrulyCompleted)
        {
            enrollment.IsCourseCompleted = isTrulyCompleted;
            if (!isTrulyCompleted)
            {
                enrollment.CompletedAt = null;
                enrollment.KanbanStatus = DeuYbsLms.Domain.Enums.KanbanStatus.InProgress;
            }
            await _enrollmentRepository.UpdateAsync(enrollment);
        }

        return Result<CourseProgressDto>.Success(new CourseProgressDto
        {
            CourseId = courseId,
            CourseTitle = enrollment.Course.Title,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessons,
            CompletionPercentage = totalLessons > 0
                ? Math.Round((double)completedLessons / totalLessons * 100, 1)
                : 0,
            IsCompleted = isTrulyCompleted,
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

        if (progress is null)
        {
            var lessonsList = enrollment.Course.Lessons.OrderBy(l => l.OrderIndex).ToList();
            var currentIndex = lessonsList.FindIndex(l => l.Id == lessonId);
            
            bool isUnlocked = false;
            if (currentIndex == 0) isUnlocked = true;
            else if (currentIndex > 0)
            {
                var prevLesson = lessonsList[currentIndex - 1];
                var prevProgress = enrollment.LessonProgresses.FirstOrDefault(p => p.LessonId == prevLesson.Id);
                if (prevProgress != null && prevProgress.IsVideoCompleted)
                {
                    if (prevLesson.Quiz == null || prevProgress.IsQuizPassed)
                        isUnlocked = true;
                }
            }

            if (isUnlocked)
            {
                progress = new LessonProgress
                {
                    Id = Guid.NewGuid(),
                    EnrollmentId = enrollment.Id,
                    LessonId = lessonId,
                    IsUnlocked = true,
                    CreatedAt = DateTime.UtcNow
                };
                await _progressRepository.AddAsync(progress);
                enrollment.LessonProgresses.Add(progress);
            }
            else
            {
                return Result<LessonProgressDto>.Failure("Bu ders henüz kilitli. Lütfen önceki dersleri tamamlayın.");
            }
        }
        else if (!progress.IsUnlocked)
        {
            return Result<LessonProgressDto>.Failure("Bu ders henüz kilitli. Lütfen önceki dersleri tamamlayın.");
        }

        if (!progress.IsVideoCompleted)
        {
            progress.IsVideoCompleted = true;
            progress.VideoCompletedAt = DateTime.UtcNow;

            // Eğer quizi yoksa, video bitince sonraki dersi aç
            var lessonWithQuiz = await _lessonRepository.GetLessonWithQuizAsync(lessonId);
            if (lessonWithQuiz?.Quiz == null)
            {
                await UnlockNextLessonAsync(enrollment, lessonId);
                await CheckCourseCompletionAsync(enrollment, studentId);
            }

            await _progressRepository.UpdateAsync(progress);
            
            // Kanban Status Güncelleme: İzleniyor
            if (enrollment.KanbanStatus == DeuYbsLms.Domain.Enums.KanbanStatus.ToDo || enrollment.KanbanStatus == DeuYbsLms.Domain.Enums.KanbanStatus.Recommended)
            {
                enrollment.KanbanStatus = DeuYbsLms.Domain.Enums.KanbanStatus.InProgress;
                await _enrollmentRepository.UpdateAsync(enrollment);
            }

            var xpResult = await _gamificationService.AwardXpAsync(studentId, lesson.XpReward, $"Video tamamlandı: {lesson.Title}");

            // Görev ilerleme: Ders tamamlama
            await _challengeService.UpdateChallengeProgressAsync(studentId, ChallengeType.LessonCompletion, 1);

            var dto = MapToDto(progress, lesson.Title, lesson.OrderIndex);
            dto.XpResult = xpResult;
            return Result<LessonProgressDto>.Success(dto);
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
        XpResultDto? xpResult = null;

        bool justPassed = isPassed && !progress.IsQuizPassed;

        if (justPassed)
        {
            progress.IsQuizPassed = true;
            progress.QuizPassedAt = DateTime.UtcNow;

            var lessonsList = enrollment.Course.Lessons.OrderBy(l => l.OrderIndex).ToList();
            var currentIndex = lessonsList.FindIndex(l => l.Id == lesson.Id);
            
            if (currentIndex >= 0 && currentIndex < lessonsList.Count - 1)
            {
                var nextLesson = lessonsList[currentIndex + 1];
                nextLessonId = nextLesson.Id;
                nextLessonUnlocked = true;
            }

            await UnlockNextLessonAsync(enrollment, lesson.Id);

            xpResult = await _gamificationService.AwardXpAsync(studentId, lesson.XpReward, $"Quiz geçildi: {lesson.Title}");

            // Görev ilerleme: Quiz başarısı
            await _challengeService.UpdateChallengeProgressAsync(studentId, ChallengeType.QuizSuccess, 1);
        }

        await _progressRepository.UpdateAsync(progress); // önce DB'ye yaz

        if (justPassed)
        {
            // Kanban Status Güncelleme: İzleniyor
            if (enrollment.KanbanStatus == DeuYbsLms.Domain.Enums.KanbanStatus.ToDo || enrollment.KanbanStatus == DeuYbsLms.Domain.Enums.KanbanStatus.Recommended)
            {
                enrollment.KanbanStatus = DeuYbsLms.Domain.Enums.KanbanStatus.InProgress;
                await _enrollmentRepository.UpdateAsync(enrollment);
            }
            await CheckCourseCompletionAsync(enrollment, studentId); // sonra kontrol et
        }

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
            XpResult = xpResult,
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

    public async Task<Result<bool>> SaveVideoProgressAsync(Guid studentId, Guid lessonId, int second)
    {
        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson == null) return Result<bool>.Failure("Ders bulunamadı.");

        var enrollment = await _enrollmentRepository.GetEnrollmentWithProgressAsync(studentId, lesson.CourseId);
        if (enrollment == null) return Result<bool>.Failure("Kayıt bulunamadı.");

        var progress = enrollment.LessonProgresses.FirstOrDefault(lp => lp.LessonId == lessonId);
        if (progress == null) return Result<bool>.Failure("İlerleme kaydı bulunamadı.");

        if (progress.LastWatchedSecond < second)
        {
            progress.LastWatchedSecond = second;
            await _progressRepository.UpdateAsync(progress);
        }

        return Result<bool>.Success(true);
    }

    // --- Private Yardımcı Metodlar ---

    private async Task UnlockNextLessonAsync(CourseEnrollment enrollment, Guid currentLessonId)
    {
        var lessonsList = enrollment.Course.Lessons.OrderBy(l => l.OrderIndex).ToList();
        var currentIndex = lessonsList.FindIndex(l => l.Id == currentLessonId);

        if (currentIndex < 0 || currentIndex >= lessonsList.Count - 1) return;

        var nextLesson = lessonsList[currentIndex + 1];

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
        var completedCount = GetCompletedLessonsCount(enrollment.Course.Lessons, allProgresses);

        if (completedCount == totalLessons && totalLessons > 0)
        {
            enrollment.IsCourseCompleted = true;
            enrollment.CompletedAt = DateTime.UtcNow;
            enrollment.KanbanStatus = DeuYbsLms.Domain.Enums.KanbanStatus.Done; // Kanban: Bitenler
            await _enrollmentRepository.UpdateAsync(enrollment);

            await _gamificationService.AwardXpAsync(studentId, 100, "Kurs tamamlandı!");
            await _gamificationService.CheckAndAwardBadgesAsync(studentId);
        }
    }

    public async Task<Result<List<EnrollmentDto>>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        var enrollments = await _enrollmentRepository.GetStudentEnrollmentsAsync(studentId);

        var enrollmentDtos = enrollments.Select(e => 
        {
            var total = e.Course.Lessons.Count;
            var completed = GetCompletedLessonsCount(e.Course.Lessons, e.LessonProgresses);

            var isTrulyCompleted = total > 0 && completed == total;

            return new EnrollmentDto
            {
                EnrollmentId = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                ThumbnailUrl = e.Course.ThumbnailUrl,
                EnrolledAt = e.EnrolledAt,
                IsCourseCompleted = isTrulyCompleted,
                CompletedLessonsCount = completed,
                TotalLessonsCount = total
            };
        }).ToList();

        return Result<List<EnrollmentDto>>.Success(enrollmentDtos);
    }

    private static int GetCompletedLessonsCount(IEnumerable<DeuYbsLms.Domain.Entities.Course.Lesson> lessons, IEnumerable<LessonProgress> progresses)
    {
        return lessons.Count(l => 
        {
            var progress = progresses.FirstOrDefault(p => p.LessonId == l.Id);
            if (progress == null) return false;
            return l.Quiz == null ? progress.IsVideoCompleted : progress.IsQuizPassed;
        });
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
            LastWatchedSecond = lp.LastWatchedSecond,
            QuizAttemptCount = lp.QuizAttemptCount
        };
}