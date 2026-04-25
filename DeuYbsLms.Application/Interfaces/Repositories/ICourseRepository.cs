// Path: DeuYbsLms.Application/Interfaces/Repositories/ICourseRepository.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Domain.Entities.Course;

namespace DeuYbsLms.Application.Interfaces.Repositories;

// Generic repository'nin karşılayamadığı özel sorgular buraya gelir.
// Örneğin: Lesson ve Quiz'leriyle birlikte Course getirmek
// JOIN içeren sorgular burada tanımlanır.
public interface ICourseRepository : IRepository<Course>
{
    Task<Course?> GetCourseWithDetailsAsync(Guid courseId);
    Task<List<Course>> GetPublishedCoursesAsync();
    Task<List<Course>> GetCoursesByTeacherAsync(Guid teacherId);
    Task<List<Course>> SearchCoursesAsync(string searchTerm);
    Task<List<Course>> GetCoursesForAdminAsync();
}