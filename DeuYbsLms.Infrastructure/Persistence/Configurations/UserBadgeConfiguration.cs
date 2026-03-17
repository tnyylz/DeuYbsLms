// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/UserBadgeConfiguration.cs

using DeuYbsLms.Domain.Entities.Gamification;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class UserBadgeConfiguration : IEntityTypeConfiguration<UserBadge>
{
    public void Configure(EntityTypeBuilder<UserBadge> builder)
    {
        builder.HasKey(ub => ub.Id);

        // Aynı rozeti 2 kez kazanamaz
        builder.HasIndex(ub => new { ub.StudentProfileId, ub.BadgeType }).IsUnique();

        builder.HasQueryFilter(ub => !ub.IsDeleted);
    }
}