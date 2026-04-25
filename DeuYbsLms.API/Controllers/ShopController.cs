using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DeuYbsLms.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly IShopService _shopService;
    private readonly AppDbContext _context;

    public ShopController(IShopService shopService, AppDbContext context)
    {
        _shopService = shopService;
        _context = context;
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetItems()
    {
        var result = await _shopService.GetAvailableItemsAsync();
        
        // Eğer mağaza boşsa otomatik seed tetikle (Kullanıcının butonla uğraşmasına gerek kalmasın)
        if (result.IsSuccess && (result.Data == null || result.Data.Count == 0))
        {
            await SeedItems();
            result = await _shopService.GetAvailableItemsAsync();
        }

        if (result.IsSuccess) return Ok(result.Data);
        return BadRequest(result.ErrorMessage);
    }

    [HttpPost("purchase/{itemId:guid}")]
    public async Task<IActionResult> Purchase(Guid itemId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _shopService.PurchaseItemAsync(userId, itemId);
        if (result.IsSuccess) return Ok(result.Data);
        return BadRequest(result.ErrorMessage);
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _shopService.GetStudentInventoryAsync(userId);
        if (result.IsSuccess) return Ok(result.Data);
        return BadRequest(result.ErrorMessage);
    }

    // Mağazayı ilk kez doldurmak için geliştirilmiş endpoint
    [HttpPost("seed")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SeedItems()
    {
        var itemsToSeed = new List<ShopItem>
        {
            new ShopItem
            {
                Id = Guid.NewGuid(),
                Name = "Seri Koruma Kalkanı",
                Description = "Bir gün ders çalışmayı unutursan serini (streak) korur. Otomatik kullanılır.",
                PriceXp = 250,
                Type = ShopItemType.StreakShield,
                IconEmoji = "🛡️",
                IsActive = true
            },
            new ShopItem
            {
                Id = Guid.NewGuid(),
                Name = "Neon Profil Çerçevesi",
                Description = "Profil resminin etrafında havalı bir neon ışık ekler.",
                PriceXp = 500,
                Type = ShopItemType.ProfileFrame,
                IconEmoji = "✨",
                IsActive = true,
                Metadata = "#4f46e5"
            },
            new ShopItem
            {
                Id = Guid.NewGuid(),
                Name = "Unvan: Bilge",
                Description = "İsminin yanında 'Bilge' unvanı görünür.",
                PriceXp = 1000,
                Type = ShopItemType.SpecialTitle,
                IconEmoji = "📜",
                IsActive = true,
                Metadata = "Bilge"
            },
            new ShopItem
            {
                Id = Guid.NewGuid(),
                Name = "XP Güçlendirici (x2)",
                Description = "Bir sonraki 5 ders/quiz için aldığın XP'yi ikiye katlar.",
                PriceXp = 750,
                Type = ShopItemType.ExpMultiplier,
                IconEmoji = "⚡",
                IsActive = true,
                Metadata = "2"
            }
        };

        int addedCount = 0;
        foreach (var item in itemsToSeed)
        {
            if (!await _context.ShopItems.AnyAsync(si => si.Name == item.Name))
            {
                await _context.ShopItems.AddAsync(item);
                addedCount++;
            }
        }

        if (addedCount > 0)
        {
            await _context.SaveChangesAsync();
            return Ok($"{addedCount} yeni ürün başarıyla eklendi.");
        }

        return Ok("Mağaza zaten güncel.");
    }
}
