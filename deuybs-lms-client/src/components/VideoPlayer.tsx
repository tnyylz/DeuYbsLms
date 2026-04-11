// Path: src/components/VideoPlayer.tsx

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface Props {
  videoUrl: string;
  onVideoComplete: () => void;
}

export default function VideoPlayer({ videoUrl, onVideoComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
    };

    const handleEnded = () => {
      setCompleted(true);
      setIsPlaying(false);
      onVideoComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  // YouTube embed kontrolü - videoUrl varsa kontrol et, yoksa false
  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be') || false;

  if (isYoutube) {
    const videoId = videoUrl.includes('youtu.be')
      ? videoUrl.split('/').pop()
      : new URL(videoUrl).searchParams.get('v');

    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {/* YouTube için tamamlandı butonu */}
        {!completed && (
          <button
            onClick={() => { setCompleted(true); onVideoComplete(); }}
            className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium text-white"
          >
            Videoyu Tamamla ✓
          </button>
        )}
        {completed && (
          <div className="absolute bottom-4 right-4 bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white">
            ✓ Tamamlandı
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Overlay Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar — tıklanamaz (atlama engeli) */}
        <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transition-colors">
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {completed && (
        <div className="absolute top-4 right-4 bg-green-600 px-3 py-1.5 rounded-lg text-sm font-medium text-white">
          ✓ Tamamlandı
        </div>
      )}
    </div>
  );
}