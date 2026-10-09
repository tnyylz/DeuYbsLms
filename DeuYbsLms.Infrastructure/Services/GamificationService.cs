// Path: DeuYbsLms.Infrastructure/Services/GamificationService.cs

using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class GamificationService : IGamificationService
{
    private readonly IRepository<StudentProfile> _profileRepository;
    private readonly IRepository<UserBadge> _badgeRepository;
    private readonly IRepository<XpTransaction> _xpRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IChallengeService _challengeService;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _context;

    public GamificationService(
        IRepository<StudentProfile> profileRepository,
        IRepository<UserBadge> badgeRepository,
        IRepository<XpTransaction> xpRepository,
        IEnrollmentRepository enrollmentRepository,
        IChallengeService challengeService,
        INotificationService notificationService,
        AppDbContext context)
    {
        _profileRepository = profileRepository;
        _badgeRepository = badgeRepository;
        _xpRepository = xpRepository;
        _enrollmentRepository = enrollmentRepository;
        _challengeService = challengeService;
        _notificationService = notificationService;
        _context = context;
    }

    public async Task<XpResultDto> AwardXpAsync(Guid studentId, int xpAmount, string reason)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == studentId);
        if (profile is null) return new XpResultDto();

        int initialLevel = profile.CurrentLevel;

        // Streak Logic: Check if reason counts for consistency (Lesson/Quiz)
        bool countsForStreak = reason.Contains("Video") || reason.Contains("Quiz");
        double multiplier = 1.0;

        if (countsForStreak)
        {
            var today = DateTime.UtcNow.Date;
            if (profile.LastActivityDate.HasValue)
            {
                var lastDate = profile.LastActivityDate.Value.Date;
                var diff = (today - lastDate).TotalDays;

                if (diff == 1) // Consecutive day
                {
                    profile.CurrentStreak++;
                }
                else if (diff > 1) // Streak broken
                {
                    // Mağaza Eşyası: Streak Shield kontrolü
                    var shield = await _context.UserInventoryItems
                        .Include(ui => ui.ShopItem)
                        .FirstOrDefaultAsync(ui => ui.StudentProfileId == profile.Id && 
                                                 ui.ShopItem.Type == ShopItemType.StreakShield && 
                                                 !ui.IsUsed);

                    if (shield != null)
                    {
                        shield.IsUsed = true;
                        shield.UpdatedAt = DateTime.UtcNow;
                        // Seri bozulmadı, aynı kaldı (veya bugün için +1 de yapılabilir ama genellikle koruma seriyi dondurur)
                        // Kullanıcı bugün aktif olduğu için diff > 1 olsa da seriyi devam ettiriyoruz
                        profile.CurrentStreak++; 
                        reason += " (🛡️ Streak Shield Kullanıldı!)";
                    }
                    else
                    {
                        profile.CurrentStreak = 1;
                    }
                }

                // If diff == 0, already active today, no change
            }
            else
            {
                profile.CurrentStreak = 1;
            }

            profile.LastActivityDate = DateTime.UtcNow;
            
            // Calculate Multiplier: 5% per day, max 50%
            multiplier = 1.0 + Math.Min(profile.CurrentStreak * 0.05, 0.5);
            
            // Mağaza Eşyası: XP Multiplier kontrolü
            var activeMultiplier = await _context.UserInventoryItems
                .Include(ui => ui.ShopItem)
                .FirstOrDefaultAsync(ui => ui.StudentProfileId == profile.Id && 
                                         ui.ShopItem.Type == ShopItemType.ExpMultiplier && 
                                         !ui.IsUsed);
            
            if (activeMultiplier != null)
            {
                double bonus = 2.0;
                if (!string.IsNullOrEmpty(activeMultiplier.ShopItem.Metadata))
                {
                    try
                    {
                        var json = System.Text.Json.JsonDocument.Parse(activeMultiplier.ShopItem.Metadata);
                        if (json.RootElement.TryGetProperty("multiplier", out var multProp))
                        {
                            bonus = multProp.GetDouble();
                        }
                    }
                    catch
                    {
                        if (double.TryParse(activeMultiplier.ShopItem.Metadata, out var parsed)) bonus = parsed;
                    }
                }
                multiplier *= bonus;
                activeMultiplier.IsUsed = true; // Tek kullanımlık şimdilik
                activeMultiplier.UpdatedAt = DateTime.UtcNow;
                reason += $" (⚡ XP Boost Aktif! x{bonus})";
            }

            xpAmount = (int)(xpAmount * multiplier);
            reason += $" (Toplam Çarpan: x{multiplier:F2})";
        }

        await _xpRepository.AddAsync(new XpTransaction
        {
            Id = Guid.NewGuid(),
            StudentProfileId = profile.Id,
            XpAmount = xpAmount,
            Reason = reason,
            CreatedAt = DateTime.UtcNow
        });

        profile.TotalXp += xpAmount;

        while (profile.TotalXp >= profile.XpToNextLevel)
        {
            profile.TotalXp -= profile.XpToNextLevel;
            profile.CurrentLevel++;
            // Seviye atlamak giderek daha da zorlaşsın (1.2 yerine 1.5 çarpanı)
            profile.XpToNextLevel = (int)(profile.XpToNextLevel * 1.5);
        }

        await _profileRepository.UpdateAsync(profile);

        await _challengeService.UpdateChallengeProgressAsync(studentId, ChallengeType.XpGain, xpAmount);

        if (profile.CurrentLevel > initialLevel)
        {
            await _notificationService.SendNotificationAsync(
                studentId,
                "Seviye Atladın! 🎉",
                $"Tebrikler! Seviye {profile.CurrentLevel} oldun.",
                NotificationType.LevelUp);
        }

        return new XpResultDto
        {
            XpAwarded = xpAmount,
            NewTotalXp = profile.TotalXp,
            CurrentLevel = profile.CurrentLevel,
            DidLevelUp = profile.CurrentLevel > initialLevel,
            NewLevel = profile.CurrentLevel > initialLevel ? profile.CurrentLevel : null
        };
    }

    public async Task CheckAndAwardBadgesAsync(Guid studentId)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == studentId);
        if (profile is null) return;

        var enrollments = await _enrollmentRepository.GetStudentEnrollmentsAsync(studentId);
        var completedCourses = enrollments.Count(e => e.IsCourseCompleted);

        var badgesToCheck = new List<(BadgeType Badge, bool Condition)>
        {
            (BadgeType.FirstBlood, enrollments.Any()),
            (BadgeType.Flawless, enrollments.Any(e =>
                e.LessonProgresses.Any(lp => lp.IsQuizPassed && lp.LastQuizScore == 100))),
            (BadgeType.CourseCompleter, completedCourses >= 1),
            (BadgeType.Persistent, completedCourses >= 3),
            (BadgeType.Overachiever, completedCourses >= 5),
        };

        foreach (var (badge, condition) in badgesToCheck)
        {
            if (!condition) continue;

            var existingBadge = await _context.UserBadges
                .FirstOrDefaultAsync(ub => ub.StudentProfileId == profile.Id && ub.BadgeType == badge);

            if (existingBadge != null)
            {
                // Zaten kazanılmışsa, Seviye Atlat (Gereksinimler arttıkça seviye artabilir ama şimdilik her kontrolde +1 gibi basit bir mantık veya sabit)
                // Gerçek senaryoda: completedCourses == 10 ise Level 2 gibi kontroller eklenebilir.
                // Şimdilik sadece varlığını koruyoruz, ancak planlanan "Evrimleşen Rozetler" için seviye mantığını kurguluyoruz.
                continue; 
            }

            await _badgeRepository.AddAsync(new UserBadge
            {
                Id = Guid.NewGuid(),
                StudentProfileId = profile.Id,
                BadgeType = badge,
                Level = 1,
                EarnedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            });

            var badgeInfo = MapBadgeToDto(new UserBadge { BadgeType = badge });
            await _notificationService.SendNotificationAsync(
                studentId,
                "Yeni Başarım! 🏆",
                $"{badgeInfo.DisplayName} rozetini kazandın: {badgeInfo.Description}",
                NotificationType.Achievement);
        }
    }

    public async Task<Result<StudentGamificationDto>> GetStudentGamificationAsync(Guid studentId)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == studentId);
        if (profile is null)
            return Result<StudentGamificationDto>.Failure("Profil bulunamadı.");

        var badges = await _badgeRepository
            .GetAllAsync(ub => ub.StudentProfileId == profile.Id);

        var recentXp = await _xpRepository
            .GetAllAsync(xt => xt.StudentProfileId == profile.Id);

        // XP Progress Percent hesaplama
        double xpProgressPercent = profile.XpToNextLevel > 0
            ? Math.Round((double)profile.TotalXp / profile.XpToNextLevel * 100, 1)
            : 0;

        // Rank hesaplama - tüm profilleri Level ve XP'ye göre sıralayıp pozisyon bulma
        var allProfiles = await _profileRepository.GetAllAsync(_ => true);
        var sortedProfiles = allProfiles.OrderByDescending(p => p.CurrentLevel).ThenByDescending(p => p.TotalXp).ToList();
        int rank = sortedProfiles.FindIndex(p => p.Id == profile.Id) + 1;
        if (rank == 0) rank = sortedProfiles.Count;

        // CompletedQuizCount hesaplama
        var enrollments = await _enrollmentRepository.GetStudentEnrollmentsAsync(studentId);
        int completedQuizCount = enrollments
            .SelectMany(e => e.LessonProgresses)
            .Count(lp => lp.IsQuizPassed);

        // Challenge bilgilerini al
        var challengesResult = await _challengeService.GetMyChallengesAsync(studentId);

        return Result<StudentGamificationDto>.Success(new StudentGamificationDto
        {
            TotalXp = profile.TotalXp,
            CurrentLevel = profile.CurrentLevel,
            XpToNextLevel = profile.XpToNextLevel,
            XpProgressPercent = xpProgressPercent,
            Rank = rank,
            CompletedQuizCount = completedQuizCount,
            CurrentStreak = profile.CurrentStreak,
            XpMultiplier = 1.0 + Math.Min(profile.CurrentStreak * 0.05, 0.5),
            Badges = badges.Select(b => MapBadgeToDto(b)).ToList(),
            RecentXpTransactions = recentXp
                .OrderByDescending(x => x.CreatedAt)
                .Take(10)
                .Select(x => new XpTransactionDto
                {
                    Amount = x.XpAmount,
                    Reason = x.Reason,
                    EarnedAt = x.CreatedAt
                }).ToList(),
            
            
            CurrentTitle = (await _context.UserInventoryItems
                .Include(ui => ui.ShopItem)
                .FirstOrDefaultAsync(ui => ui.StudentProfileId == profile.Id && 
                                         ui.ShopItem.Type == ShopItemType.SpecialTitle && 
                                         ui.IsEquipped))?.ShopItem.Metadata,
            
            ProfileFrameColor = (await _context.UserInventoryItems
                .Include(ui => ui.ShopItem)
                .FirstOrDefaultAsync(ui => ui.StudentProfileId == profile.Id && 
                                         ui.ShopItem.Type == ShopItemType.ProfileFrame && 
                                         ui.IsEquipped))?.ShopItem.Metadata,

            ActiveChallenges = (challengesResult.IsSuccess && challengesResult.Data != null) 
                ? challengesResult.Data 
                : new List<ChallengeDto>()
        });
    }


    public async Task<Result<List<LeaderboardDto>>> GetLeaderboardAsync(int top = 10)
    {
        var leaderboard = await _context.StudentProfiles
            .Include(p => p.AppUser)
            .Include(p => p.Inventory)
                .ThenInclude(i => i.ShopItem)
            .OrderByDescending(p => p.CurrentLevel)
            .ThenByDescending(p => p.TotalXp)
            .Take(top)
            .ToListAsync();

        var dtos = leaderboard.Select((p) => new LeaderboardDto
        {
            StudentId = p.AppUserId,
            FullName = p.AppUser.FirstName + " " + p.AppUser.LastName,
            ProfilePictureUrl = p.AppUser.ProfilePictureUrl,
            TotalXp = p.TotalXp,
            Level = p.CurrentLevel,
            ProfileFrameColor = p.Inventory.FirstOrDefault(i => i.IsEquipped && i.ShopItem.Type == ShopItemType.ProfileFrame)?.ShopItem.Metadata,
            CurrentTitle = p.Inventory.FirstOrDefault(i => i.IsEquipped && i.ShopItem.Type == ShopItemType.SpecialTitle)?.ShopItem.Metadata
        }).ToList();

        for (int i = 0; i < dtos.Count; i++)
        {
            dtos[i].Rank = i + 1;
        }

        return Result<List<LeaderboardDto>>.Success(dtos);
    }

    private static BadgeDto MapBadgeToDto(UserBadge badge)
    {
        var (displayName, description, emoji) = badge.BadgeType switch
        {
            BadgeType.FirstBlood => ("İlk Adım", "İlk kursuna kayıt oldun!", "🚀"),
            BadgeType.Flawless => ("Kusursuz", "Bir quiz'den tam puan aldın!", "💎"),
            BadgeType.CourseCompleter => ("Kurs Tamamlayıcı", "İlk kursunu tamamladın!", "🎓"),
            BadgeType.Speedrunner => ("Hızlı Öğrenen", "Kursunu hızla tamamladın!", "⚡"),
            BadgeType.Persistent => ("Azimli", "3 kursu tamamladın!", "🔥"),
            BadgeType.Overachiever => ("Üstün Başarı", "5 kursu tamamladın!", "🏆"),
            _ => (badge.BadgeType.ToString(), "", "🎖️")
        };

        string prefix = badge.Level switch
        {
            >= 10 => "Efsanevi ",
            >= 7 => "Kadim ",
            >= 5 => "Usta ",
            >= 3 => "Kıdemli ",
            _ => "Çırak "
        };

        return new BadgeDto
        {
            BadgeType = badge.BadgeType.ToString(),
            DisplayName = prefix + displayName,
            Description = description,
            IconEmoji = emoji,
            Level = badge.Level,
            EarnedAt = badge.EarnedAt
        };
    }

    public async Task<Result<bool>> EquipItemAsync(Guid studentId, Guid inventoryItemId)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == studentId);
        if (profile == null) return Result<bool>.Failure("Profil bulunamadı.");

        var itemToEquip = await _context.UserInventoryItems
            .Include(i => i.ShopItem)
            .FirstOrDefaultAsync(i => i.Id == inventoryItemId && i.StudentProfileId == profile.Id);

        if (itemToEquip == null) return Result<bool>.Failure("Eşya envanterinizde bulunamadı.");

        if (itemToEquip.ShopItem.Type != ShopItemType.ProfileFrame && itemToEquip.ShopItem.Type != ShopItemType.SpecialTitle)
        {
            return Result<bool>.Failure("Bu tür eşyalar kuşanılmaz.");
        }

        // Çıkar/Kuşan mantığı
        if (itemToEquip.IsEquipped)
        {
            itemToEquip.IsEquipped = false;
        }
        else
        {
            // Aynı türdeki diğer eşyaları çıkar
            var sameTypeItems = await _context.UserInventoryItems
                .Include(i => i.ShopItem)
                .Where(i => i.StudentProfileId == profile.Id && i.ShopItem.Type == itemToEquip.ShopItem.Type && i.IsEquipped)
                .ToListAsync();

            foreach (var item in sameTypeItems)
            {
                item.IsEquipped = false;
            }

            itemToEquip.IsEquipped = true;
        }

        await _context.SaveChangesAsync();
        return Result<bool>.Success(itemToEquip.IsEquipped);
    }
}