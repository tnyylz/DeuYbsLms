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
            .Include(s => s.Inventory)
                .ThenInclude(i => i.ShopItem)
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



        // Student Leaderboard (Top 10)
        var studentLeaderboard = studentProfiles
            .OrderByDescending(s => s.CurrentLevel)
            .ThenByDescending(s => s.TotalXp)
            .Take(10)
            .Select(s => new StudentLeaderboardDto
            {
                FullName = s.AppUser != null ? $"{s.AppUser.FirstName} {s.AppUser.LastName}" : "Bilinmeyen Öğrenci",
                TotalXp = s.TotalXp,
                Level = s.CurrentLevel,
                ProfileFrameColor = s.Inventory.FirstOrDefault(i => i.IsEquipped && i.ShopItem.Type == ShopItemType.ProfileFrame)?.ShopItem.Metadata,
                CurrentTitle = s.Inventory.FirstOrDefault(i => i.IsEquipped && i.ShopItem.Type == ShopItemType.SpecialTitle)?.ShopItem.Metadata
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
            StudentLeaderboard = studentLeaderboard,
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

    public async Task<AdminCourseAnalyticsDto> GetCourseAnalyticsAsync(Guid courseId)
    {
        var course = await _context.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Lessons)
                .ThenInclude(l => l.Quiz)
            .Include(c => c.FinalExam)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            throw new Exception("Kurs bulunamadı.");

        var enrollments = await _context.CourseEnrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .Include(e => e.LessonProgresses)
            .Include(e => e.Certificate)
            .Where(e => e.CourseId == courseId)
            .ToListAsync();

        int totalEnrolled = enrollments.Count;
        int totalCompleted = enrollments.Count(e => e.IsCourseCompleted);
        double completionRate = totalEnrolled > 0 ? (double)totalCompleted / totalEnrolled * 100 : 0;

        double totalProgressSum = 0;
        int segment0to20 = 0;
        int segment21to50 = 0;
        int segment51to80 = 0;
        int segment81to99 = 0;
        int segment100 = 0;

        var totalLessonsCount = course.Lessons.Count;

        foreach (var enrollment in enrollments)
        {
            double progress = 0;
            if (totalLessonsCount > 0)
            {
                int completedLessons = course.Lessons.Count(l =>
                {
                    var p = enrollment.LessonProgresses.FirstOrDefault(x => x.LessonId == l.Id);
                    if (p == null) return false;
                    return l.Quiz == null ? p.IsVideoCompleted : p.IsQuizPassed;
                });
                
                progress = (double)completedLessons / totalLessonsCount * 100;
                
                if (enrollment.IsCourseCompleted)
                {
                    progress = 100;
                }
                else if (progress >= 100)
                {
                    progress = 99; // finished lessons but final exam not complete
                }
            }
            else
            {
                if (enrollment.IsCourseCompleted) progress = 100;
            }

            totalProgressSum += progress;

            if (progress <= 20) segment0to20++;
            else if (progress <= 50) segment21to50++;
            else if (progress <= 80) segment51to80++;
            else if (progress < 100) segment81to99++;
            else segment100++;
        }

        double averageProgressRate = totalEnrolled > 0 ? totalProgressSum / totalEnrolled : 0;

        // Final Exam Pass Rate
        int finalExamPassedCount = enrollments.Count(e => e.IsFinalExamPassed);
        int finalExamAttemptCount = enrollments.Count(e => e.LastFinalExamScore.HasValue || e.IsFinalExamPassed);
        double finalExamPassRate = finalExamAttemptCount > 0 ? (double)finalExamPassedCount / finalExamAttemptCount * 100 : 0;

        // Lesson by Lesson
        var lessonsAnalytics = new List<AdminLessonAnalyticsDto>();
        var sortedLessons = course.Lessons.OrderBy(l => l.OrderIndex).ToList();

        foreach (var lesson in sortedLessons)
        {
            var progressRecords = enrollments
                .SelectMany(e => e.LessonProgresses)
                .Where(lp => lp.LessonId == lesson.Id)
                .ToList();

            int totalViews = progressRecords.Count(lp => lp.IsVideoCompleted);
            int quizPassCount = progressRecords.Count(lp => lp.IsQuizPassed);
            double quizPassRate = totalViews > 0 ? (double)quizPassCount / totalViews * 100 : 0;
            double lessonCompletionRate = totalEnrolled > 0 ? (double)totalViews / totalEnrolled * 100 : 0;

            lessonsAnalytics.Add(new AdminLessonAnalyticsDto
            {
                LessonId = lesson.Id,
                Title = lesson.Title,
                OrderIndex = lesson.OrderIndex,
                HasQuiz = lesson.Quiz != null,
                TotalViews = totalViews,
                QuizPassCount = quizPassCount,
                QuizPassRate = Math.Round(quizPassRate, 1),
                CompletionRate = Math.Round(lessonCompletionRate, 1)
            });
        }

        // Monthly trends over last 6 months
        var monthlyEnrollmentTrends = new List<MonthlyRegistrationDto>();
        var monthlyCompletionTrends = new List<MonthlyRegistrationDto>();

        for (int i = 5; i >= 0; i--)
        {
            var targetMonth = DateTime.UtcNow.AddMonths(-i);
            var monthName = targetMonth.ToString("MMM yyyy");

            var enrollCount = enrollments.Count(e => e.EnrolledAt.Year == targetMonth.Year && e.EnrolledAt.Month == targetMonth.Month);
            monthlyEnrollmentTrends.Add(new MonthlyRegistrationDto { Month = monthName, Count = enrollCount });

            var certCount = enrollments.Count(e => e.Certificate != null && e.Certificate.IssuedAt.Year == targetMonth.Year && e.Certificate.IssuedAt.Month == targetMonth.Month);
            monthlyCompletionTrends.Add(new MonthlyRegistrationDto { Month = monthName, Count = certCount });
        }

        // Students list (All enrolled students)
        var students = new List<AdminCourseStudentDto>();

        foreach (var enrollment in enrollments)
        {
            double progress = 0;
            if (totalLessonsCount > 0)
            {
                int completed = enrollment.LessonProgresses.Count(lp =>
                {
                    var l = course.Lessons.FirstOrDefault(x => x.Id == lp.LessonId);
                    if (l == null) return false;
                    return l.Quiz == null ? lp.IsVideoCompleted : lp.IsQuizPassed;
                });
                progress = (double)completed / totalLessonsCount * 100;
                if (enrollment.IsCourseCompleted) progress = 100;
            }
            else
            {
                if (enrollment.IsCourseCompleted) progress = 100;
            }

            int failedQuizAttempts = enrollment.LessonProgresses.Sum(lp => lp.QuizAttemptCount);

            var student = enrollment.Student;
            var studentProfile = student?.StudentProfile;

            students.Add(new AdminCourseStudentDto
            {
                FullName = student != null ? $"{student.FirstName} {student.LastName}" : "Bilinmeyen Öğrenci",
                StudentNumber = studentProfile?.StudentNumber ?? "-",
                Email = student?.Email ?? "-",
                CompletionPercentage = (int)Math.Round(progress),
                FailedQuizAttempts = failedQuizAttempts,
                EnrolledAt = enrollment.EnrolledAt
            });
        }

        return new AdminCourseAnalyticsDto
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            TeacherName = course.Teacher?.FullName ?? "Bilinmiyor",
            LessonCount = totalLessonsCount,
            CreatedAt = course.CreatedAt,
            TotalEnrolled = totalEnrolled,
            TotalCompleted = totalCompleted,
            CompletionRate = Math.Round(completionRate, 1),
            AverageProgressRate = Math.Round(averageProgressRate, 1),
            FinalExamPassRate = Math.Round(finalExamPassRate, 1),
            Lessons = lessonsAnalytics,
            MonthlyEnrollmentTrends = monthlyEnrollmentTrends,
            MonthlyCompletionTrends = monthlyCompletionTrends,
            Segmentation = new AdminStudentSegmentationDto
            {
                Segment0to20 = segment0to20,
                Segment21to50 = segment21to50,
                Segment51to80 = segment51to80,
                Segment81to99 = segment81to99,
                Segment100 = segment100
            },
            Students = students.OrderBy(s => s.FullName).ToList()
        };
    }
}
