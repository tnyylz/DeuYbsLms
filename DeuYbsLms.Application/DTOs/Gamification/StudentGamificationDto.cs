// Path: DeuYbsLms.Application/DTOs/Gamification/StudentGamificationDto.cs

namespace DeuYbsLms.Application.DTOs.Gamification;

public class StudentGamificationDto
{
    public int TotalXp { get; set; }
    public int CurrentLevel { get; set; }
    public int XpToNextLevel { get; set; }
    public double XpProgressPercent { get; set; }
    public int Rank { get; set; }
    public int CompletedQuizCount { get; set; }
    public int CurrentStreak { get; set; }
    public double XpMultiplier { get; set; }
    public List<BadgeDto> Badges { get; set; } = new();
    public List<XpTransactionDto> RecentXpTransactions { get; set; } = new();
}


public class XpTransactionDto
{
    public int Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
}