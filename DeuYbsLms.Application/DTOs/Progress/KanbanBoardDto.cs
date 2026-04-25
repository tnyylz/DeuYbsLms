// Path: DeuYbsLms.Application/DTOs/Progress/KanbanBoardDto.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Progress;

public class KanbanBoardDto
{
    public List<KanbanColumnDto> Columns { get; set; } = new();
}

public class KanbanColumnDto
{
    public KanbanStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<KanbanCardDto> Cards { get; set; } = new();
}

public class KanbanCardDto
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public DateTime? LastAccessed { get; set; }
}
