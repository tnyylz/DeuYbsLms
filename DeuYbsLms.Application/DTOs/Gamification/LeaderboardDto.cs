namespace DeuYbsLms.Application.DTOs.Gamification;

public class LeaderboardDto
{
    public int Rank { get; set; }
    public Guid StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public int TotalXp { get; set; }
    public int Level { get; set; }
}
