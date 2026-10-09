// Path: DeuYbsLms.Application/DTOs/Progress/CertificateDto.cs

namespace DeuYbsLms.Application.DTOs.Progress;

public class CertificateDto
{
    public Guid Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string UniqueVerificationCode { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public string? PdfStoragePath { get; set; }
}