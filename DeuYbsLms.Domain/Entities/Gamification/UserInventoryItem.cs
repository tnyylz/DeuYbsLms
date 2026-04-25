using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Entities.Identity;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class UserInventoryItem : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid ShopItemId { get; set; }
    public ShopItem ShopItem { get; set; } = null!;

    public bool IsUsed { get; set; } = false;
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
}
