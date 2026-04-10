// Path: DeuYbsLms.Application/Interfaces/Services/IProgressService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IProgressService
{
    Task<Result<bool>> EnrollStudentAsync(Guid studentId, Guid courseId);
    Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid studentId, Guid courseId);
    Task<Result<LessonProgressDto>> CompleteVideoAsync(Guid studentId, Guid lessonId);
    Task<Result<QuizResultDto>> SubmitQuizAsync(Guid studentId, SubmitQuizDto request);
    Task<Result<List<EnrollmentDto>>> GetStudentEnrollmentsAsync(Guid studentId);
}