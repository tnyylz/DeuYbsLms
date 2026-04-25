using DeuYbsLms.Application.DTOs.Common;
using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DeuYbsLms.Infrastructure.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly IAnnouncementRepository _announcementRepository;

    public AnnouncementService(IAnnouncementRepository announcementRepository)
    {
        _announcementRepository = announcementRepository;
    }

    public async Task<SystemAnnouncementDto?> GetActiveAnnouncementAsync(string? role)
    {
        var active = await _announcementRepository.GetActiveAnnouncementAsync(role);
        if (active == null) return null;

        return MapToDto(active);
    }

    public async Task<List<SystemAnnouncementDto>> GetAllAnnouncementsAsync()
    {
        var announcements = await _announcementRepository.GetAllAsync();
        return announcements.Select(MapToDto).OrderByDescending(a => a.CreatedAt).ToList();
    }

    public async Task<SystemAnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementRequest request)
    {
        var announcement = new SystemAnnouncement
        {
            Message = request.Message,
            Type = request.Type,
            TargetRole = request.TargetRole,
            IsActive = true
        };

        await _announcementRepository.AddAsync(announcement);
        return MapToDto(announcement);
    }

    public async Task ToggleAnnouncementStatusAsync(Guid id)
    {
        var announcement = await _announcementRepository.GetByIdAsync(id);
        if (announcement == null) throw new Exception("Duyuru bulunamadı.");

        announcement.IsActive = !announcement.IsActive;
        await _announcementRepository.UpdateAsync(announcement);
    }

    public async Task DeleteAnnouncementAsync(Guid id)
    {
        var announcement = await _announcementRepository.GetByIdAsync(id);
        if (announcement == null) throw new Exception("Duyuru bulunamadı.");

        await _announcementRepository.DeleteAsync(announcement);
    }

    private SystemAnnouncementDto MapToDto(SystemAnnouncement a)
    {
        return new SystemAnnouncementDto
        {
            Id = a.Id,
            Message = a.Message,
            Type = a.Type,
            TargetRole = a.TargetRole,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt
        };
    }
}
