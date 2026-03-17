// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/AppUserConfiguration.cs

using DeuYbsLms.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        // Email unique olmalı — aynı mail ile 2 hesap açılamaz
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.Role)
            .IsRequired();

        // Soft delete: IsDeleted = true olanları sorgulardan otomatik filtrele
        builder.HasQueryFilter(u => !u.IsDeleted);

        // FullName DB'ye sütun olarak yazılmaz
        builder.Ignore(u => u.FullName);

        // AppUser → StudentProfile (1-to-1)
        builder.HasOne(u => u.StudentProfile)
            .WithOne(sp => sp.AppUser)
            .HasForeignKey<StudentProfile>(sp => sp.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // AppUser → CourseEnrollments (1-to-many)
        builder.HasMany(u => u.Enrollments)
            .WithOne(e => e.Student)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}