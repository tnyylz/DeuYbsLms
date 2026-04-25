using DeuYbsLms.Domain.Entities.Gamification;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class UserInventoryItemConfiguration : IEntityTypeConfiguration<UserInventoryItem>
{
    public void Configure(EntityTypeBuilder<UserInventoryItem> builder)
    {
        builder.HasKey(ui => ui.Id);

        builder.HasOne(ui => ui.StudentProfile)
            .WithMany(sp => sp.Inventory)
            .HasForeignKey(ui => ui.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ui => ui.ShopItem)
            .WithMany()
            .HasForeignKey(ui => ui.ShopItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(ui => !ui.IsDeleted);
    }
}
