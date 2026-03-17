// Path: DeuYbsLms.Application/Mappings/MappingProfile.cs

using AutoMapper;
using DeuYbsLms.Application.DTOs.Course;
using DeuYbsLms.Application.DTOs.Progress;
using DeuYbsLms.Application.DTOs.Gamification;
using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Domain.Entities.Progress;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Enums;

namespace DeuYbsLms.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Course → CourseDto
        CreateMap<Course, CourseDto>()
            .ForMember(dest => dest.TeacherName, opt => opt.MapFrom(src => src.Teacher.FullName))
            .ForMember(dest => dest.LessonCount, opt => opt.MapFrom(src => src.Lessons.Count))
            .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags.Select(t => t.Name).ToList()));

        // Course → CourseDetailDto
        CreateMap<Course, CourseDetailDto>()
            .ForMember(dest => dest.TeacherName, opt => opt.MapFrom(src => src.Teacher.FullName))
            .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags.Select(t => t.Name).ToList()));

        // Lesson → LessonDto
        CreateMap<Lesson, LessonDto>()
            .ForMember(dest => dest.HasQuiz, opt => opt.MapFrom(src => src.Quiz != null))
            .ForMember(dest => dest.QuizMinPassingScore,
                opt => opt.MapFrom(src => src.Quiz != null ? src.Quiz.MinimumPassingScore : (int?)null));

        // CreateCourseDto → Course
        CreateMap<CreateCourseDto, Course>();

        // CreateLessonDto → Lesson
        CreateMap<CreateLessonDto, Lesson>();

        // LessonProgress → LessonProgressDto
        CreateMap<LessonProgress, LessonProgressDto>()
            .ForMember(dest => dest.LessonTitle, opt => opt.MapFrom(src => src.Lesson.Title))
            .ForMember(dest => dest.OrderIndex, opt => opt.MapFrom(src => src.Lesson.OrderIndex));

        // CourseEnrollment → EnrollmentDto
        CreateMap<CourseEnrollment, EnrollmentDto>()
            .ForMember(dest => dest.CourseTitle, opt => opt.MapFrom(src => src.Course.Title))
            .ForMember(dest => dest.CompletedLessonsCount,
                opt => opt.MapFrom(src => src.LessonProgresses.Count(lp => lp.IsQuizPassed)))
            .ForMember(dest => dest.TotalLessonsCount,
                opt => opt.MapFrom(src => src.Course.Lessons.Count));

        // Certificate → CertificateDto
        CreateMap<Certificate, CertificateDto>()
            .ForMember(dest => dest.StudentName,
                opt => opt.MapFrom(src => src.Enrollment.Student.FullName))
            .ForMember(dest => dest.CourseTitle,
                opt => opt.MapFrom(src => src.Enrollment.Course.Title));

        // UserBadge → BadgeDto
        CreateMap<UserBadge, BadgeDto>()
            .ForMember(dest => dest.BadgeType, opt => opt.MapFrom(src => src.BadgeType.ToString()))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => GetBadgeDisplayName(src.BadgeType)))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => GetBadgeDescription(src.BadgeType)))
            .ForMember(dest => dest.IconEmoji, opt => opt.MapFrom(src => GetBadgeEmoji(src.BadgeType)));
    }

    private static string GetBadgeDisplayName(BadgeType type) => type switch
    {
        BadgeType.FirstBlood => "İlk Kan",
        BadgeType.Flawless => "Kusursuz",
        BadgeType.Speedrunner => "Hız Koşucusu",
        BadgeType.Persistent => "Azimli",
        BadgeType.CourseCompleter => "Kurs Tamamlayıcı",
        BadgeType.Overachiever => "Üstün Başarılı",
        _ => type.ToString()
    };

    private static string GetBadgeDescription(BadgeType type) => type switch
    {
        BadgeType.FirstBlood => "İlk quizini başarıyla geçtin!",
        BadgeType.Flawless => "Bir quizden tam puan aldın!",
        BadgeType.Speedrunner => "Bir kursu rekor sürede tamamladın!",
        BadgeType.Persistent => "Birden fazla başarısızlıktan sonra pes etmedin!",
        BadgeType.CourseCompleter => "Bir kursu tamamen bitirdin!",
        BadgeType.Overachiever => "Kategorideki tüm kursları tamamladın!",
        _ => string.Empty
    };

    private static string GetBadgeEmoji(BadgeType type) => type switch
    {
        BadgeType.FirstBlood => "🩸",
        BadgeType.Flawless => "💎",
        BadgeType.Speedrunner => "⚡",
        BadgeType.Persistent => "🔥",
        BadgeType.CourseCompleter => "🎓",
        BadgeType.Overachiever => "🏆",
        _ => "⭐"
    };
}