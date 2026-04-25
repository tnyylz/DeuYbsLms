using DeuYbsLms.Application.DTOs.Admin;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;

    public AdminService(
        IUserRepository userRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository)
    {
        _userRepository = userRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var courses = await _courseRepository.GetCoursesForAdminAsync();
        var enrollments = await _enrollmentRepository.GetAllAsync();

        // Top Courses
        var topCourses = courses
            .OrderByDescending(c => c.Enrollments?.Count ?? 0)
            .Take(5)
            .Select(c => new AdminTopCourseDto
            {
                Id = c.Id,
                Title = c.Title,
                EnrollmentCount = c.Enrollments?.Count ?? 0
            }).ToList();

        // Monthly Registrations (Last 6 Months)
        var monthlyRegistrations = new List<MonthlyRegistrationDto>();
        for (int i = 5; i >= 0; i--)
        {
            var targetMonth = DateTime.UtcNow.AddMonths(-i);
            var monthName = targetMonth.ToString("MMM yyyy"); // "Eki 2026" vs "Oct 2026"
            var count = users.Count(u => u.CreatedAt.Year == targetMonth.Year && u.CreatedAt.Month == targetMonth.Month);
            monthlyRegistrations.Add(new MonthlyRegistrationDto { Month = monthName, Count = count });
        }

        // Recent Activities (Combining recent users and recent enrollments)
        var recentUsers = users.OrderByDescending(u => u.CreatedAt).Take(5).Select(u => new AdminRecentActivityDto
        {
            Message = $"{u.FirstName} {u.LastName} platforma kayıt oldu.",
            CreatedAt = u.CreatedAt
        });

        // Normally we might add enrollments too, but for simplicity let's just use recent users and latest courses
        var recentCourses = courses.OrderByDescending(c => c.CreatedAt).Take(5).Select(c => new AdminRecentActivityDto
        {
            Message = $"Yeni kurs yayınlandı: {c.Title}",
            CreatedAt = c.CreatedAt
        });

        var recentActivities = recentUsers.Concat(recentCourses)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .ToList();

        return new AdminDashboardStatsDto
        {
            TotalUsers = users.Count,
            TotalCourses = courses.Count,
            TotalEnrollments = enrollments.Count,
            TopCourses = topCourses,
            MonthlyRegistrations = monthlyRegistrations,
            RecentActivities = recentActivities
        };
    }

    public async Task<List<AdminUserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        
        return users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).OrderByDescending(u => u.CreatedAt).ToList();
    }

    public async Task<AdminUserDetailDto> GetUserDetailAsync(Guid userId)
    {
        var user = await _userRepository.GetUserWithProfileAsync(userId);
        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        var enrollments = await _enrollmentRepository.GetStudentEnrollmentsAsync(userId);

        var dto = new AdminUserDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            TotalXp = user.StudentProfile?.TotalXp ?? 0,
            CurrentLevel = user.StudentProfile?.CurrentLevel ?? 0,
            EnrolledCoursesCount = enrollments.Count,
            CompletedCoursesCount = enrollments.Count(e => e.IsCourseCompleted),
            Enrollments = enrollments.Select(e => new AdminUserEnrollmentDto
            {
                CourseId = e.CourseId,
                CourseTitle = e.Course?.Title ?? "Bilinmeyen Kurs",
                EnrolledAt = e.EnrolledAt,
                IsCompleted = e.IsCourseCompleted,
                ProgressPercentage = e.Course?.Lessons.Count > 0 
                    ? (int)((double)e.LessonProgresses.Count(lp => lp.IsVideoCompleted) / e.Course.Lessons.Count * 100) 
                    : 0
            }).ToList()
        };

        return dto;
    }

    public async Task UpdateUserRoleAsync(Guid userId, UserRole role)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
    }

    public async Task ToggleUserStatusAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        // Toggle
        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
    }

    public async Task<List<AdminCourseDto>> GetAllCoursesAsync()
    {
        var courses = await _courseRepository.GetCoursesForAdminAsync();

        return courses.Select(c => new AdminCourseDto
        {
            Id = c.Id,
            Title = c.Title,
            TeacherName = c.Teacher?.FullName ?? "Bilinmiyor",
            Level = (int)c.Level,
            IsPublished = c.IsPublished,
            EnrollmentCount = c.Enrollments?.Count ?? 0,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    public async Task DeleteCourseAsync(Guid courseId)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw new Exception("Kurs bulunamadı.");

        await _courseRepository.DeleteAsync(course);
    }
}
