// Path: DeuYbsLms.Infrastructure/BackgroundJobs/LeagueSeasonWorker.cs

using DeuYbsLms.Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DeuYbsLms.Infrastructure.BackgroundJobs;

public class LeagueSeasonWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LeagueSeasonWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Saatte bir kontrol et

    public LeagueSeasonWorker(IServiceProvider serviceProvider, ILogger<LeagueSeasonWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("League Season Worker başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                
                // Sadece Pazar gecesi 00:00 - 01:00 arası çalışacak şekilde ayarlanabilir
                // Ancak LeagueService.ProcessSeasonClosureAsync içinde "EndDate < Now" kontrolü olduğu için 
                // her saat başı çalışıp vadesi dolanları kapatmak daha güvenli.
                
                using (var scope = _serviceProvider.CreateScope())
                {
                    var leagueService = scope.ServiceProvider.GetRequiredService<ILeagueService>();
                    await leagueService.ProcessSeasonClosureAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "League Season Worker içinde bir hata oluştu.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }
}
