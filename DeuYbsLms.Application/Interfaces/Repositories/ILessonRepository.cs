// Path: DeuYbsLms.Application/Interfaces/Repositories/ILessonRepository.cs

using DeuYbsLms.Domain.Entities.Course;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface ILessonRepository : IRepository<Lesson>
{
    Task<Lesson?> GetLessonWithQuizAsync(Guid lessonId);
    Task<List<Lesson>> GetCourseLessonsOrderedAsync(Guid courseId);
    Task<Lesson?> GetNextLessonAsync(Guid courseId, int currentOrderIndex);
}