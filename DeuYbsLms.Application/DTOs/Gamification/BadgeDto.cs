// Path: DeuYbsLms.Application/DTOs/Gamification/BadgeDto.cs

namespace DeuYbsLms.Application.DTOs.Gamification;

public class BadgeDto
{
    public string BadgeType { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = string.Empty;
    public int Level { get; set; } = 1;
    public DateTime EarnedAt { get; set; }
    public string? ContextDescription { get; set; }
}