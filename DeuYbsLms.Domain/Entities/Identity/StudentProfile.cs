// Path: DeuYbsLms.Domain/Entities/Identity/StudentProfile.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Identity;

// AppUser'dan ayrı tutuyoruz çünkü Teacher'ların XP/Level bilgisi olmaz.
// Single Responsibility Principle: Her sınıfın tek bir sorumluluğu olmalı.
public class StudentProfile : BaseEntity
{
    public Guid AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public string? StudentNumber { get; set; }
    public int TotalXp { get; set; } = 0;
    public int CurrentLevel { get; set; } = 1;
    public int XpToNextLevel { get; set; } = 100;
    public int CurrentStreak { get; set; } = 0;
    public DateTime? LastActivityDate { get; set; }
    
    // Leagues
    public LeagueTier CurrentLeagueTier { get; set; } = LeagueTier.Demir;
    public ICollection<LeagueParticipation> LeagueParticipations { get; set; } = new List<LeagueParticipation>();

    // Challenges
    public ICollection<UserChallengeProgress> ChallengeProgresses { get; set; } = new List<UserChallengeProgress>();

    public ICollection<UserBadge> EarnedBadges { get; set; } = new List<UserBadge>();
    public ICollection<XpTransaction> XpTransactions { get; set; } = new List<XpTransaction>();
    public ICollection<UserInventoryItem> Inventory { get; set; } = new List<UserInventoryItem>();
}