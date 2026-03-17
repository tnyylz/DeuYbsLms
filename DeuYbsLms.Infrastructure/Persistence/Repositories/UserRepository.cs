// Path: DeuYbsLms.Infrastructure/Persistence/Repositories/UserRepository.cs

using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence.Repositories;

public class UserRepository : Repository<AppUser>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<AppUser?> GetByEmailAsync(string email)
        => await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email.ToLower());

    public async Task<AppUser?> GetUserWithProfileAsync(Guid userId)
        => await _context.Users
            .Include(u => u.StudentProfile)
                .ThenInclude(sp => sp!.EarnedBadges)
            .Include(u => u.StudentProfile)
                .ThenInclude(sp => sp!.XpTransactions)
            .FirstOrDefaultAsync(u => u.Id == userId);

    public async Task<bool> IsEmailTakenAsync(string email)
        => await _context.Users.AnyAsync(u => u.Email == email.ToLower());
}