// Path: DeuYbsLms.Application/DTOs/Gamification/XpResultDto.cs

namespace DeuYbsLms.Application.DTOs.Gamification;

public class XpResultDto
{
    public int XpAwarded { get; set; }
    public int NewTotalXp { get; set; }
    public int CurrentLevel { get; set; }
    public bool DidLevelUp { get; set; }        // true ise frontend level-up animasyonu oynatır
    public int? NewLevel { get; set; }
}