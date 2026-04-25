// Path: DeuYbsLms.Infrastructure/Services/LeagueService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class LeagueService : ILeagueService
{
    private readonly AppDbContext _context;

    public LeagueService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LeagueLeaderboardDto>> GetMyLeagueLeaderboardAsync(Guid studentId)
    {
        var participation = await _context.LeagueParticipations
            .Include(lp => lp.LeagueGroup)
            .OrderByDescending(lp => lp.LeagueGroup.SeasonNumber)
            .FirstOrDefaultAsync(lp => lp.StudentProfile.AppUserId == studentId && !lp.LeagueGroup.IsClosed);

        if (participation == null)
        {
            // Eğer ligde değilse, otomatik dahil et
            var joinResult = await EnsureStudentInLeagueGroupAsync(studentId);
            if (!joinResult.IsSuccess) return Result<LeagueLeaderboardDto>.Failure("Lig grubuna dahil edilemedi.");
            
            return await GetMyLeagueLeaderboardAsync(studentId);
        }

        var rankings = await _context.LeagueParticipations
            .Include(lp => lp.StudentProfile.AppUser)
            .Where(lp => lp.LeagueGroupId == participation.LeagueGroupId)
            .OrderByDescending(lp => lp.SeasonPoints)
            .ToListAsync();

        var dto = new LeagueLeaderboardDto
        {
            Tier = participation.LeagueGroup.Tier.ToString().ToUpper(),
            SeasonNumber = participation.LeagueGroup.SeasonNumber,
            EndDate = participation.LeagueGroup.EndDate,
            Rankings = rankings.Select((r, index) => new LeagueParticipationDto
            {
                StudentId = r.StudentProfile.AppUserId,
                FullName = r.StudentProfile.AppUser.FirstName + " " + r.StudentProfile.AppUser.LastName,
                ProfilePictureUrl = r.StudentProfile.AppUser.ProfilePictureUrl,
                Points = r.SeasonPoints,
                Rank = index + 1,
                IsPromotionZone = (index < 5), // İlk 5 terfi
                IsRelegationZone = (rankings.Count > 20 && index >= rankings.Count - 5) // Son 5 düşüş
            }).ToList()
        };

        return Result<LeagueLeaderboardDto>.Success(dto);
    }

    public async Task<Result<Guid>> EnsureStudentInLeagueGroupAsync(Guid studentId)
    {
        var profile = await _context.StudentProfiles
            .FirstOrDefaultAsync(p => p.AppUserId == studentId);
        
        if (profile == null) return Result<Guid>.Failure("Profil bulunamadı.");

        // Zaten aktif bir lig grubunda mı?
        var existing = await _context.LeagueParticipations
            .Include(lp => lp.LeagueGroup)
            .FirstOrDefaultAsync(lp => lp.StudentProfileId == profile.Id && !lp.LeagueGroup.IsClosed);

        if (existing != null) return Result<Guid>.Success(existing.LeagueGroupId);

        // Değilse, uygun lig seviyesinde (Tier) kontenjanı olan (max 30) bir grup bul
        var group = await _context.LeagueGroups
            .Include(lg => lg.Participations)
            .Where(lg => lg.Tier == profile.CurrentLeagueTier && !lg.IsClosed && lg.Participations.Count < 30)
            .FirstOrDefaultAsync();

        if (group == null)
        {
            // Yeni grup oluştur
            group = new LeagueGroup
            {
                Id = Guid.NewGuid(),
                Tier = profile.CurrentLeagueTier,
                SeasonNumber = 1, // Sistem genelindeki aktif sezonu bulacak bir lojik eklenebilir
                EndDate = DateTime.UtcNow.AddDays(7).Date.AddHours(23).AddMinutes(59), // Pazar sonu gibi
                IsClosed = false
            };
            await _context.LeagueGroups.AddAsync(group);
        }

        var participation = new LeagueParticipation
        {
            Id = Guid.NewGuid(),
            StudentProfileId = profile.Id,
            LeagueGroupId = group.Id,
            SeasonPoints = 0
        };

        await _context.LeagueParticipations.AddAsync(participation);
        await _context.SaveChangesAsync();

        return Result<Guid>.Success(group.Id);
    }

    public async Task UpdateLeaguePointsAsync(Guid studentId, int points)
    {
        var participation = await _context.LeagueParticipations
            .Include(lp => lp.LeagueGroup)
            .FirstOrDefaultAsync(lp => lp.StudentProfile.AppUserId == studentId && !lp.LeagueGroup.IsClosed);

        if (participation != null)
        {
            participation.SeasonPoints += points;
            await _context.SaveChangesAsync();
        }
    }

    public async Task ProcessSeasonClosureAsync()
    {
        // Pazar geceleri çalışacak lojik:
        // 1. Kapanmamış tüm grupları bul
        // 2. Her gruptaki sıralamayı belirle
        // 3. İlk 5'i bir üst Tier'a taşı (StudentProfile.CurrentLeagueTier++)
        // 4. Son 5'i bir alt Tier'a düşür (tabi Bronze'dan aşağı düşemez)
        // 5. Grupları IsClosed = true yap
        // 6. Yeni sezon gruplarını oluştur (EnsureInLeagueGroup ile öğrenciler girdikçe oluşacaktır)
        
        var activeGroups = await _context.LeagueGroups
            .Where(lg => !lg.IsClosed && lg.EndDate < DateTime.UtcNow)
            .ToListAsync();

        foreach (var group in activeGroups)
        {
            var participations = await _context.LeagueParticipations
                .Include(lp => lp.StudentProfile)
                .Where(lp => lp.LeagueGroupId == group.Id)
                .OrderByDescending(lp => lp.SeasonPoints)
                .ToListAsync();

            for (int i = 0; i < participations.Count; i++)
            {
                var p = participations[i];
                p.FinalRank = i + 1;

                if (i < 5 && p.StudentProfile.CurrentLeagueTier < LeagueTier.Şampiyonluk)
                {
                    p.StudentProfile.CurrentLeagueTier++;
                }
                else if (participations.Count > 20 && i >= participations.Count - 5 && p.StudentProfile.CurrentLeagueTier > LeagueTier.Demir)
                {
                    p.StudentProfile.CurrentLeagueTier--;
                }
            }
            group.IsClosed = true;
        }

        await _context.SaveChangesAsync();
    }
}
