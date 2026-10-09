using DeuYbsLms.Application.DTOs.Auth;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IGamificationService _gamificationService;
    private readonly ICertificateService _certificateService;

    public ProfileController(
        AppDbContext context,
        IGamificationService gamificationService,
        ICertificateService certificateService)
    {
        _context = context;
        _gamificationService = gamificationService;
        _certificateService = certificateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        // Get Stats from Gamification Service (Rank, Badges, Level info)
        var gamificationResult = await _gamificationService.GetStudentGamificationAsync(userId);
        var stats = gamificationResult.IsSuccess ? gamificationResult.Data : null;

        // Calculate Average Quiz Score (Not in gamification service yet)
        var lessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.Enrollment.StudentId == userId && lp.IsQuizPassed)
            .ToListAsync();

        double avgScore = lessonProgresses.Any() ? lessonProgresses.Average(lp => lp.LastQuizScore ?? 0) : 0;
        int completedCourses = await _context.CourseEnrollments.CountAsync(e => e.StudentId == userId && e.IsCourseCompleted);
        var certificatesResult = await _certificateService.GetStudentCertificatesAsync(userId);
        int certCount = certificatesResult.IsSuccess ? certificatesResult.Data?.Count ?? 0 : 0;

        var dto = new StudentProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            StudentNumber = user.StudentProfile?.StudentNumber,
            GradeLevel = user.StudentProfile?.GradeLevel ?? 1,
            ProfilePictureUrl = user.ProfilePictureUrl,
            TotalXp = stats?.TotalXp ?? user.StudentProfile?.TotalXp ?? 0,
            CurrentLevel = stats?.CurrentLevel ?? user.StudentProfile?.CurrentLevel ?? 1,
            XpToNextLevel = stats?.XpToNextLevel ?? user.StudentProfile?.XpToNextLevel ?? 100,
            Rank = stats?.Rank ?? 0,
            AverageQuizScore = Math.Round(avgScore, 1),
            CoursesCompletedCount = completedCourses,
            TotalCertificatesCount = certCount,
            Badges = stats?.Badges ?? new()
        };

        return Ok(dto);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null) return NotFound();

        // E-posta benzersizlik kontrolü ve güncellemesi (tüm kullanıcılar için)
        if (!string.IsNullOrEmpty(request.Email) && request.Email.ToLower() != user.Email)
        {
            var isEmailTaken = await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower() && u.Id != userId);
            if (isEmailTaken) return BadRequest("Bu e-posta adresi zaten kullanımda.");
            
            user.Email = request.Email.ToLower();
        }

        if (!string.IsNullOrEmpty(request.ProfilePictureUrl))
        {
            user.ProfilePictureUrl = request.ProfilePictureUrl;
        }

        if (user.StudentProfile != null)
        {
            // ÖĞRENCİ KISITLAMALARI:
            // Öğrenci şifresi (başka endpoint), profil fotoğrafı ve e-postası hariç hiçbir verisini değiştiremez.
            // Ad, Soyad ve Öğrenci Numarası güncellemelerini es geçiyoruz (read-only yapıyoruz).
        }
        else
        {
            // ÖĞRETMEN / ADMIN:
            // Herhangi bir kısıtlama olmaksızın ad ve soyadını güncelleyebilir.
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profil başarıyla güncellendi." });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, [FromServices] IAuthService authService)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var result = await authService.ChangePasswordAsync(userId, request);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(new { message = "Şifreniz başarıyla değiştirildi." });
    }
}
