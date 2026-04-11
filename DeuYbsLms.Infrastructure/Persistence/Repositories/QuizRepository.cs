// Path: DeuYbsLms.Infrastructure/Persistence/Repositories/QuizRepository.cs

using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class QuizRepository : Repository<Quiz>, IQuizRepository
{
    public QuizRepository(AppDbContext context) : base(context) { }

    public async Task<Quiz?> GetQuizWithQuestionsAsync(Guid quizId)
    {
        return await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qs => qs.AnswerOptions)
            .FirstOrDefaultAsync(q => q.Id == quizId);
    }

    public async Task<Quiz?> GetQuizByLessonIdAsync(Guid lessonId)
    {
        return await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qs => qs.AnswerOptions)
            .FirstOrDefaultAsync(q => q.LessonId == lessonId);
    }
}
