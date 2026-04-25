// Path: DeuYbsLms.Domain/Entities/Gamification/LeagueParticipation.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class LeagueParticipation : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid LeagueGroupId { get; set; }
    public LeagueGroup LeagueGroup { get; set; } = null!;

    public int SeasonPoints { get; set; } = 0;
    public int FinalRank { get; set; } // Periyot sonundaki sırası
}
