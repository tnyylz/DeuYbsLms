using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class AnnouncementRepository : Repository<SystemAnnouncement>, IAnnouncementRepository
{
    public AnnouncementRepository(AppDbContext context) : base(context) { }

    public async Task<SystemAnnouncement?> GetActiveAnnouncementAsync(string? role)
    {
        return await _context.SystemAnnouncements
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(a => a.IsActive && (a.TargetRole == "All" || a.TargetRole == role));
    }
}
