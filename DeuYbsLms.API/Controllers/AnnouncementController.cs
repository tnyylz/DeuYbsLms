using DeuYbsLms.Application.DTOs.Common;
using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace DeuYbsLms.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive([FromQuery] string? role)
    {
        if (string.IsNullOrEmpty(role)) return Ok(null);
        var announcement = await _announcementService.GetActiveAnnouncementAsync(role);
        return Ok(announcement);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var announcements = await _announcementService.GetAllAnnouncementsAsync();
        return Ok(announcements);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementRequest request)
    {
        var announcement = await _announcementService.CreateAnnouncementAsync(request);
        return Ok(announcement);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        await _announcementService.ToggleAnnouncementStatusAsync(id);
        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _announcementService.DeleteAnnouncementAsync(id);
        return Ok();
    }
}
