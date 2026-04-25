// Path: DeuYbsLms.Domain/Entities/Gamification/LeagueGroup.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class LeagueGroup : BaseEntity
{
    public LeagueTier Tier { get; set; }
    public int SeasonNumber { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsClosed { get; set; } = false;

    public ICollection<LeagueParticipation> Participations { get; set; } = new List<LeagueParticipation>();
}
