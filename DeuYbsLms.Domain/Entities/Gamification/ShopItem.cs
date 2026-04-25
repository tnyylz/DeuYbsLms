using DeuYbsLms.Domain.Entities.Common;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Domain.Entities.Gamification;

public class ShopItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PriceXp { get; set; }
    public ShopItemType Type { get; set; }
    public string IconEmoji { get; set; } = "📦";
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; }
    public string? Metadata { get; set; } // Renk kodu, unvan metni vb. için JSON
}
