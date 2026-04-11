using DeuYbsLms.Application.DTOs.Gamification;

namespace DeuYbsLms.Application.DTOs.Auth;

public class StudentProfileDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    
    // Academic Stats
    public int TotalXp { get; set; }
    public int CurrentLevel { get; set; }
    public int XpToNextLevel { get; set; }
    public int Rank { get; set; }
    public double AverageQuizScore { get; set; }
    public int CoursesCompletedCount { get; set; }
    public int TotalCertificatesCount { get; set; }
    
    public List<BadgeDto> Badges { get; set; } = new();
}
