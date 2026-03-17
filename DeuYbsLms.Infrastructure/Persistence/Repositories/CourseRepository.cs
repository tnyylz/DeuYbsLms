// Path: DeuYbsLms.Infrastructure/Persistence/Repositories/CourseRepository.cs

using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class CourseRepository : Repository<Course>, ICourseRepository
{
    public CourseRepository(AppDbContext context) : base(context) { }

    public async Task<Course?> GetCourseWithDetailsAsync(Guid courseId)
        => await _context.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Tags)
            .Include(c => c.Lessons.OrderBy(l => l.OrderIndex))
                .ThenInclude(l => l.Quiz)
                    .ThenInclude(q => q!.Questions)
                        .ThenInclude(q => q.AnswerOptions)
            .FirstOrDefaultAsync(c => c.Id == courseId);

    public async Task<List<Course>> GetPublishedCoursesAsync()
        => await _context.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Tags)
            .Include(c => c.Lessons)
            .Where(c => c.IsPublished)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<List<Course>> GetCoursesByTeacherAsync(Guid teacherId)
        => await _context.Courses
            .Include(c => c.Tags)
            .Include(c => c.Lessons)
            .Include(c => c.Enrollments)
            .Where(c => c.TeacherId == teacherId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<List<Course>> SearchCoursesAsync(string searchTerm)
        => await _context.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Tags)
            .Where(c => c.IsPublished &&
                (c.Title.Contains(searchTerm) ||
                 c.Description.Contains(searchTerm) ||
                 c.Tags.Any(t => t.Name.Contains(searchTerm))))
            .ToListAsync();
}