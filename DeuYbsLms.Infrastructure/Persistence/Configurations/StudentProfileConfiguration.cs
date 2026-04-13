// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/StudentProfileConfiguration.cs

using DeuYbsLms.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class StudentProfileConfiguration : IEntityTypeConfiguration<StudentProfile>
{
    public void Configure(EntityTypeBuilder<StudentProfile> builder)
    {
        builder.HasKey(sp => sp.Id);

        builder.Property(sp => sp.StudentNumber)
            .HasMaxLength(20);

        builder.HasIndex(sp => sp.StudentNumber)
            .IsUnique()
            .HasFilter("[StudentNumber] IS NOT NULL");

        builder.Property(sp => sp.TotalXp).HasDefaultValue(0);
        builder.Property(sp => sp.CurrentLevel).HasDefaultValue(1);
        builder.Property(sp => sp.XpToNextLevel).HasDefaultValue(100);

        builder.HasQueryFilter(sp => !sp.IsDeleted);

        // StudentProfile → UserBadges (1-to-many)
        builder.HasMany(sp => sp.EarnedBadges)
            .WithOne(ub => ub.StudentProfile)
            .HasForeignKey(ub => ub.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // StudentProfile → XpTransactions (1-to-many)
        builder.HasMany(sp => sp.XpTransactions)
            .WithOne(xt => xt.StudentProfile)
            .HasForeignKey(xt => xt.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}