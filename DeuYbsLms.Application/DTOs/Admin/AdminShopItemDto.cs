using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.DTOs.Admin;

public class AdminShopItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Price { get; set; }
    public ShopItemType Type { get; set; }
    public string? Metadata { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}
