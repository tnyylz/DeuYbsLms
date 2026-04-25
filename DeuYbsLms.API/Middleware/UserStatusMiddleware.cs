// Path: DeuYbsLms.API/Middleware/UserStatusMiddleware.cs

using System.Security.Claims;
using DeuYbsLms.Application.Interfaces.Repositories;

namespace DeuYbsLms.API.Middleware;

public class UserStatusMiddleware
{
    private readonly RequestDelegate _next;

    public UserStatusMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserRepository userRepository)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier) ?? context.User.FindFirst("userId");
            
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                // TODO: Performance optimization - Cache the status for a few minutes
                var user = await userRepository.GetByIdAsync(userId);
                
                if (user != null && !user.IsActive)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new 
                    { 
                        message = "Hesabınız dondurulmuştur. Lütfen sistem yöneticisi ile iletişime geçin.",
                        isBanned = true 
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}

public static class UserStatusMiddlewareExtensions
{
    public static IApplicationBuilder UseUserStatusCheck(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<UserStatusMiddleware>();
    }
}
