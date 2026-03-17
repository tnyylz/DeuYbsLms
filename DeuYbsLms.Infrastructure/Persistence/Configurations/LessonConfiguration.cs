// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/LessonConfiguration.cs

using DeuYbsLms.Domain.Entities.Course;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.VideoUrl)
            .IsRequired();

        // OrderIndex + CourseId kombinasyonu unique olmalı
        // Aynı kursta 2 ders aynı sıraya sahip olamaz
        builder.HasIndex(l => new { l.CourseId, l.OrderIndex }).IsUnique();

        builder.HasQueryFilter(l => !l.IsDeleted);

        // Lesson → Quiz (1-to-1)
        builder.HasOne(l => l.Quiz)
            .WithOne(q => q.Lesson)
            .HasForeignKey<Quiz>(q => q.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}