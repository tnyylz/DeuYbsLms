// Path: DeuYbsLms.Application/DTOs/Auth/RegisterRequestDto.cs

using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Auth;

public class RegisterRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Student;
}