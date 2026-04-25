using DeuYbsLms.Domain.Entities.Common;
using System;

namespace DeuYbsLms.Domain.Entities.Common;

public class SystemAnnouncement : BaseEntity
{
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info"; // info, warning, success, error
    public string TargetRole { get; set; } = "All"; // All, Admin, Teacher, Student
    public bool IsActive { get; set; } = true;
}
