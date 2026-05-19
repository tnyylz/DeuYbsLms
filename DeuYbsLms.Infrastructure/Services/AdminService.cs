using DeuYbsLms.Application.DTOs.Admin;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly AppDbContext _context;

    public AdminService(
        IUserRepository userRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository,
        AppDbContext context)
    {
        _userRepository = userRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
        _context = context;
    }

    public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var courses = await _courseRepository.GetCoursesForAdminAsync();
        var enrollments = await _enrollmentRepository.GetAllAsync();
        
        var completedLessons = await _context.LessonProgresses
            .Where(lp => lp.IsVideoCompleted)
            .ToListAsync();

        var certificatesList = await _context.Certificates
            .ToListAsync();

        var studentProfiles = await _context.StudentProfiles
            .Include(s => s.AppUser)
            .ToListAsync();

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

        // Monthly Stats (Last 6 Months)
        var monthlyRegistrations = new List<MonthlyRegistrationDto>();
        var monthlyEnrollments = new List<MonthlyRegistrationDto>();
        var monthlyCompletedLessons = new List<MonthlyRegistrationDto>();
        var monthlyCertificates = new List<MonthlyRegistrationDto>();
        
        for (int i = 5; i >= 0; i--)
        {
            var targetMonth = DateTime.UtcNow.AddMonths(-i);
            var monthName = targetMonth.ToString("MMM yyyy"); // "Eki 2026"
            
            var userCount = users.Count(u => u.CreatedAt.Year == targetMonth.Year && u.CreatedAt.Month == targetMonth.Month);
            monthlyRegistrations.Add(new MonthlyRegistrationDto { Month = monthName, Count = userCount });

            var enrollmentCount = enrollments.Count(e => e.EnrolledAt.Year == targetMonth.Year && e.EnrolledAt.Month == targetMonth.Month);
            monthlyEnrollments.Add(new MonthlyRegistrationDto { Month = monthName, Count = enrollmentCount });

            var lessonCount = completedLessons.Count(lp => (lp.VideoCompletedAt ?? lp.CreatedAt).Year == targetMonth.Year && (lp.VideoCompletedAt ?? lp.CreatedAt).Month == targetMonth.Month);
            monthlyCompletedLessons.Add(new MonthlyRegistrationDto { Month = monthName, Count = lessonCount });

            var certCount = certificatesList.Count(c => c.IssuedAt.Year == targetMonth.Year && c.IssuedAt.Month == targetMonth.Month);
            monthlyCertificates.Add(new MonthlyRegistrationDto { Month = monthName, Count = certCount });
        }

        // League Distributions
        var leagueDistributions = studentProfiles
            .GroupBy(s => s.CurrentLeagueTier)
            .Select(g => new LeagueDistributionDto
            {
                LeagueName = g.Key.ToString(),
                StudentCount = g.Count()
            })
            .OrderBy(l => l.LeagueName)
            .ToList();

        // Student Leaderboard (Top 10)
        var studentLeaderboard = studentProfiles
            .OrderByDescending(s => s.TotalXp)
            .Take(10)
            .Select(s => new StudentLeaderboardDto
            {
                FullName = s.AppUser != null ? $"{s.AppUser.FirstName} {s.AppUser.LastName}" : "Bilinmeyen Öğrenci",
                TotalXp = s.TotalXp,
                Level = s.CurrentLevel,
                League = gümüşLigIsmi(s.CurrentLeagueTier)
            }).ToList();

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
            TotalStudents = users.Count(u => u.Role == UserRole.Student),
            TotalTeachers = users.Count(u => u.Role == UserRole.Teacher),
            TotalCompletedEnrollments = enrollments.Count(e => e.IsCourseCompleted),
            TopCourses = topCourses,
            MonthlyRegistrations = monthlyRegistrations,
            MonthlyEnrollments = monthlyEnrollments,
            MonthlyCompletedLessons = monthlyCompletedLessons,
            MonthlyCertificates = monthlyCertificates,
            LeagueDistributions = leagueDistributions,
            StudentLeaderboard = studentLeaderboard,
            RecentActivities = recentActivities
        };
    }

    private static string gümüşLigIsmi(LeagueTier tier)
    {
        return tier switch
        {
            LeagueTier.Demir => "Demir Ligi",
            LeagueTier.Bronz => "Bronz Ligi",
            LeagueTier.Gümüş => "Gümüş Ligi",
            LeagueTier.Altın => "Altın Ligi",
            LeagueTier.Platin => "Platin Ligi",
            LeagueTier.Zümrüt => "Zümrüt Ligi",
            LeagueTier.Elmas => "Elmas Ligi",
            LeagueTier.Ustalık => "Ustalık Ligi",
            LeagueTier.Üstatlık => "Üstatlık Ligi",
            LeagueTier.Şampiyonluk => "Şampiyonluk Ligi",
            _ => "Demir Ligi"
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

    public async Task AssignCourseAsync(Guid courseId, CourseAssignmentDto request)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null) throw new Exception("Kurs bulunamadı.");

        var allUsers = await _userRepository.GetAllWithProfileAsync();
        var students = allUsers.Where(u => u.Role == UserRole.Student && u.StudentProfile != null).ToList();

        // Filter by grade level if specified
        if (request.GradeLevel.HasValue && request.GradeLevel.Value > 0)
        {
            students = students.Where(s => s.StudentProfile!.GradeLevel == request.GradeLevel.Value).ToList();
        }

        // Filter by student numbers if specified (AND logic or OR logic? Usually it's OR logic if both provided, but let's just union them or intersect. Actually, if GradeLevel is provided, we assign to all in that grade. If StudentNumbers provided, we also add them.)
        // But the requirement says: "3.sınıf olanlara veya 4.sınıf olanlar olarak atabilmeli kursları bir de ek olarak istediği öğrencileri de ekleyebilmeli numarasıyla" -> So it's an additive (Union) logic.
        
        var targetStudents = new HashSet<Guid>();

        // Add students from grade level
        if (request.GradeLevel.HasValue && request.GradeLevel.Value > 0)
        {
            var gradeStudents = allUsers.Where(u => u.Role == UserRole.Student && u.StudentProfile != null && u.StudentProfile.GradeLevel == request.GradeLevel.Value);
            foreach (var s in gradeStudents) targetStudents.Add(s.Id);
        }

        // Add specific students by number
        if (request.StudentNumbers != null && request.StudentNumbers.Any())
        {
            var numbers = request.StudentNumbers.Select(n => n.Trim()).Where(n => !string.IsNullOrEmpty(n)).ToList();
            if (numbers.Any())
            {
                var specificStudents = allUsers.Where(u => u.Role == UserRole.Student && u.StudentProfile != null && !string.IsNullOrEmpty(u.StudentProfile.StudentNumber) && numbers.Contains(u.StudentProfile.StudentNumber));
                foreach (var s in specificStudents) targetStudents.Add(s.Id);
            }
        }

        if (!targetStudents.Any()) throw new Exception("Atama yapılacak öğrenci bulunamadı.");

        // Get existing enrollments for this course
        var existingEnrollments = await _enrollmentRepository.GetAllAsync(); // Since there is no specific GetByCourseId we filter in memory, or add a method. For now memory is fine for small scale.
        var courseEnrollmentStudentIds = existingEnrollments.Where(e => e.CourseId == courseId).Select(e => e.StudentId).ToHashSet();

        var newEnrollments = new List<DeuYbsLms.Domain.Entities.Progress.CourseEnrollment>();
        foreach (var studentId in targetStudents)
        {
            if (!courseEnrollmentStudentIds.Contains(studentId))
            {
                newEnrollments.Add(new DeuYbsLms.Domain.Entities.Progress.CourseEnrollment
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId,
                    StudentId = studentId,
                    EnrolledAt = DateTime.UtcNow,
                    IsCourseCompleted = false
                });
            }
        }

        if (newEnrollments.Any())
        {
            foreach (var enrollment in newEnrollments)
            {
                await _enrollmentRepository.AddAsync(enrollment);
            }
        }
    }

    public async Task DeleteCourseAsync(Guid courseId)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw new Exception("Kurs bulunamadı.");

        await _courseRepository.DeleteAsync(course);
    }
}
