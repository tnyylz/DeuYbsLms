// Path: DeuYbsLms.Application/Interfaces/Services/INotificationService.cs

using DeuYbsLms.Application.DTOs.Common;
using DeuYbsLms.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DeuYbsLms.Application.Interfaces.Services;

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string title, string message, NotificationType type, string? actionUrl = null);
    Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId, int count = 20);
    Task MarkAsReadAsync(Guid notificationId);
    Task MarkAllAsReadAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
}
