// Path: DeuYbsLms.Application/Interfaces/Services/IAuthService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Auth;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterRequestDto request);
    Task<Result<AuthResponseDto>> LoginAsync(LoginRequestDto request);
    Task<Result<UserProfileDto>> GetProfileAsync(Guid userId);
}