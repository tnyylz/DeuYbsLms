// Path: DeuYbsLms.Application/Interfaces/Services/ICertificateService.cs

using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Progress;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface ICertificateService
{
    Task<Result<CertificateDto>> GenerateCertificateAsync(Guid enrollmentId);
    Task<Result<CertificateDto>> GetCertificateByCodeAsync(string verificationCode);
}