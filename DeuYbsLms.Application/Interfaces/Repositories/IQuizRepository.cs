// Path: DeuYbsLms.Application/Interfaces/Repositories/IQuizRepository.cs

using DeuYbsLms.Domain.Entities.Course;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface IQuizRepository : IRepository<Quiz>
{
    Task<Quiz?> GetQuizWithQuestionsAsync(Guid quizId);
    Task<Quiz?> GetQuizByLessonIdAsync(Guid lessonId);
}
