// Path: DeuYbsLms.Application/Interfaces/Services/ITokenService.cs

using DeuYbsLms.Domain.Entities.Identity;

namespace DeuYbsLms.Application.Interfaces.Services;

// JWT token üretimini soyutlar.
// Infrastructure katmanı bunu implement eder.
public interface ITokenService
{
    string GenerateToken(AppUser user);
}