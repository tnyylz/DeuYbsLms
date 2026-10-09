// Path: DeuYbsLms.Infrastructure/Services/TeacherService.cs

using DeuYbsLms.Application.DTOs.Teacher;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class TeacherService : ITeacherService
{
    private readonly AppDbContext _context;
    private readonly ICourseRepository _courseRepository;

    public TeacherService(AppDbContext context, ICourseRepository courseRepository)
    {
        _context = context;
        _courseRepository = courseRepository;
    }

    public async Task<TeacherDashboardDto> GetDashboardStatsAsync(Guid teacherId)
    {
        var courses = await _context.Courses
            .Where(c => c.TeacherId == teacherId)
            .Select(c => new TeacherCourseDto
            {
                Id = c.Id,
                Title = c.Title,
                IsPublished = c.IsPublished,
                ThumbnailUrl = c.ThumbnailUrl,
                LessonCount = c.Lessons.Count,
                EnrollmentCount = c.Enrollments.Count
            })
            .ToListAsync();

        var totalStudents = await _context.CourseEnrollments
            .Where(e => e.Course.TeacherId == teacherId)
            .Select(e => e.StudentId)
            .Distinct()
            .CountAsync();

        var totalEnrollments = courses.Sum(c => c.EnrollmentCount);

        return new TeacherDashboardDto
        {
            TotalCourses = courses.Count,
            TotalStudents = totalStudents,
            TotalEnrollments = totalEnrollments,
            Courses = courses
        };
    }

    public async Task<List<StudentAnalyticsDto>> GetCourseAnalyticsAsync(Guid courseId)
    {
        var course = await _context.Courses
            .Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return new List<StudentAnalyticsDto>();

        var enrollments = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.LessonProgresses)
            .Where(e => e.CourseId == courseId)
            .ToListAsync();

        var totalLessons = course.Lessons.Count;

        return enrollments.Select(e =>
        {
            var completedLessons = e.LessonProgresses.Count(lp => lp.IsVideoCompleted);
            var completionPercentage = totalLessons > 0 ? (completedLessons * 100) / totalLessons : 0;
            
            // Simplified logic for red flag: less than 20% progress if enrolled > 7 days ago, OR > 3 failed quiz attempts if we had that data
            // Since we don't have a 'FailedQuizAttempts' column in Enrollment yet, we'll placeholder it.
            var isRedFlag = completionPercentage < 10; 

            return new StudentAnalyticsDto
            {
                StudentId = e.StudentId,
                FullName = e.Student.FullName,
                Email = e.Student.Email,
                CourseTitle = course.Title,
                CompletionPercentage = completionPercentage,
                FailedQuizAttempts = 0, // Placeholder
                IsRedFlag = isRedFlag
            };
        }).ToList();
    }

    public async Task<List<StudentAnalyticsDto>> GetAllStudentsAnalyticsAsync(Guid teacherId)
    {
        var teacherCourses = await _context.Courses
            .Where(c => c.TeacherId == teacherId)
            .Select(c => c.Id)
            .ToListAsync();

        var allAnalytics = new List<StudentAnalyticsDto>();
        foreach (var courseId in teacherCourses)
        {
            allAnalytics.AddRange(await GetCourseAnalyticsAsync(courseId));
        }

        return allAnalytics;
    }
    
    public async Task<bool> IsTeacherCourseOwnerAsync(Guid courseId, Guid teacherId)
    {
        return await _context.Courses.AnyAsync(c => c.Id == courseId && c.TeacherId == teacherId);
    }
}
