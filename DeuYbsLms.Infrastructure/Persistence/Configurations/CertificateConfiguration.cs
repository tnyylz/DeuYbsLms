// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/CertificateConfiguration.cs

using DeuYbsLms.Domain.Entities.Progress;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.UniqueVerificationCode)
            .IsRequired()
            .HasMaxLength(50);

        // Verification code globally unique olmalı
        builder.HasIndex(c => c.UniqueVerificationCode).IsUnique();

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}