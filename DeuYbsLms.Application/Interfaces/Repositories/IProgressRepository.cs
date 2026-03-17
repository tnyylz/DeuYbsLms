// Path: DeuYbsLms.Application/Interfaces/Repositories/IProgressRepository.cs

using DeuYbsLms.Domain.Entities.Progress;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface IProgressRepository : IRepository<LessonProgress>
{
    Task<LessonProgress?> GetProgressAsync(Guid enrollmentId, Guid lessonId);
    Task<List<LessonProgress>> GetEnrollmentProgressAsync(Guid enrollmentId);

    // Early Warning Radar için: 3+ kez başarısız olan öğrenciler
    Task<List<LessonProgress>> GetFailingStudentsAsync(Guid courseId, int failThreshold = 3);
}