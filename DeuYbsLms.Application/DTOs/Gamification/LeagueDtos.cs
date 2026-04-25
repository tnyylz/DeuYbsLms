// Path: DeuYbsLms.Application/DTOs/Gamification/LeagueDtos.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Gamification;

public class LeagueDto
{
    public Guid Id { get; set; }
    public string Tier { get; set; } = string.Empty;
    public int SeasonNumber { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsClosed { get; set; }
}

public class LeagueLeaderboardDto
{
    public string Tier { get; set; } = string.Empty;
    public int SeasonNumber { get; set; }
    public DateTime EndDate { get; set; }
    public List<LeagueParticipationDto> Rankings { get; set; } = new();
}

public class LeagueParticipationDto
{
    public Guid StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public int Points { get; set; }
    public int Rank { get; set; }
    public bool IsPromotionZone { get; set; }
    public bool IsRelegationZone { get; set; }
}
