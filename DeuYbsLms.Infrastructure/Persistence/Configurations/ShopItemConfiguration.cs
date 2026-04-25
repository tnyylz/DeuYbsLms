using DeuYbsLms.Domain.Entities.Gamification;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class ShopItemConfiguration : IEntityTypeConfiguration<ShopItem>
{
    public void Configure(EntityTypeBuilder<ShopItem> builder)
    {
        builder.HasKey(si => si.Id);

        builder.Property(si => si.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(si => si.Description)
            .HasMaxLength(500);

        builder.HasQueryFilter(si => !si.IsDeleted && si.IsActive);
    }
}
