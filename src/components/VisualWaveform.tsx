import React, { useRef, useState, useMemo } from 'react';
import { Track } from '../types';

interface VisualWaveformProps {
  track: Track;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  height?: number;
  barCount?: number;
  showTimeHover?: boolean;
  className?: string;
}

export const VisualWaveform: React.FC<VisualWaveformProps> = ({
  track,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  height = 44,
  barCount = 64,
  showTimeHover = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Generate deterministic pseudo-waveform profile for the given track
  const baseWaveform = useMemo(() => {
    const bars: number[] = [];
    let seed = 0;
    const str = track.id + (track.title || '') + (track.genre || '') + (track.key || '');
    for (let i = 0; i < str.length; i++) {
      seed = (seed << 5) - seed + str.charCodeAt(i);
      seed |= 0;
    }

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < barCount; i++) {
      const progress = i / barCount;
      // Musical envelope structure: intro rise -> verse rhythm -> chorus peak -> outro taper
      let envelope = 0.5;
      if (progress < 0.15) {
        envelope = 0.3 + (progress / 0.15) * 0.4;
      } else if (progress < 0.4) {
        envelope = 0.65 + Math.sin(progress * Math.PI * 4) * 0.2;
      } else if (progress < 0.75) {
        // High energy chorus
        envelope = 0.82 + Math.sin(progress * Math.PI * 8) * 0.18;
      } else {
        // Outro
        envelope = 0.75 - ((progress - 0.75) / 0.25) * 0.4;
      }

      const noise = pseudoRandom(i) * 0.35 + 0.15;
      const barHeight = Math.min(1, Math.max(0.18, envelope * (0.6 + noise * 0.6)));
      bars.push(barHeight);
    }
    return bars;
  }, [track.id, track.title, track.genre, track.key, barCount]);

  const totalDuration = duration > 0 ? duration : (track.duration || 54);
  const progressRatio = totalDuration > 0 ? Math.min(1, Math.max(0, currentTime / totalDuration)) : 0;
  const currentBarIndex = Math.floor(progressRatio * barCount);

  // Time formatting helper
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePointerAction = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = clickX / rect.width;
    const targetSeconds = ratio * totalDuration;
    onSeek(targetSeconds);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlePointerAction(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverPosition(relativeX / rect.width);

    if (isDragging) {
      handlePointerAction(e.clientX);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
    setHoverPosition(null);
  };

  // Touch handlers for mobile scrubbing
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handlePointerAction(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handlePointerAction(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      id={`waveform-generator-${track.id}`}
      className={`relative w-full select-none cursor-pointer group flex items-center ${className}`}
      style={{ height: `${height}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      title="Click or drag waveform to scrub through audio"
    >
      {/* Waveform Bars Container with Fluid Reactive Scaling */}
      <div className="w-full h-full flex items-center justify-between gap-[2px] sm:gap-[3px] px-1">
        {baseWaveform.map((baseHeight, idx) => {
          const isPassed = idx <= currentBarIndex;
          const isCurrent = idx === currentBarIndex;
          const isNearby = Math.abs(idx - currentBarIndex) <= 2;
          
          // Harmonic animation calculation
          const pixelHeight = Math.max(4, Math.round(baseHeight * height));

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-center h-full min-w-[2px]"
            >
              <div
                className={`w-full rounded-full transition-all duration-200 ease-out ${
                  isPassed
                    ? isCurrent && isPlaying
                      ? 'bg-white shadow-[0_0_12px_var(--accent)] scale-y-125 brightness-125 ring-1 ring-white/60'
                      : isNearby && isPlaying
                      ? 'bg-[var(--accent)] shadow-[0_0_6px_var(--accent)] brightness-110'
                      : 'bg-[var(--accent)] opacity-90'
                    : 'bg-white/20 group-hover:bg-white/35 opacity-75'
                }`}
                style={{
                  height: `${pixelHeight}px`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Scrubber Playhead Line Indicator with Glowing Pulse Head */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none transition-all duration-100 flex items-center z-10"
        style={{ left: `${progressRatio * 100}%` }}
      >
        <div className="w-[2px] h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] -translate-x-1/2" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white ring-2 ring-[var(--accent)] shadow-[0_0_10px_var(--accent)] transition-transform duration-150 group-hover:scale-125" />
      </div>

      {/* Hover Scrubber Line & Time Tooltip */}
      {showTimeHover && isHovering && hoverPosition !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center -translate-x-1/2"
          style={{ left: `${hoverPosition * 100}%` }}
        >
          {/* Subtle guide line */}
          <div className="w-[1.5px] h-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] border-dashed opacity-80" />
          
          {/* Timestamp Tooltip Badge */}
          <div className="absolute -top-8 bg-[#171A1C] text-white font-code text-[11px] font-semibold px-2 py-0.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
            {formatTime(hoverPosition * totalDuration)}
          </div>
        </div>
      )}
    </div>
  );
};

