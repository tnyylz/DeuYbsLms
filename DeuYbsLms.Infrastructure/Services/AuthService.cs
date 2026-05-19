// Path: DeuYbsLms.Infrastructure/Services/AuthService.cs

using DeuYbsLms.Application.DTOs.Auth;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<Result<Guid>> CreateUserAsync(RegisterRequestDto request)
    {
        // Email daha önce alınmış mı?
        if (await _userRepository.IsEmailTakenAsync(request.Email))
            return Result<Guid>.Failure("Bu email adresi zaten kullanılıyor.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        // Öğrenci ise profil oluştur
        if (request.Role == UserRole.Student)
        {
            user.StudentProfile = new StudentProfile
            {
                Id = Guid.NewGuid(),
                AppUserId = user.Id,
                StudentNumber = request.StudentNumber,
                GradeLevel = request.GradeLevel ?? 1,
                TotalXp = 0,
                CurrentLevel = 1,
                XpToNextLevel = 100,
                CreatedAt = DateTime.UtcNow
            };
        }

        await _userRepository.AddAsync(user);

        return Result<Guid>.Success(user.Id);
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Failure("Email veya şifre hatalı.");

        if (!user.IsActive)
            return Result<AuthResponseDto>.Failure("Hesabınız dondurulmuştur. Lütfen sistem yöneticisi ile iletişime geçin.");

        var token = _tokenService.GenerateToken(user);

        return Result<AuthResponseDto>.Success(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    public async Task<Result<UserProfileDto>> GetProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetUserWithProfileAsync(userId);

        if (user is null)
            return Result<UserProfileDto>.Failure("Kullanıcı bulunamadı.");

        return Result<UserProfileDto>.Success(new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            TotalXp = user.StudentProfile?.TotalXp ?? 0,
            CurrentLevel = user.StudentProfile?.CurrentLevel ?? 0,
            XpToNextLevel = user.StudentProfile?.XpToNextLevel ?? 0,
            BadgeCount = user.StudentProfile?.EarnedBadges.Count ?? 0
        });
    }

    public async Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return Result<bool>.Failure("Kullanıcı bulunamadı.");

        // 1. Eski şifre kontrolü
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return Result<bool>.Failure("Mevcut şifreniz hatalı.");

        // 2. Yeni şifreler uyuşuyor mu?
        if (request.NewPassword != request.ConfirmNewPassword)
            return Result<bool>.Failure("Yeni şifreler birbiriyle eşleşmiyor.");

        // 3. Yeni şifre eskisiyle aynı mı?
        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            return Result<bool>.Failure("Yeni şifre eski şifre ile aynı olamaz.");

        // Şifreyi güncelle
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        return Result<bool>.Success(true);
    }
}