// Path: DeuYbsLms.Application/DTOs/Auth/LoginRequestDto.cs

namespace DeuYbsLms.Application.DTOs.Auth;

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}