// Path: DeuYbsLms.Infrastructure/Services/KanbanService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class KanbanService : IKanbanService
{
    private readonly AppDbContext _context;

    public KanbanService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<KanbanBoardDto>> GetMyBoardAsync(Guid studentId)
    {
        var enrollments = await _context.CourseEnrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .Include(e => e.Course.Lessons)
                .ThenInclude(l => l.Quiz)
            .Include(e => e.LessonProgresses)
            .Where(e => e.StudentId == studentId)
            .ToListAsync();

        var board = new KanbanBoardDto();
        
        // Ensure all columns exist
        var statusValues = Enum.GetValues<KanbanStatus>();
        foreach (var status in statusValues)
        {
            board.Columns.Add(new KanbanColumnDto
            {
                Status = status,
                Title = GetStatusTitle(status),
                Cards = enrollments
                    .Where(e => e.KanbanStatus == status)
                    .Select(e => MapToCard(e))
                    .ToList()
            });
        }

        return Result<KanbanBoardDto>.Success(board);
    }

    public async Task<Result<bool>> UpdateCardStatusAsync(Guid studentId, Guid courseId, KanbanStatus newStatus)
    {
        var enrollment = await _context.CourseEnrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

        if (enrollment == null)
            return Result<bool>.Failure("Kayıt bulunamadı.");

        enrollment.KanbanStatus = newStatus;
        
        // Sync with IsCourseCompleted if moved to Done
        if (newStatus == KanbanStatus.Done)
        {
            enrollment.IsCourseCompleted = true;
            enrollment.CompletedAt ??= DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }

    private string GetStatusTitle(KanbanStatus status)
    {
        return status switch
        {
            KanbanStatus.Recommended => "Önerilenler",
            KanbanStatus.ToDo => "Yapılacaklar",
            KanbanStatus.InProgress => "İzleniyor",
            KanbanStatus.Revisit => "Tekrar Edilecekler",
            KanbanStatus.Done => "Bitenler",
            _ => status.ToString()
        };
    }

    private KanbanCardDto MapToCard(DeuYbsLms.Domain.Entities.Progress.CourseEnrollment e)
    {
        var totalLessons = e.Course.Lessons.Count;
        var completedLessons = e.LessonProgresses.Count(lp => 
        {
            var lesson = e.Course.Lessons.FirstOrDefault(l => l.Id == lp.LessonId);
            if (lesson == null) return false;
            return lesson.Quiz == null ? lp.IsVideoCompleted : lp.IsQuizPassed;
        });
        
        var progressPercent = totalLessons > 0 ? (completedLessons * 100 / totalLessons) : 0;
        
        return new KanbanCardDto
        {
            CourseId = e.CourseId,
            Title = e.Course.Title,
            ThumbnailUrl = e.Course.ThumbnailUrl,
            InstructorName = e.Course.Teacher?.FullName ?? "Bilinmiyor",
            ProgressPercentage = progressPercent,
            CompletedLessons = completedLessons,
            TotalLessons = totalLessons,
            LastAccessed = e.UpdatedAt
        };
    }

    private int CalculateProgress(DeuYbsLms.Domain.Entities.Progress.CourseEnrollment e)
    {
        if (e.IsCourseCompleted) return 100;
        // Simplified progress calculation
        return 0; // Placeholder, real logic would use LessonProgresses
    }
}
