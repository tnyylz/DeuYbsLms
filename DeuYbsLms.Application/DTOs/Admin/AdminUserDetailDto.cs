using DeuYbsLms.Domain.Enums;
using System;
using System.Collections.Generic;

namespace DeuYbsLms.Application.DTOs.Admin;

public class AdminUserDetailDto : AdminUserDto
{
    public int TotalXp { get; set; }
    public int CurrentLevel { get; set; }
    public int EnrolledCoursesCount { get; set; }
    public int CompletedCoursesCount { get; set; }
    public List<AdminUserEnrollmentDto> Enrollments { get; set; } = new();
}

public class AdminUserEnrollmentDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
    public bool IsCompleted { get; set; }
    public int ProgressPercentage { get; set; }
}
