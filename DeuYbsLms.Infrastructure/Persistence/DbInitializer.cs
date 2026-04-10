// Path: DeuYbsLms.Infrastructure/Persistence/DbInitializer.cs
// Sınıf türü: Class

using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Enums;
using DeuYbsLms.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace DeuYbsLms.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Zaten veri varsa tekrar ekleme
        if (await context.Users.AnyAsync()) return;

        // --- KULLANICILAR ---
        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@deuybs.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var teacher = new AppUser
        {
            Id = Guid.NewGuid(),
            FirstName = "Ahmet",
            LastName = "Yılmaz",
            Email = "teacher@deuybs.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var student = new AppUser
        {
            Id = Guid.NewGuid(),
            FirstName = "Ayşe",
            LastName = "Kaya",
            Email = "student@deuybs.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow,
            StudentProfile = new Domain.Entities.Identity.StudentProfile
            {
                Id = Guid.NewGuid(),
                TotalXp = 0,
                CurrentLevel = 1,
                XpToNextLevel = 100,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Users.AddRangeAsync(admin, teacher, student);

        // --- KURS ---
        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = "C# ile Nesne Yönelimli Programlama",
            Description = "Bu kursta C# dilinde OOP kavramlarını öğreneceksiniz.",
            Level = CourseLevel.Beginner,
            IsPublished = true,
            TeacherId = teacher.Id,
            CreatedAt = DateTime.UtcNow,
            Lessons = new List<Lesson>
            {
                new Lesson
                {
                    Id = Guid.NewGuid(),
                    Title = "Giriş ve Kurulum",
                    Description = "C# geliştirme ortamının kurulumu.",
                    VideoUrl = "https://example.com/video1",
                    OrderIndex = 1,
                    CreatedAt = DateTime.UtcNow,
                    Quiz = new Quiz
                    {
                        Id = Guid.NewGuid(),
                        Title = "Giriş Quizi",
                        MinimumPassingScore = 60,
                        CreatedAt = DateTime.UtcNow,
                        Questions = new List<Question>
                        {
                            new Question
                            {
                                Id = Guid.NewGuid(),
                                QuestionText = "C# hangi şirket tarafından geliştirilmiştir?",
                                OrderIndex = 1,
                                CreatedAt = DateTime.UtcNow,
                                AnswerOptions = new List<AnswerOption>
                                {
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "Microsoft", IsCorrect = true, CreatedAt = DateTime.UtcNow },
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "Google", IsCorrect = false, CreatedAt = DateTime.UtcNow },
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "Apple", IsCorrect = false, CreatedAt = DateTime.UtcNow },
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "Oracle", IsCorrect = false, CreatedAt = DateTime.UtcNow }
                                }
                            }
                        }
                    }
                },
                new Lesson
                {
                    Id = Guid.NewGuid(),
                    Title = "Değişkenler ve Veri Tipleri",
                    Description = "C# temel veri tipleri ve değişken tanımlama.",
                    VideoUrl = "https://example.com/video2",
                    OrderIndex = 2,
                    CreatedAt = DateTime.UtcNow,
                    Quiz = new Quiz
                    {
                        Id = Guid.NewGuid(),
                        Title = "Veri Tipleri Quizi",
                        MinimumPassingScore = 60,
                        CreatedAt = DateTime.UtcNow,
                        Questions = new List<Question>
                        {
                            new Question
                            {
                                Id = Guid.NewGuid(),
                                QuestionText = "C#'ta tam sayı tipi hangisidir?",
                                OrderIndex = 1,
                                CreatedAt = DateTime.UtcNow,
                                AnswerOptions = new List<AnswerOption>
                                {
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "int", IsCorrect = true, CreatedAt = DateTime.UtcNow },
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "str", IsCorrect = false, CreatedAt = DateTime.UtcNow },
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "float", IsCorrect = false, CreatedAt = DateTime.UtcNow },
                                    new AnswerOption { Id = Guid.NewGuid(), OptionText = "char", IsCorrect = false, CreatedAt = DateTime.UtcNow }
                                }
                            }
                        }
                    }
                }
            }
        };

        await context.Courses.AddAsync(course);
        await context.SaveChangesAsync();
    }
}