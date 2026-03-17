// Path: DeuYbsLms.Application/DTOs/Auth/AuthResponseDto.cs

namespace DeuYbsLms.Application.DTOs.Auth;

// Login/Register başarılı olunca frontend'e bu döner.
// Frontend bu token'ı localStorage'a kaydeder ve her istekte header'a ekler.
public class AuthResponseDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime TokenExpiry { get; set; }
}