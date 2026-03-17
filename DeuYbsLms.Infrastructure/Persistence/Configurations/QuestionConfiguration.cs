// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/QuestionConfiguration.cs

using DeuYbsLms.Domain.Entities.Course;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuestionText)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasQueryFilter(q => !q.IsDeleted);

        // Question → AnswerOptions (1-to-many)
        builder.HasMany(q => q.AnswerOptions)
            .WithOne(ao => ao.Question)
            .HasForeignKey(ao => ao.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}