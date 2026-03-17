// Path: DeuYbsLms.Application/ApplicationServiceRegistration.cs

using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using DeuYbsLms.Application.Mappings;

namespace DeuYbsLms.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Yeni AutoMapper versiyonunda profile'ı direkt belirtiyoruz
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        return services;
    }
}