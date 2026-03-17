// Path: DeuYbsLms.Domain/Entities/Gamification/UserBadge.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class UserBadge : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public BadgeType BadgeType { get; set; }
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
    public string? ContextDescription { get; set; } // "SQL'e Giriş dersinde kazanıldı"
}