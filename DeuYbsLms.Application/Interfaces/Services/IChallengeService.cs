// Path: DeuYbsLms.Application/Interfaces/Services/IChallengeService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IChallengeService
{
    Task<Result<List<ChallengeDto>>> GetMyChallengesAsync(Guid studentId);
    Task UpdateChallengeProgressAsync(Guid studentId, ChallengeType type, int amount);
    Task<Result<XpResultDto>> ClaimChallengeRewardAsync(Guid studentId, Guid challengeId);
    Task CreateSeasonalChallengesAsync(); // Admin or system activity
    
    // Admin management
    Task<Result<List<DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto>>> GetAllChallengesForAdminAsync();
    Task<Result<Guid>> CreateChallengeAsync(DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto dto);
    Task<Result<bool>> UpdateChallengeAsync(Guid id, DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto dto);
    Task<Result<bool>> DeleteChallengeAsync(Guid id);
}
