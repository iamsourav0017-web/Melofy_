import React from 'react';
import { Play, Pause, Disc } from 'lucide-react';
import { Track } from '../types';
import { studioAudio } from '../utils/audioEngine';

interface CDVinylDiscProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  size?: number; // in pixels
  showControls?: boolean;
  onPlayToggle?: () => void;
  onClick?: () => void;
  className?: string;
}

export const CDVinylDisc: React.FC<CDVinylDiscProps> = ({
  track,
  isPlaying,
  isCurrent,
  size = 360,
  showControls = true,
  onPlayToggle,
  onClick,
  className = ''
}) => {
  const isSpinning = isPlaying && isCurrent;

  // Fallback curated artworks
  const getArtworkFallback = (category?: string) => {
    switch (category) {
      case 'wedding':
        return 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop';
      case 'romantic':
        return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop';
      case 'fusion':
        return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop';
      case 'retro':
        return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop';
      case 'pop':
        return 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop';
      case 'cinematic':
        return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
    }
  };

  const coverImage = track.artwork || getArtworkFallback(track.category);

  const handleMouseEnter = () => {
    studioAudio.playUiHover();
  };

  const handleDiscClick = () => {
    studioAudio.playUiClick(isSpinning ? 'pause' : 'play');
    if (onClick) {
      onClick();
    } else if (onPlayToggle) {
      onPlayToggle();
    }
  };

  const handleControlToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    studioAudio.playUiClick(isSpinning ? 'pause' : 'play');
    onPlayToggle?.();
  };

  return (
    <div
      id={`cd-vinyl-disc-${track.id}`}
      onClick={handleDiscClick}
      onMouseEnter={handleMouseEnter}
      className={`relative select-none group transition-all duration-300 ease-out cursor-pointer ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      {/* Main Circular Physical CD/Vinyl Disc Record */}
      <div
        className={`w-full h-full rounded-full relative overflow-hidden bg-[#121416] transition-all duration-300 ease-out ${
          isSpinning ? 'animate-[spin_6.5s_linear_infinite] motion-reduce:animate-none' : 'rotate-0'
        }`}
      >
        {/* Full-Bleed High-Res Circular Album Artwork */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={coverImage}
            alt={track.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-95 contrast-105 saturate-110"
          />
          {/* Subtle Studio Grading Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/30 mix-blend-multiply" />
        </div>

        {/* Concentric Phonograph Vinyl Sound Grooves Layer */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
          style={{
            background: `
              repeating-radial-gradient(
                circle at center,
                transparent 0,
                transparent 3px,
                rgba(0, 0, 0, 0.38) 4px,
                rgba(255, 255, 255, 0.07) 5px,
                transparent 6px
              )
            `,
            opacity: 0.9
          }}
        />

        {/* Photorealistic Dual Specular Radial Light Reflection Cones */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none rounded-full transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `
              conic-gradient(
                from 35deg at 50% 50%,
                transparent 0deg,
                rgba(255, 255, 255, 0.16) 35deg,
                rgba(255, 255, 255, 0.28) 45deg,
                rgba(255, 255, 255, 0.12) 55deg,
                transparent 90deg,
                transparent 180deg,
                rgba(255, 255, 255, 0.16) 215deg,
                rgba(255, 255, 255, 0.28) 225deg,
                rgba(255, 255, 255, 0.12) 235deg,
                transparent 270deg,
                transparent 360deg
              )
            `,
            mixBlendMode: 'screen',
            opacity: 0.85
          }}
        />

        {/* Outer Vinyl Lead-In Edge & Guard Rim */}
        <div className="absolute inset-1 rounded-full border border-white/25 pointer-events-none transition-colors duration-300 group-hover:border-[#15BCDF]/40" />
        <div className="absolute inset-2 rounded-full border border-black/50 pointer-events-none" />

        {/* Central Spindle Hub & Melofy Studio Disc Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[35%] h-[35%] rounded-full border border-black/80 flex flex-col items-center justify-center text-center p-2 text-white relative z-10"
            style={{
              background: 'radial-gradient(circle at 40% 30%, #22262A 0%, #121416 100%)'
            }}
          >
            {/* Center Label Typography */}
            <div className="space-y-0.5 max-w-[88%] overflow-hidden flex flex-col items-center">
              <span className="font-code text-[8px] sm:text-[9px] tracking-[0.25em] text-[#15BCDF] uppercase font-bold truncate block">
                MELOFY
              </span>
              <span className="font-display text-[9px] sm:text-[11px] font-bold text-white tracking-wide truncate block max-w-full leading-tight">
                {track.title}
              </span>
              <span className="font-code text-[7px] sm:text-[8px] text-white/50 tracking-wider uppercase block">
                {track.scaleKey || 'STUDIO MASTER'}
              </span>
            </div>

            {/* Turntable Center Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#0C0E10] border border-white/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
            </div>
          </div>
        </div>
      </div>

      {/* Center Play/Pause Control Overlay */}
      {showControls && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-200 ${
            isCurrent
              ? 'opacity-100 group-hover:opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={handleControlToggle}
            title={isSpinning ? `Pause ${track.title}` : `Play ${track.title}`}
            aria-label={isSpinning ? `Pause ${track.title}` : `Play ${track.title}`}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#171A1C]/90 text-white hover:bg-[#15BCDF] hover:text-[#171A1C] border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isSpinning ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Floating Turntable Status Tag */}
      {isCurrent && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#171A1C] text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 font-code text-[10px] tracking-wider z-20 whitespace-nowrap">
          <Disc className={`w-3.5 h-3.5 text-[#15BCDF] ${isSpinning ? 'animate-spin motion-reduce:animate-none' : ''}`} />
          <span className="font-semibold">{isSpinning ? 'PLAYING 33⅓ RPM' : 'READY TO PLAY'}</span>
        </div>
      )}
    </div>
  );
};

