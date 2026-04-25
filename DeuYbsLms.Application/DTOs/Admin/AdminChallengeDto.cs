using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Admin;

public class AdminChallengeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ChallengeType Type { get; set; }
    public int TargetValue { get; set; }
    public int XpReward { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; }
}
