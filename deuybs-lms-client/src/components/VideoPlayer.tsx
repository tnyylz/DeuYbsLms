// Path: src/components/VideoPlayer.tsx

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { updateVideoProgressApi } from '../api/progress.api';

interface Props {
  lessonId: string;
  videoUrl: string;
  initialTime: number;
  onVideoComplete: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function VideoPlayer({ lessonId, videoUrl, initialTime, onVideoComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // YouTube embed kontrolü
  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be') || false;
  const videoId = isYoutube 
    ? (videoUrl.includes('youtu.be') ? videoUrl.split('/').pop() : new URL(videoUrl).searchParams.get('v'))
    : null;

  // --- YouTube API Entegrasyonu ---
  useEffect(() => {
    if (!isYoutube || !videoId) return;

    const loadYoutubeApi = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    };

    const initializePlayer = () => {
      if (!youtubeContainerRef.current) return;

      playerRef.current = new window.YT.Player(youtubeContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          start: initialTime, // Kaldığı yerden başla
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            if (initialTime > 0) {
              event.target.seekTo(initialTime, true);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (event.data === 1) {
              setIsPlaying(true);
              startProgressTracking();
            } else {
              setIsPlaying(false);
              stopProgressTracking();
              
              if (event.data === 0) {
                setCompleted(true);
                onVideoComplete();
              }
            }
          }
        }
      });
    };

    loadYoutubeApi();

    return () => {
      stopProgressTracking();
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, isYoutube]);

  // --- HTML5 Video Entegrasyonu ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYoutube) return;

    const handleTimeUpdate = () => {
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
      
      // Her 5 saniyede bir kaydet (basit throttle)
      if (Math.floor(video.currentTime) % 5 === 0) {
        saveProgress(Math.floor(video.currentTime));
      }
    };

    const handleEnded = () => {
      setCompleted(true);
      setIsPlaying(false);
      onVideoComplete();
    };

    const handleLoadedMetadata = () => {
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      setIsPlayerReady(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onVideoComplete, isYoutube, initialTime]);

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        saveProgress(currentTime);
      }
    }, 5000); // 5 saniyede bir sync
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const saveProgress = async (second: number) => {
    try {
      await updateVideoProgressApi(lessonId, second);
    } catch (err) {
      console.warn("İlerleme kaydedilemedi:", err);
    }
  };

  const togglePlay = () => {
    if (isYoutube) {
      if (playerRef.current) {
        const state = playerRef.current.getPlayerState();
        if (state === 1) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
      }
    } else {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) video.play();
      else video.pause();
      setIsPlaying(!video.paused);
    }
  };

  const toggleMute = () => {
    if (isYoutube) {
      if (playerRef.current) {
        if (playerRef.current.isMuted()) playerRef.current.unMute();
        else playerRef.current.mute();
        setIsMuted(playerRef.current.isMuted());
      }
    } else {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const toggleFullscreen = () => {
    const container = isYoutube ? youtubeContainerRef.current : videoRef.current;
    if (!container) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else container.requestFullscreen();
  };

  if (isYoutube) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        {!isPlayerReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video Yükleniyor...</p>
          </div>
        )}
        <div ref={youtubeContainerRef} className="w-full h-full" />
        
        {completed && (
          <div className="absolute top-4 right-4 bg-emerald-600 px-4 py-2 rounded-xl text-xs font-black text-white shadow-lg animate-in zoom-in duration-300">
            ✓ TAMAMLANDI
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl">
      {!isPlayerReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video Yükleniyor...</p>
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-4 overflow-hidden backdrop-blur-sm">
          <div
            className="bg-indigo-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-indigo-400 transform hover:scale-110 active:scale-95 transition-all">
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-indigo-400 transform hover:scale-110 transition-all">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transform hover:scale-110 transition-all">
            <Maximize size={20} />
          </button>
        </div>
      </div>

      {completed && (
        <div className="absolute top-4 right-4 bg-emerald-600 px-4 py-2 rounded-xl text-xs font-black text-white shadow-lg">
          ✓ TAMAMLANDI
        </div>
      )}
    </div>
  );
}