// Path: DeuYbsLms.Domain/Entities/Common/Notification.cs

using DeuYbsLms.Domain.Enums;
using System;

namespace DeuYbsLms.Domain.Entities.Common;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; } = false;
    public string? ActionUrl { get; set; } // Optional: URL to redirect when clicked
}
