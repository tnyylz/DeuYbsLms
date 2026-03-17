// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/CourseEnrollmentConfiguration.cs

using DeuYbsLms.Domain.Entities.Progress;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class CourseEnrollmentConfiguration : IEntityTypeConfiguration<CourseEnrollment>
{
    public void Configure(EntityTypeBuilder<CourseEnrollment> builder)
    {
        builder.HasKey(ce => ce.Id);

        // Aynı öğrenci aynı kursa 2 kez kayıt olamaz
        builder.HasIndex(ce => new { ce.StudentId, ce.CourseId }).IsUnique();

        builder.HasQueryFilter(ce => !ce.IsDeleted);

        // Enrollment → LessonProgresses (1-to-many)
        builder.HasMany(ce => ce.LessonProgresses)
            .WithOne(lp => lp.Enrollment)
            .HasForeignKey(lp => lp.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enrollment → Certificate (1-to-1)
        builder.HasOne(ce => ce.Certificate)
            .WithOne(c => c.Enrollment)
            .HasForeignKey<Certificate>(c => c.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enrollment → Course
        builder.HasOne(ce => ce.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(ce => ce.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}