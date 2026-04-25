namespace DeuYbsLms.Application.DTOs.Course;

public class LearningPathDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    
    // Yolun toplam kurs sayısı
    public int TotalCourses { get; set; }
    
    // Öğrencinin tamamladığı kurs sayısı (Yol içindeki)
    public int CompletedCoursesCount { get; set; }
    
    // Yolun tamamlanma yüzdesi
    public int ProgressPercentage { get; set; }
    
    public List<LearningPathCourseDto> Courses { get; set; } = new();
}

public class LearningPathCourseDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public int OrderIndex { get; set; }
    
    // Durum: Locked, Available, Completed
    public string Status { get; set; } = "Locked"; 
    public int ProgressPercentage { get; set; }
}
