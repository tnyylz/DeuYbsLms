// Path: DeuYbsLms.Application/Interfaces/Repositories/IEnrollmentRepository.cs

using DeuYbsLms.Domain.Entities.Progress;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface IEnrollmentRepository : IRepository<CourseEnrollment>
{
    Task<CourseEnrollment?> GetEnrollmentWithProgressAsync(Guid studentId, Guid courseId);
    Task<List<CourseEnrollment>> GetStudentEnrollmentsAsync(Guid studentId);
    Task<bool> IsStudentEnrolledAsync(Guid studentId, Guid courseId);
}