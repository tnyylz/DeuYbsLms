// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/LessonProgressConfiguration.cs

using DeuYbsLms.Domain.Entities.Progress;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        builder.HasKey(lp => lp.Id);

        // Aynı enrollment için aynı derse 2 progress kaydı olamaz
        builder.HasIndex(lp => new { lp.EnrollmentId, lp.LessonId }).IsUnique();

        builder.Property(lp => lp.IsUnlocked).HasDefaultValue(false);
        builder.Property(lp => lp.IsVideoCompleted).HasDefaultValue(false);
        builder.Property(lp => lp.IsQuizPassed).HasDefaultValue(false);
        builder.Property(lp => lp.QuizAttemptCount).HasDefaultValue(0);

        builder.HasQueryFilter(lp => !lp.IsDeleted);

        // LessonProgress → Lesson
        builder.HasOne(lp => lp.Lesson)
            .WithMany()
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}