// Path: DeuYbsLms.Application/Interfaces/Services/IKanbanService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IKanbanService
{
    Task<Result<KanbanBoardDto>> GetMyBoardAsync(Guid studentId);
    Task<Result<bool>> UpdateCardStatusAsync(Guid studentId, Guid courseId, KanbanStatus newStatus);
}
