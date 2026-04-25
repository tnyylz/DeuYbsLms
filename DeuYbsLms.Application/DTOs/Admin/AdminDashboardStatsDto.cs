namespace DeuYbsLms.Application.DTOs.Admin;

public class AdminDashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalCourses { get; set; }
    public int TotalEnrollments { get; set; }

    public List<MonthlyRegistrationDto> MonthlyRegistrations { get; set; } = new();
    public List<AdminTopCourseDto> TopCourses { get; set; } = new();
    public List<AdminRecentActivityDto> RecentActivities { get; set; } = new();
}

public class MonthlyRegistrationDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AdminTopCourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
}

public class AdminRecentActivityDto
{
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
