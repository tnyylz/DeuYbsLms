// Path: DeuYbsLms.Application/DTOs/Gamification/ChallengeDtos.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Gamification;

public class ChallengeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ChallengeType Type { get; set; }
    public int TargetValue { get; set; }
    public int XpReward { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    // User progress details
    public int CurrentValue { get; set; }
    public bool IsCompleted { get; set; }
    public double ProgressPercent => TargetValue > 0 ? Math.Min(100, (double)CurrentValue / TargetValue * 100) : 0;
}
