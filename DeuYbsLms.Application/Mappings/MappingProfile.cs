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
            .ForMember(dest => dest.TotalDurationInSeconds, opt => opt.MapFrom(src => src.Lessons.Sum(l => l.DurationInSeconds)))
            .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags.Select(t => t.Name).ToList()));

        // Course → TeacherCourseDto
        CreateMap<Course, DeuYbsLms.Application.DTOs.Teacher.TeacherCourseDto>()
            .ForMember(dest => dest.LessonCount, opt => opt.MapFrom(src => src.Lessons.Count))
            .ForMember(dest => dest.EnrollmentCount, opt => opt.MapFrom(src => src.Enrollments.Count));

        // Course → CourseDetailDto
        CreateMap<Course, CourseDetailDto>()
            .ForMember(dest => dest.TeacherName, opt => opt.MapFrom(src => src.Teacher.FullName))
            .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tags.Select(t => t.Name).ToList()))
            .ForMember(dest => dest.HasFinalExam, opt => opt.MapFrom(src => src.FinalExam != null))
            .ForMember(dest => dest.FinalExamMinPassingScore, opt => opt.MapFrom(src => src.FinalExam != null ? src.FinalExam.MinimumPassingScore : (int?)null));

        // Lesson → LessonDto
        CreateMap<Lesson, LessonDto>()
            .ForMember(dest => dest.HasQuiz, opt => opt.MapFrom(src => src.Quiz != null))
            .ForMember(dest => dest.QuizMinPassingScore,
                opt => opt.MapFrom(src => src.Quiz != null ? src.Quiz.MinimumPassingScore : (int?)null));

        // CreateCourseDto → Course
        CreateMap<CreateCourseDto, Course>()
            .ForMember(dest => dest.Tags, opt => opt.Ignore());

        // CreateLessonDto → Lesson
        CreateMap<CreateLessonDto, Lesson>();

        CreateMap<CreateQuizDto, Quiz>();
        CreateMap<CreateQuestionDto, Question>()
            .ForMember(dest => dest.AnswerOptions, opt => opt.MapFrom(src => src.Options));
        CreateMap<CreateAnswerOptionDto, AnswerOption>();

        // Quiz → Teacher View Mappings (Includes IsCorrect)
        CreateMap<Quiz, QuizDto>();
        CreateMap<Question, TeacherQuestionDto>()
            .ForMember(dest => dest.Options, opt => opt.MapFrom(src => src.AnswerOptions));
        CreateMap<AnswerOption, TeacherAnswerOptionDto>();

        // Quiz → Student View Mappings (Hides IsCorrect)
        CreateMap<Question, StudentQuestionDto>()
            .ForMember(dest => dest.Options, opt => opt.MapFrom(src => src.AnswerOptions));
        CreateMap<AnswerOption, StudentAnswerOptionDto>();

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

        // ShopItem → ShopItemDto
        CreateMap<ShopItem, ShopItemDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        // UserInventoryItem → UserInventoryItemDto
        CreateMap<UserInventoryItem, UserInventoryItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.ShopItem.Name))
            .ForMember(dest => dest.ItemType, opt => opt.MapFrom(src => src.ShopItem.Type.ToString()))
            .ForMember(dest => dest.IconEmoji, opt => opt.MapFrom(src => src.ShopItem.IconEmoji));

        // LearningPath mappings
        CreateMap<LearningPath, LearningPathDto>()
            .ForMember(dest => dest.TotalCourses, opt => opt.MapFrom(src => src.Courses.Count));

        CreateMap<LearningPathCourse, LearningPathCourseDto>()
            .ForMember(dest => dest.CourseTitle, opt => opt.MapFrom(src => src.Course.Title))
            .ForMember(dest => dest.ThumbnailUrl, opt => opt.MapFrom(src => src.Course.ThumbnailUrl));
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