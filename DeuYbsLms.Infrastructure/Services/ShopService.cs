using AutoMapper;
using DeuYbsLms.Application.Common.Results;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Services;

public class ShopService : IShopService
{
    private readonly IRepository<ShopItem> _itemRepository;
    private readonly IRepository<UserInventoryItem> _inventoryRepository;
    private readonly IRepository<StudentProfile> _profileRepository;
    private readonly IRepository<XpTransaction> _xpRepository;
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public ShopService(
        IRepository<ShopItem> itemRepository,
        IRepository<UserInventoryItem> inventoryRepository,
        IRepository<StudentProfile> profileRepository,
        IRepository<XpTransaction> xpRepository,
        AppDbContext context,
        IMapper mapper)
    {
        _itemRepository = itemRepository;
        _inventoryRepository = inventoryRepository;
        _profileRepository = profileRepository;
        _xpRepository = xpRepository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<ShopItemDto>>> GetAvailableItemsAsync()
    {
        var items = await _itemRepository.GetAllAsync(si => si.IsActive);
        return Result<List<ShopItemDto>>.Success(_mapper.Map<List<ShopItemDto>>(items));
    }

    public async Task<Result<PurchaseResultDto>> PurchaseItemAsync(Guid userId, Guid itemId)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == userId);
        if (profile == null) return Result<PurchaseResultDto>.Failure("Öğrenci profili bulunamadı.");

        var item = await _itemRepository.GetByIdAsync(itemId);
        if (item == null || !item.IsActive) return Result<PurchaseResultDto>.Failure("Ürün bulunamadı veya pasif.");

        if (profile.TotalXp < item.PriceXp)
            return Result<PurchaseResultDto>.Failure("Yetersiz XP bakiyesi.");

        // Transaction handling
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Deduct XP
            profile.TotalXp -= item.PriceXp;
            await _profileRepository.UpdateAsync(profile);

            // 2. Create XP Transaction (Negative)
            await _xpRepository.AddAsync(new XpTransaction
            {
                Id = Guid.NewGuid(),
                StudentProfileId = profile.Id,
                XpAmount = -item.PriceXp,
                Reason = $"Mağaza Alımı: {item.Name}",
                CreatedAt = DateTime.UtcNow
            });

            // 3. Add to Inventory
            await _inventoryRepository.AddAsync(new UserInventoryItem
            {
                Id = Guid.NewGuid(),
                StudentProfileId = profile.Id,
                ShopItemId = item.Id,
                PurchasedAt = DateTime.UtcNow,
                IsUsed = false
            });

            await transaction.CommitAsync();

            return Result<PurchaseResultDto>.Success(new PurchaseResultDto
            {
                Success = true,
                Message = $"{item.Name} başarıyla satın alındı!",
                NewTotalXp = profile.TotalXp
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Result<PurchaseResultDto>.Failure($"Satın alma işlemi sırasında hata oluştu: {ex.Message}");
        }
    }

    public async Task<Result<List<UserInventoryItemDto>>> GetStudentInventoryAsync(Guid userId)
    {
        var profile = await _profileRepository.GetAsync(sp => sp.AppUserId == userId);
        if (profile == null) return Result<List<UserInventoryItemDto>>.Failure("Profil bulunamadı.");

        var inventory = await _context.UserInventoryItems
            .Include(ui => ui.ShopItem)
            .Where(ui => ui.StudentProfileId == profile.Id)
            .OrderByDescending(ui => ui.PurchasedAt)
            .ToListAsync();

        return Result<List<UserInventoryItemDto>>.Success(_mapper.Map<List<UserInventoryItemDto>>(inventory));
    }

    // Admin management
    public async Task<Result<List<DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto>>> GetAllItemsForAdminAsync()
    {
        var items = await _context.ShopItems
            .OrderByDescending(si => si.CreatedAt)
            .Select(si => new DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto
            {
                Id = si.Id,
                Name = si.Name,
                Description = si.Description,
                Price = si.PriceXp,
                Type = si.Type,
                Metadata = si.Metadata,
                ImageUrl = si.ImageUrl,
                IsActive = si.IsActive
            })
            .ToListAsync();

        return Result<List<DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto>>.Success(items);
    }

    public async Task<Result<Guid>> CreateItemAsync(DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto dto)
    {
        var item = new ShopItem
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            PriceXp = dto.Price,
            Type = dto.Type,
            Metadata = dto.Metadata,
            ImageUrl = dto.ImageUrl,
            IsActive = dto.IsActive
        };

        await _context.ShopItems.AddAsync(item);
        await _context.SaveChangesAsync();
        return Result<Guid>.Success(item.Id);
    }

    public async Task<Result<bool>> UpdateItemAsync(Guid id, DeuYbsLms.Application.DTOs.Admin.AdminShopItemDto dto)
    {
        var item = await _context.ShopItems.FindAsync(id);
        if (item == null) return Result<bool>.Failure("Ürün bulunamadı.");

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.PriceXp = dto.Price;
        item.Type = dto.Type;
        item.Metadata = dto.Metadata;
        item.ImageUrl = dto.ImageUrl;
        item.IsActive = dto.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DeleteItemAsync(Guid id)
    {
        var item = await _context.ShopItems.FindAsync(id);
        if (item == null) return Result<bool>.Failure("Ürün bulunamadı.");

        _context.ShopItems.Remove(item);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true);
    }
}
