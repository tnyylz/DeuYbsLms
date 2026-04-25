using AutoMapper;
using DeuYbsLms.Application.Abstractions.Services;
using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Course;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class LearningPathService : ILearningPathService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public LearningPathService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<LearningPathDto>> GetAllPathsAsync(bool onlyPublished = true)
    {
        var query = _context.LearningPaths
            .Include(p => p.Courses)
                .ThenInclude(lpc => lpc.Course)
                    .ThenInclude(c => c.Lessons)
            .AsQueryable();

        if (onlyPublished)
            query = query.Where(p => p.IsPublished);

        var paths = await query.ToListAsync();
        return _mapper.Map<List<LearningPathDto>>(paths);
    }

    public async Task<LearningPathDto> GetPathByIdAsync(Guid pathId)
    {
        var path = await _context.LearningPaths
            .Include(p => p.Courses.OrderBy(c => c.OrderIndex))
                .ThenInclude(lpc => lpc.Course)
                    .ThenInclude(c => c.Lessons)
                        .ThenInclude(l => l.Quiz)
            .FirstOrDefaultAsync(p => p.Id == pathId);

        if (path == null) return null!;

        return _mapper.Map<LearningPathDto>(path);
    }

    public async Task<Result<List<LearningPathDto>>> GetTeacherPathsAsync(Guid teacherId)
    {
        var paths = await _context.LearningPaths
            .Include(p => p.Courses)
            .Where(p => p.TeacherId == teacherId)
            .ToListAsync();

        return Result<List<LearningPathDto>>.Success(_mapper.Map<List<LearningPathDto>>(paths));
    }

    public async Task<Result<Guid>> CreatePathAsync(Guid teacherId, CreateLearningPathDto dto)
    {
        var path = new LearningPath
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            ThumbnailUrl = dto.ThumbnailUrl,
            Difficulty = dto.Difficulty,
            IsPublished = dto.IsPublished,
            TeacherId = teacherId,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.CourseIds != null && dto.CourseIds.Any())
        {
            for (int i = 0; i < dto.CourseIds.Count; i++)
            {
                path.Courses.Add(new LearningPathCourse
                {
                    Id = Guid.NewGuid(),
                    LearningPathId = path.Id,
                    CourseId = dto.CourseIds[i],
                    OrderIndex = i + 1,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.LearningPaths.AddAsync(path);
        await _context.SaveChangesAsync();

        return Result<Guid>.Success(path.Id);
    }

    public async Task<Result<bool>> UpdatePathAsync(Guid teacherId, Guid pathId, CreateLearningPathDto dto)
    {
        var path = await _context.LearningPaths
            .Include(p => p.Courses)
            .FirstOrDefaultAsync(p => p.Id == pathId);

        if (path == null) return Result<bool>.Failure("Yol haritası bulunamadı.");
        if (path.TeacherId != teacherId) return Result<bool>.Failure("Bu işlem için yetkiniz yok.");

        path.Title = dto.Title;
        path.Description = dto.Description;
        path.ThumbnailUrl = dto.ThumbnailUrl;
        path.Difficulty = dto.Difficulty;
        path.IsPublished = dto.IsPublished;
        path.UpdatedAt = DateTime.UtcNow;

        // Kursları güncelle
        _context.LearningPathCourses.RemoveRange(path.Courses);
        path.Courses.Clear();

        if (dto.CourseIds != null && dto.CourseIds.Any())
        {
            for (int i = 0; i < dto.CourseIds.Count; i++)
            {
                path.Courses.Add(new LearningPathCourse
                {
                    Id = Guid.NewGuid(),
                    LearningPathId = path.Id,
                    CourseId = dto.CourseIds[i],
                    OrderIndex = i + 1,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DeletePathAsync(Guid teacherId, Guid pathId)
    {
        var path = await _context.LearningPaths.FindAsync(pathId);
        if (path == null) return Result<bool>.Failure("Yol haritası bulunamadı.");
        if (path.TeacherId != teacherId) return Result<bool>.Failure("Bu işlem için yetkiniz yok.");

        _context.LearningPaths.Remove(path);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }

    public async Task SeedDefaultPathsAsync()
    {
        if (await _context.LearningPaths.AnyAsync()) return;

        var courses = await _context.Courses.Take(5).ToListAsync();
        if (courses.Count < 2) return;

        var path = new LearningPath
        {
            Id = Guid.NewGuid(),
            Title = "Full-Stack Geliştirici Yolculuğu",
            Description = "Frontend'den Backend'e, modern web teknolojilerini adım adım öğrenin.",
            Difficulty = "Advanced",
            ThumbnailUrl = "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        };

        var pathCourses = new List<LearningPathCourse>();
        for (int i = 0; i < courses.Count; i++)
        {
            pathCourses.Add(new LearningPathCourse
            {
                Id = Guid.NewGuid(),
                LearningPathId = path.Id,
                CourseId = courses[i].Id,
                OrderIndex = i + 1,
                CreatedAt = DateTime.UtcNow
            });
        }

        path.Courses = pathCourses;
        await _context.LearningPaths.AddAsync(path);
        await _context.SaveChangesAsync();
    }
}
