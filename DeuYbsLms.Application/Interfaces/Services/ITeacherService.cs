// Path: DeuYbsLms.Application/Interfaces/Services/ITeacherService.cs

using DeuYbsLms.Application.DTOs.Teacher;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface ITeacherService
{
    Task<TeacherDashboardDto> GetDashboardStatsAsync(Guid teacherId);
    Task<List<StudentAnalyticsDto>> GetCourseAnalyticsAsync(Guid courseId);
    Task<List<StudentAnalyticsDto>> GetAllStudentsAnalyticsAsync(Guid teacherId);
}
