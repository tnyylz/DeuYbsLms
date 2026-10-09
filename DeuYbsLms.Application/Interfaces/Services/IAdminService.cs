using DeuYbsLms.Application.DTOs.Admin;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IAdminService
{
    Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
    
    Task<List<AdminUserDto>> GetAllUsersAsync();
    Task<AdminUserDetailDto> GetUserDetailAsync(Guid userId);
    Task UpdateUserRoleAsync(Guid userId, UserRole role);
    Task ToggleUserStatusAsync(Guid userId);
    
    Task<List<AdminCourseDto>> GetAllCoursesAsync();
    Task DeleteCourseAsync(Guid courseId);
    Task AssignCourseAsync(Guid courseId, CourseAssignmentDto request);
    Task<AdminCourseAnalyticsDto> GetCourseAnalyticsAsync(Guid courseId);
}
