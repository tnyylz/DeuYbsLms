// Path: DeuYbsLms.Application/DTOs/Common/NotificationDto.cs

using System;

namespace DeuYbsLms.Application.DTOs.Common;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // String representation of NotificationType
    public bool IsRead { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
