// Path: DeuYbsLms.Application/Interfaces/Services/ILeagueService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface ILeagueService
{
    Task<Result<LeagueLeaderboardDto>> GetMyLeagueLeaderboardAsync(Guid studentId);
    Task<Result<Guid>> EnsureStudentInLeagueGroupAsync(Guid studentId);
    Task UpdateLeaguePointsAsync(Guid studentId, int points);
    Task ProcessSeasonClosureAsync(); // Called by background job
}
