// Path: DeuYbsLms.Infrastructure/Persistence/Repositories/EnrollmentRepository.cs

using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class EnrollmentRepository : Repository<CourseEnrollment>, IEnrollmentRepository
{
    public EnrollmentRepository(AppDbContext context) : base(context) { }

    public async Task<CourseEnrollment?> GetEnrollmentWithProgressAsync(Guid studentId, Guid courseId)
        => await _context.CourseEnrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons.OrderBy(l => l.OrderIndex))
                    .ThenInclude(l => l.Quiz)
            .Include(e => e.Course)
                .ThenInclude(c => c.FinalExam)
            .Include(e => e.LessonProgresses)
                .ThenInclude(lp => lp.Lesson)
            .Include(e => e.Certificate)
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

    public async Task<List<CourseEnrollment>> GetStudentEnrollmentsAsync(Guid studentId)
        => await _context.CourseEnrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
                    .ThenInclude(l => l.Quiz)
            .Include(e => e.Course)
                .ThenInclude(c => c.FinalExam)
            .Include(e => e.LessonProgresses)
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

    public async Task<bool> IsStudentEnrolledAsync(Guid studentId, Guid courseId)
        => await _context.CourseEnrollments
            .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
}