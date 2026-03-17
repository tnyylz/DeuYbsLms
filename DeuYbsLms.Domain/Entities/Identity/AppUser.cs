// Path: DeuYbsLms.Domain/Entities/Identity/AppUser.cs

using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Identity;

public class AppUser : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // DB'ye sütun oluşturmaz, sadece C# tarafında hesaplanır
    public string FullName => $"{FirstName} {LastName}";

    // Navigation Properties: EF Core ilişkileri bu sayede kurar
    public StudentProfile? StudentProfile { get; set; }
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
}