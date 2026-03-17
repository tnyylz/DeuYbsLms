// Path: DeuYbsLms.Domain/Entities/Progress/Certificate.cs

using DeuYbsLms.Domain.Entities.Common;

namespace DeuYbsLms.Domain.Entities.Progress;

// Kurs tamamlandığında otomatik oluşturulur.
// UniqueVerificationCode ile sertifika doğrulaması yapılabilir.
public class Certificate : BaseEntity
{
    public Guid EnrollmentId { get; set; }
    public CourseEnrollment Enrollment { get; set; } = null!;

    public string UniqueVerificationCode { get; set; } = Guid.NewGuid().ToString("N").ToUpper();
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public string? PdfStoragePath { get; set; }
}