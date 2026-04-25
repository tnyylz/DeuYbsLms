using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IShopService
{
    Task<Result<List<ShopItemDto>>> GetAvailableItemsAsync();
    Task<Result<PurchaseResultDto>> PurchaseItemAsync(Guid studentId, Guid itemId);
    Task<Result<List<UserInventoryItemDto>>> GetStudentInventoryAsync(Guid studentId);
    
    // Admin management
    Task<Result<List<DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto>>> GetAllItemsForAdminAsync();
    Task<Result<Guid>> CreateItemAsync(DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto dto);
    Task<Result<bool>> UpdateItemAsync(Guid id, DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto dto);
    Task<Result<bool>> DeleteItemAsync(Guid id);
}
