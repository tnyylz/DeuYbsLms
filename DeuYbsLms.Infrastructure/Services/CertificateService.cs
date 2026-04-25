// Path: DeuYbsLms.Infrastructure/Services/CertificateService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class CertificateService : ICertificateService
{
    private readonly AppDbContext _context;

    public CertificateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CertificateDto>> GenerateCertificateAsync(Guid enrollmentId)
    {
        var enrollment = await _context.CourseEnrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
                    .ThenInclude(l => l.Quiz)
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId);

        if (enrollment == null)
            return Result<CertificateDto>.Failure("Kayıt bulunamadı.");

        // Gerçek zamanlı kontrol: Yeni ders eklenmişse IsCourseCompleted bayrağı yanıltıcı olabilir.
        var lessons = enrollment.Course.Lessons;
        var progresses = enrollment.LessonProgresses;
        
        var totalLessons = lessons.Count;
        var completedLessons = lessons.Count(l => 
        {
            var p = progresses.FirstOrDefault(x => x.LessonId == l.Id);
            if (p == null) return false;
            return l.Quiz == null ? p.IsVideoCompleted : p.IsQuizPassed;
        });

        if (totalLessons == 0 || completedLessons < totalLessons)
        {
            // Veritabanındaki bayrağı da düzeltelim (opsiyonel ama tutarlılık için iyi olur)
            if (enrollment.IsCourseCompleted)
            {
                enrollment.IsCourseCompleted = false;
                await _context.SaveChangesAsync();
            }
            return Result<CertificateDto>.Failure("Kurs henüz tamamlanmamış veya yeni dersler eklenmiş.");
        }

        var existingCert = await _context.Certificates
            .FirstOrDefaultAsync(c => c.EnrollmentId == enrollmentId);

        if (existingCert != null)
        {
            return Result<CertificateDto>.Success(new CertificateDto
            {
                Id = existingCert.Id,
                StudentName = enrollment.Student.FullName,
                CourseTitle = enrollment.Course.Title,
                UniqueVerificationCode = existingCert.UniqueVerificationCode,
                IssuedAt = existingCert.IssuedAt,
                PdfStoragePath = existingCert.PdfStoragePath
            });
        }

        var certificate = new Certificate
        {
            EnrollmentId = enrollmentId,
            UniqueVerificationCode = Guid.NewGuid().ToString("N").ToUpper(),
            IssuedAt = DateTime.UtcNow
        };

        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();

        return Result<CertificateDto>.Success(new CertificateDto
        {
            Id = certificate.Id,
            StudentName = enrollment.Student.FullName,
            CourseTitle = enrollment.Course.Title,
            UniqueVerificationCode = certificate.UniqueVerificationCode,
            IssuedAt = certificate.IssuedAt,
            PdfStoragePath = certificate.PdfStoragePath
        });
    }

    public async Task<Result<CertificateDto>> GetCertificateByCodeAsync(string verificationCode)
    {
        var certificate = await _context.Certificates
            .Include(c => c.Enrollment)
                .ThenInclude(e => e.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e.Course)
            .FirstOrDefaultAsync(c => c.UniqueVerificationCode == verificationCode);

        if (certificate == null)
            return Result<CertificateDto>.Failure("Sertifika bulunamadı.");

        return Result<CertificateDto>.Success(new CertificateDto
        {
            Id = certificate.Id,
            StudentName = certificate.Enrollment.Student.FullName,
            CourseTitle = certificate.Enrollment.Course.Title,
            UniqueVerificationCode = certificate.UniqueVerificationCode,
            IssuedAt = certificate.IssuedAt,
            PdfStoragePath = certificate.PdfStoragePath
        });
    }

    public async Task<Result<List<CertificateDto>>> GetStudentCertificatesAsync(Guid studentId)
    {
        var certificates = await _context.Certificates
            .Include(c => c.Enrollment)
                .ThenInclude(e => e.Student)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e.Course)
                    .ThenInclude(c => c.Lessons)
                        .ThenInclude(l => l.Quiz)
            .Include(c => c.Enrollment)
                .ThenInclude(e => e.LessonProgresses)
            .Where(c => c.Enrollment.StudentId == studentId)
            .OrderByDescending(c => c.IssuedAt)
            .ToListAsync();

        // Eğer kursa yeni ders eklenmişse ve öğrenci bitirmemişse sertifikayı gizle
        var validCertificates = certificates.Where(c => 
        {
            var e = c.Enrollment;
            var lessons = e.Course.Lessons;
            var progresses = e.LessonProgresses;
            
            var total = lessons.Count;
            var completed = lessons.Count(l => 
            {
                var p = progresses.FirstOrDefault(x => x.LessonId == l.Id);
                if (p == null) return false;
                return l.Quiz == null ? p.IsVideoCompleted : p.IsQuizPassed;
            });
            return total > 0 && completed >= total;
        }).ToList();

        var dtos = validCertificates.Select(c => new CertificateDto
        {
            Id = c.Id,
            StudentName = c.Enrollment.Student.FullName,
            CourseTitle = c.Enrollment.Course.Title,
            UniqueVerificationCode = c.UniqueVerificationCode,
            IssuedAt = c.IssuedAt,
            PdfStoragePath = c.PdfStoragePath
        }).ToList();

        return Result<List<CertificateDto>>.Success(dtos);
    }
}
