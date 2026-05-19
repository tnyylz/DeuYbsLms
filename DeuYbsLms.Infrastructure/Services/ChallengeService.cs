// Path: DeuYbsLms.Infrastructure/Services/ChallengeService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DeuYbsLms.Infrastructure.Services;

public class ChallengeService : IChallengeService
{
    private readonly AppDbContext _context;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly INotificationService _notificationService;

    public ChallengeService(AppDbContext context, IServiceScopeFactory scopeFactory, INotificationService notificationService)
    {
        _context = context;
        _scopeFactory = scopeFactory;
        _notificationService = notificationService;
    }

    public async Task<Result<List<ChallengeDto>>> GetMyChallengesAsync(Guid studentId)
    {
        var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.AppUserId == studentId);
        if (profile == null) return Result<List<ChallengeDto>>.Failure("Profil bulunamadı.");

        var activeChallenges = await _context.Challenges
            .Where(c => c.IsActive && (c.ExpiryDate == null || c.ExpiryDate > DateTime.UtcNow))
            .ToListAsync();

        var results = new List<ChallengeDto>();

        foreach (var challenge in activeChallenges)
        {
            var progress = await _context.UserChallengeProgresses
                .FirstOrDefaultAsync(p => p.StudentProfileId == profile.Id && p.ChallengeId == challenge.Id);

            if (progress != null && progress.CurrentValue == -1)
            {
                continue; // Ödülü alınmış görevi gösterme
            }

            results.Add(new ChallengeDto
            {
                Id = challenge.Id,
                Title = challenge.Title,
                Description = challenge.Description,
                Type = challenge.Type,
                TargetValue = challenge.TargetValue,
                XpReward = challenge.XpReward,
                ExpiryDate = challenge.ExpiryDate,
                CurrentValue = progress?.CurrentValue ?? 0,
                IsCompleted = progress?.IsCompleted ?? false
            });
        }

        return Result<List<ChallengeDto>>.Success(results);
    }

    public async Task UpdateChallengeProgressAsync(Guid studentId, ChallengeType type, int amount)
    {
        var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.AppUserId == studentId);
        if (profile == null) return;

        var activeChallenges = await _context.Challenges
            .Where(c => c.IsActive && c.Type == type && (c.ExpiryDate == null || c.ExpiryDate > DateTime.UtcNow))
            .ToListAsync();

        foreach (var challenge in activeChallenges)
        {
            var progress = await _context.UserChallengeProgresses
                .FirstOrDefaultAsync(p => p.StudentProfileId == profile.Id && p.ChallengeId == challenge.Id);

            if (progress == null)
            {
                progress = new UserChallengeProgress
                {
                    Id = Guid.NewGuid(),
                    StudentProfileId = profile.Id,
                    ChallengeId = challenge.Id,
                    CurrentValue = 0
                };
                await _context.UserChallengeProgresses.AddAsync(progress);
            }

            if (progress.IsCompleted || progress.CurrentValue == -1) continue;

            progress.CurrentValue += amount;
            if (progress.CurrentValue >= challenge.TargetValue)
            {
                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;

                await _notificationService.SendNotificationAsync(
                    studentId,
                    "Görev Tamamlandı! 🎯",
                    $"{challenge.Title} görevini bitirdin! Ödülünü profilinden toplayabilirsin.",
                    NotificationType.Challenge);
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<Result<XpResultDto>> ClaimChallengeRewardAsync(Guid studentId, Guid challengeId)
    {
        var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.AppUserId == studentId);
        if (profile == null) return Result<XpResultDto>.Failure("Profil bulunamadı.");

        var progress = await _context.UserChallengeProgresses
            .Include(p => p.Challenge)
            .FirstOrDefaultAsync(p => p.StudentProfileId == profile.Id && p.ChallengeId == challengeId);

        if (progress == null || !progress.IsCompleted)
            return Result<XpResultDto>.Failure("Challenge henüz tamamlanmadı.");

        if (progress.CurrentValue == -1)
            return Result<XpResultDto>.Failure("Bu görevin ödülü zaten alınmış.");

        using (var scope = _scopeFactory.CreateScope())
        {
            var gamificationService = scope.ServiceProvider.GetRequiredService<IGamificationService>();
            var result = await gamificationService.AwardXpAsync(studentId, progress.Challenge.XpReward, $"Challenge Tamamlandı: {progress.Challenge.Title}");
            
            // Silmek yerine, ödül alındığını belirtmek için CurrentValue'yu -1 yapıyoruz
            progress.CurrentValue = -1;
            await _context.SaveChangesAsync();

            return Result<XpResultDto>.Success(result);
        }
    }

    public async Task CreateSeasonalChallengesAsync()
    {
        // Örnek başlangıç görevleri
        var challenges = new List<Challenge>
        {
            new Challenge { Id = Guid.NewGuid(), Title = "Haftalık Maraton", Description = "Bu hafta 500 XP kazan!", Type = ChallengeType.XpGain, TargetValue = 500, XpReward = 250, ExpiryDate = DateTime.UtcNow.AddDays(7) },
            new Challenge { Id = Guid.NewGuid(), Title = "Hızlı Okuyucu", Description = "3 ders tamamla!", Type = ChallengeType.LessonCompletion, TargetValue = 3, XpReward = 150, ExpiryDate = DateTime.UtcNow.AddDays(7) },
            new Challenge { Id = Guid.NewGuid(), Title = "Kusursuz Bilgi", Description = "2 Quiz'den 100 tam puan al!", Type = ChallengeType.QuizSuccess, TargetValue = 2, XpReward = 400, ExpiryDate = DateTime.UtcNow.AddDays(14) }
        };

        foreach (var c in challenges)
        {
            if (!await _context.Challenges.AnyAsync(existing => existing.Title == c.Title))
            {
                await _context.Challenges.AddAsync(c);
            }
        }
        await _context.SaveChangesAsync();
    }

    // Admin management
    public async Task<Result<List<DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto>>> GetAllChallengesForAdminAsync()
    {
        var challenges = await _context.Challenges
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Type = c.Type,
                TargetValue = c.TargetValue,
                XpReward = c.XpReward,
                ExpiryDate = c.ExpiryDate,
                IsActive = c.IsActive
            })
            .ToListAsync();

        return Result<List<DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto>>.Success(challenges);
    }

    public async Task<Result<Guid>> CreateChallengeAsync(DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto dto)
    {
        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            TargetValue = dto.TargetValue,
            XpReward = dto.XpReward,
            ExpiryDate = dto.ExpiryDate,
            IsActive = dto.IsActive
        };

        await _context.Challenges.AddAsync(challenge);
        await _context.SaveChangesAsync();
        return Result<Guid>.Success(challenge.Id);
    }

    public async Task<Result<bool>> UpdateChallengeAsync(Guid id, DeuYbsLms.Application.DTOs.Admin.AdminChallengeDto dto)
    {
        var challenge = await _context.Challenges.FindAsync(id);
        if (challenge == null) return Result<bool>.Failure("Görev bulunamadı.");

        challenge.Title = dto.Title;
        challenge.Description = dto.Description;
        challenge.Type = dto.Type;
        challenge.TargetValue = dto.TargetValue;
        challenge.XpReward = dto.XpReward;
        challenge.ExpiryDate = dto.ExpiryDate;
        challenge.IsActive = dto.IsActive;
        challenge.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DeleteChallengeAsync(Guid id)
    {
        var challenge = await _context.Challenges.FindAsync(id);
        if (challenge == null) return Result<bool>.Failure("Görev bulunamadı.");

        _context.Challenges.Remove(challenge);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }
}
