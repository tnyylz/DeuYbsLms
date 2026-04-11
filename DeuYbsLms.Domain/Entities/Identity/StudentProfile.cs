// Path: DeuYbsLms.Domain/Entities/Identity/StudentProfile.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Gamification;

namespace DeuYbsLms.Domain.Entities.Identity;

// AppUser'dan ayrı tutuyoruz çünkü Teacher'ların XP/Level bilgisi olmaz.
// Single Responsibility Principle: Her sınıfın tek bir sorumluluğu olmalı.
public class StudentProfile : BaseEntity
{
    public Guid AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public int TotalXp { get; set; } = 0;
    public int CurrentLevel { get; set; } = 1;
    public int XpToNextLevel { get; set; } = 100;
    public int CurrentStreak { get; set; } = 0;
    public DateTime? LastActivityDate { get; set; }

    public ICollection<UserBadge> EarnedBadges { get; set; } = new List<UserBadge>();
    public ICollection<XpTransaction> XpTransactions { get; set; } = new List<XpTransaction>();
}