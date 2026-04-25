// Path: DeuYbsLms.Domain/Entities/Gamification/Challenge.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class Challenge : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ChallengeType Type { get; set; }
    public int TargetValue { get; set; }
    public int XpReward { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<UserChallengeProgress> UserProgresses { get; set; } = new List<UserChallengeProgress>();
}
