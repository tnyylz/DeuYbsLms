// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/QuizConfiguration.cs

using DeuYbsLms.Domain.Entities.Course;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> builder)
    {
        builder.HasKey(q => q.Id);

        builder.Property(q => q.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(q => q.MinimumPassingScore)
            .HasDefaultValue(70);

        builder.HasQueryFilter(q => !q.IsDeleted);

        // Quiz → Questions (1-to-many)
        builder.HasMany(q => q.Questions)
            .WithOne(qu => qu.Quiz)
            .HasForeignKey(qu => qu.QuizId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}