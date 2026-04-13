namespace DeuYbsLms.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? StudentNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
