import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Download, 
  RotateCcw,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import type { AspectRatio } from '../types.ts';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  aspectRatio: AspectRatio;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, aspectRatio }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<'1080p' | '720p'>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.volume = volume;
    };
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [volume]);

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    video.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Aspect ratio styling
  const aspectClass = aspectRatio === '9:16' 
    ? 'aspect-[9/16] max-h-[680px]' 
    : aspectRatio === '1:1' 
    ? 'aspect-square max-h-[640px]' 
    : 'aspect-video w-full';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>{title || "Generated Film Master"}</span>
        </h3>

        <div className="flex items-center gap-2">
          {/* Download MP4 button */}
          <a
            id="download-video-btn"
            href={videoUrl}
            download={`${title.toLowerCase().replace(/\s+/g, '_') || 'film'}.mp4`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download MP4</span>
          </a>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(isPlaying ? false : true)}
        className={`relative mx-auto bg-black rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl group flex items-center justify-center ${aspectClass}`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Center Play/Pause Splash (when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-20"
          >
            <Play className="w-8 h-8 fill-white translate-x-0.5" />
          </button>
        )}

        {/* Bottom Control Bar */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-6 transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Bar */}
          <div className="relative w-full mb-3 group/seek">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-cyan-400 outline-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
              </button>

              {/* Volume & Mute */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 outline-none hidden sm:block"
                />
              </div>

              {/* Time display */}
              <div className="text-xs font-mono text-slate-300">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-medium text-slate-200 transition-colors cursor-pointer"
                  title="Quality control"
                >
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                  <span>{quality}</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute right-0 bottom-full mb-2 bg-[#121520] border border-white/10 rounded-xl p-1 shadow-2xl min-w-[110px] space-y-0.5 z-30">
                    <button
                      onClick={() => { setQuality('1080p'); setShowQualityMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        quality === '1080p' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      1080p Master
                    </button>
                    <button
                      onClick={() => { setQuality('720p'); setShowQualityMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        quality === '720p' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      720p Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
