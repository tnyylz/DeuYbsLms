// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/AnswerOptionConfiguration.cs

using DeuYbsLms.Domain.Entities.Course;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class AnswerOptionConfiguration : IEntityTypeConfiguration<AnswerOption>
{
    public void Configure(EntityTypeBuilder<AnswerOption> builder)
    {
        builder.HasKey(ao => ao.Id);

        builder.Property(ao => ao.OptionText)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasQueryFilter(ao => !ao.IsDeleted);
    }
}