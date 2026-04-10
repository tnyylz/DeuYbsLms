using DeuYbsLms.Application.Interfaces.Repositories;
using DeuYbsLms.Application.Interfaces.Services;
using DeuYbsLms.Infrastructure.Persistence.Context;
using DeuYbsLms.Infrastructure.Persistence.Repositories;
using DeuYbsLms.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DeuYbsLms.Infrastructure.Extensions;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<ILessonRepository, LessonRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<IProgressRepository, ProgressRepository>();

        // Services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProgressService, ProgressService>();
        services.AddScoped<IGamificationService, GamificationService>();
        services.AddScoped<ICertificateService, CertificateService>();

        return services;
    }
}