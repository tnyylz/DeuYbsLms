// Path: DeuYbsLms.Infrastructure/Persistence/Repositories/LessonRepository.cs

using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class LessonRepository : Repository<Lesson>, ILessonRepository
{
    public LessonRepository(AppDbContext context) : base(context) { }

    public async Task<Lesson?> GetLessonWithQuizAsync(Guid lessonId)
        => await _context.Lessons
            .Include(l => l.Quiz)
                .ThenInclude(q => q!.Questions)
                    .ThenInclude(q => q.AnswerOptions)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

    public async Task<List<Lesson>> GetCourseLessonsOrderedAsync(Guid courseId)
        => await _context.Lessons
            .Include(l => l.Quiz)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.OrderIndex)
            .ToListAsync();

    public async Task<Lesson?> GetNextLessonAsync(Guid courseId, int currentOrderIndex)
        => await _context.Lessons
            .Where(l => l.CourseId == courseId && l.OrderIndex == currentOrderIndex + 1)
            .FirstOrDefaultAsync();
}