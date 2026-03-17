// Path: DeuYbsLms.Infrastructure/Persistence/Repositories/ProgressRepository.cs

using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class ProgressRepository : Repository<LessonProgress>, IProgressRepository
{
    public ProgressRepository(AppDbContext context) : base(context) { }

    public async Task<LessonProgress?> GetProgressAsync(Guid enrollmentId, Guid lessonId)
        => await _context.LessonProgresses
            .Include(lp => lp.Lesson)
            .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollmentId && lp.LessonId == lessonId);

    public async Task<List<LessonProgress>> GetEnrollmentProgressAsync(Guid enrollmentId)
        => await _context.LessonProgresses
            .Include(lp => lp.Lesson)
            .Where(lp => lp.EnrollmentId == enrollmentId)
            .OrderBy(lp => lp.Lesson.OrderIndex)
            .ToListAsync();

    public async Task<List<LessonProgress>> GetFailingStudentsAsync(Guid courseId, int failThreshold = 3)
        => await _context.LessonProgresses
            .Include(lp => lp.Enrollment)
                .ThenInclude(e => e.Student)
            .Include(lp => lp.Lesson)
            .Where(lp => lp.Lesson.CourseId == courseId &&
                         lp.QuizAttemptCount >= failThreshold &&
                         !lp.IsQuizPassed)
            .ToListAsync();
}