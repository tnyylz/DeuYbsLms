// Path: DeuYbsLms.API/Controllers/CertificateController.cs

using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CertificateController : ControllerBase
{
    private readonly ICertificateService _certificateService;

    public CertificateController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    [Authorize(Roles = "Student")]
    [HttpGet("my-certificates")]
    public async Task<IActionResult> GetMyCertificates()
    {
        var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(studentIdClaim) || !Guid.TryParse(studentIdClaim, out var studentId))
        {
            return Unauthorized("Kullanıcı kimliği belirsiz.");
        }

        var result = await _certificateService.GetStudentCertificatesAsync(studentId);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [Authorize(Roles = "Student")]
    [HttpPost("generate/{enrollmentId:guid}")]
    public async Task<IActionResult> GenerateCertificate(Guid enrollmentId)
    {
        var result = await _certificateService.GenerateCertificateAsync(enrollmentId);
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpGet("verify/{code}")]
    public async Task<IActionResult> VerifyCertificate(string code)
    {
        var result = await _certificateService.GetCertificateByCodeAsync(code);
        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Data);
    }
}
