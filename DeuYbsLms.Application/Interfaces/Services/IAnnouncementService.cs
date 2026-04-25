using DeuYbsLms.Application.DTOs.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface IAnnouncementService
{
    Task<SystemAnnouncementDto?> GetActiveAnnouncementAsync(string? role);
    Task<List<SystemAnnouncementDto>> GetAllAnnouncementsAsync();
    Task<SystemAnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementRequest request);
    Task ToggleAnnouncementStatusAsync(Guid id);
    Task DeleteAnnouncementAsync(Guid id);
}
