namespace DeuYbsLms.Application.DTOs.Gamification;

public class ShopItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PriceXp { get; set; }
    public string Type { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = "📦";
    public string? Metadata { get; set; }
}

public class UserInventoryItemDto
{
    public Guid Id { get; set; }
    public Guid ShopItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string ItemType { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = "📦";
    public bool IsUsed { get; set; }
    public DateTime PurchasedAt { get; set; }
}

public class PurchaseResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int NewTotalXp { get; set; }
}
