// Path: DeuYbsLms.Infrastructure/Persistence/Context/AppDbContext.cs

using DeuYbsLms.Domain.Entities.Course;
using DeuYbsLms.Domain.Entities.Gamification;
using DeuYbsLms.Domain.Entities.Identity;
using DeuYbsLms.Domain.Entities.Progress;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace DeuYbsLms.Infrastructure.Persistence.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Identity
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();

    // Course
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<AnswerOption> AnswerOptions => Set<AnswerOption>();
    public DbSet<CourseTag> CourseTags => Set<CourseTag>();

    // Progress
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Certificate> Certificates => Set<Certificate>();

    // Gamification
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<XpTransaction> XpTransactions => Set<XpTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Infrastructure assembly'sindeki tüm IEntityTypeConfiguration'ları otomatik uygula
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }

    // SaveChanges override: UpdatedAt alanını otomatik doldurur
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is Domain.Entities.Common.BaseEntity entity)
                entity.UpdatedAt = DateTime.UtcNow;
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}