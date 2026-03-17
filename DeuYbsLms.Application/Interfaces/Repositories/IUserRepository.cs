// Path: DeuYbsLms.Application/Interfaces/Repositories/IUserRepository.cs

using DeuYbsLms.Domain.Entities.Identity;

namespace DeuYbsLms.Application.Interfaces.Repositories;

public interface IUserRepository : IRepository<AppUser>
{
    Task<AppUser?> GetByEmailAsync(string email);
    Task<AppUser?> GetUserWithProfileAsync(Guid userId);
    Task<bool> IsEmailTakenAsync(string email);
}