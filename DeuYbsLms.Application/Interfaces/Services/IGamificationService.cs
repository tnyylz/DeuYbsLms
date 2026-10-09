// Path: DeuYbsLms.Application.Interfaces.Services/IGamificationService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IGamificationService
{
    Task<XpResultDto> AwardXpAsync(Guid studentId, int xpAmount, string reason);
    Task CheckAndAwardBadgesAsync(Guid studentId);
    Task<Result<StudentGamificationDto>> GetStudentGamificationAsync(Guid studentId);
    Task<Result<List<LeaderboardDto>>> GetLeaderboardAsync(int top = 10);
    Task<Result<bool>> EquipItemAsync(Guid studentId, Guid inventoryItemId);
}