// Path: DeuYbsLms.Domain/Entities/Gamification/UserChallengeProgress.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class UserChallengeProgress : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid ChallengeId { get; set; }
    public Challenge Challenge { get; set; } = null!;

    public int CurrentValue { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
}
