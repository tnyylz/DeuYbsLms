// Path: DeuYbsLms.Infrastructure/Persistence/Configurations/XpTransactionConfiguration.cs

using DeuYbsLms.Domain.Entities.Gamification;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeuYbsLms.Infrastructure.Persistence.Configurations;

public class XpTransactionConfiguration : IEntityTypeConfiguration<XpTransaction>
{
    public void Configure(EntityTypeBuilder<XpTransaction> builder)
    {
        builder.HasKey(xt => xt.Id);

        builder.Property(xt => xt.Reason)
            .IsRequired()
            .HasMaxLength(500);

        // XP transaction'lar immutable — güncellenmez, silinmez
        builder.HasQueryFilter(xt => !xt.IsDeleted);
    }
}