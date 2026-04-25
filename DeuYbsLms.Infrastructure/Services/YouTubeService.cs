// Path: DeuYbsLms.Infrastructure/Services/YouTubeService.cs

using DeuYbsLms.Application.Interfaces.Services;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Services;
using Google.Apis.Upload;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;

namespace DeuYbsLms.Infrastructure.Services;

public class YouTubeService : IYouTubeService
{
    private readonly IConfiguration _configuration;

    public YouTubeService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> UploadVideoAsync(Stream videoStream, string title, string description, string contentType)
    {
        var clientId = _configuration["YouTube:ClientId"];
        var clientSecret = _configuration["YouTube:ClientSecret"];
        var refreshToken = _configuration["YouTube:RefreshToken"];

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) || string.IsNullOrEmpty(refreshToken))
        {
            throw new Exception("YouTube API ayarları appsettings.json dosyasında eksik!");
        }

        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = clientId,
                ClientSecret = clientSecret
            }
        });

        var tokenResponse = new TokenResponse { RefreshToken = refreshToken };
        var credential = new UserCredential(flow, "user", tokenResponse);

        var youtubeService = new Google.Apis.YouTube.v3.YouTubeService(new BaseClientService.Initializer()
        {
            HttpClientInitializer = credential,
            ApplicationName = "DeuYbsLms"
        });

        var video = new Video
        {
            Snippet = new VideoSnippet
            {
                Title = title,
                Description = description,
                CategoryId = "27" // Education
            },
            Status = new VideoStatus
            {
                PrivacyStatus = "unlisted" // Liste Dışı
            }
        };

        var videosInsertRequest = youtubeService.Videos.Insert(video, "snippet,status", videoStream, contentType);
        
        // Progress izlemek için buraya event eklenebilir ama backend-to-youtube hızı genelde yüksektir.
        var uploadProgress = await videosInsertRequest.UploadAsync();

        if (uploadProgress.Status == UploadStatus.Failed)
        {
            throw new Exception($"YouTube yükleme hatası: {uploadProgress.Exception.Message}");
        }

        return videosInsertRequest.ResponseBody.Id;
    }
}
