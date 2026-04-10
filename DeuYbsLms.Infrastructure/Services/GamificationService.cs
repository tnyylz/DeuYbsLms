// Path: DeuYbsLms.Infrastructure/Services/GamificationService.cs

using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Infrastructure.Services;

public class GamificationService : IGamificationService
{
    private readonly IRepository<StudentProfile> _profileRepository;
    private readonly IRepository<UserBadge> _badgeRepository;
    private readonly IRepository<XpTransaction> _xpRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;

    public GamificationService(
        IRepository<StudentProfile> profileRepository,
        IRepository<UserBadge> badgeRepository,
        IRepository<XpTransaction> xpRepository,
        IEnrollmentRepository enrollmentRepository)
    {
        _profileRepository = profileRepository;
        _badgeRepository = badgeRepository;
        _xpRepository = xpRepository;
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<int> AwardXpAsync(Guid studentId, int xpAmount, string reason)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == studentId);
        if (profile is null) return 0;

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
            profile.XpToNextLevel = (int)(profile.XpToNextLevel * 1.2);
        }

        await _profileRepository.UpdateAsync(profile);
        return xpAmount;
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

            var alreadyEarned = await _badgeRepository
                .AnyAsync(ub => ub.StudentProfileId == profile.Id && ub.BadgeType == badge);

            if (alreadyEarned) continue;

            await _badgeRepository.AddAsync(new UserBadge
            {
                Id = Guid.NewGuid(),
                StudentProfileId = profile.Id,
                BadgeType = badge,
                EarnedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            });
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

        // Rank hesaplama - tüm profilleri XP'ye göre sıralayıp pozisyon bulma
        var allProfiles = await _profileRepository.GetAllAsync(_ => true);
        var sortedProfiles = allProfiles.OrderByDescending(p => p.TotalXp).ToList();
        int rank = sortedProfiles.FindIndex(p => p.Id == profile.Id) + 1;
        if (rank == 0) rank = sortedProfiles.Count;

        // CompletedQuizCount hesaplama
        var enrollments = await _enrollmentRepository.GetStudentEnrollmentsAsync(studentId);
        int completedQuizCount = enrollments
            .SelectMany(e => e.LessonProgresses)
            .Count(lp => lp.IsQuizPassed);

        return Result<StudentGamificationDto>.Success(new StudentGamificationDto
        {
            TotalXp = profile.TotalXp,
            CurrentLevel = profile.CurrentLevel,
            XpToNextLevel = profile.XpToNextLevel,
            XpProgressPercent = xpProgressPercent,
            Rank = rank,
            CompletedQuizCount = completedQuizCount,
            Badges = badges.Select(b => MapBadgeToDto(b)).ToList(),
            RecentXpTransactions = recentXp
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .Select(x => new XpTransactionDto
            {
                Amount = x.XpAmount,
                Reason = x.Reason,
                EarnedAt = x.CreatedAt
            }).ToList()
        });
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

        return new BadgeDto
        {
            BadgeType = badge.BadgeType.ToString(),
            DisplayName = displayName,
            Description = description,
            IconEmoji = emoji,
            EarnedAt = badge.EarnedAt
        };
    }
}