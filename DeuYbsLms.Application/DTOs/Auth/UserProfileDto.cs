// Path: DeuYbsLms.Application/DTOs/Auth/UserProfileDto.cs

namespace DeuYbsLms.Application.DTOs.Auth;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int TotalXp { get; set; }
    public int CurrentLevel { get; set; }
    public int XpToNextLevel { get; set; }
    public int BadgeCount { get; set; }
}