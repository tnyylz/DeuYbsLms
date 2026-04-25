using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface IAnnouncementRepository : IRepository<SystemAnnouncement>
{
    Task<SystemAnnouncement?> GetActiveAnnouncementAsync(string? role);
}
