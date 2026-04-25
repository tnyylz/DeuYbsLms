using System;

namespace DeuYbsLms.Application.DTOs.Common;

public class SystemAnnouncementDto
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public string TargetRole { get; set; } = "All";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAnnouncementRequest
{
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public string TargetRole { get; set; } = "All";
}
