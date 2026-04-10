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
            .FirstOrDefaultAsync(e => e.Id == enrollmentId);

        if (enrollment == null)
            return Result<CertificateDto>.Failure("Kayıt bulunamadı.");

        if (!enrollment.IsCourseCompleted)
            return Result<CertificateDto>.Failure("Kurs henüz tamamlanmamış.");

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
            .Where(c => c.Enrollment.StudentId == studentId)
            .OrderByDescending(c => c.IssuedAt)
            .ToListAsync();

        var dtos = certificates.Select(c => new CertificateDto
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
