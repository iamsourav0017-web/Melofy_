import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  ChevronUp,
  ChevronDown,
  ListMusic,
  Sparkles,
  X
} from 'lucide-react';
import { Track } from '../types';
import { studioAudio } from '../utils/audioEngine';
import { VisualWaveform } from './VisualWaveform';

interface GlobalMelodyPlayerProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  onPlayTrack: (track: Track) => void;
  onPauseTrack: () => void;
  onToggleMute: () => void;
  onSeek: (seconds: number) => void;
}

export const GlobalMelodyPlayer: React.FC<GlobalMelodyPlayerProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  isMuted,
  currentTime,
  duration,
  onPlayTrack,
  onPauseTrack,
  onToggleMute,
  onSeek
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const publishedTracks = tracks.filter((t) => t.published !== false);
  const currentIndex = publishedTracks.findIndex((t) => t.id === currentTrackId);
  const activeTrack = (currentIndex !== -1 ? publishedTracks[currentIndex] : publishedTracks[0]) || tracks[0];

  const handlePrev = () => {
    studioAudio.playUiClick('button');
    const prevIdx = currentIndex <= 0 ? publishedTracks.length - 1 : currentIndex - 1;
    onPlayTrack(publishedTracks[prevIdx]);
  };

  const handleNext = () => {
    studioAudio.playUiClick('button');
    const nextIdx = (currentIndex + 1) % publishedTracks.length;
    onPlayTrack(publishedTracks[nextIdx]);
  };

  const handleTogglePlay = () => {
    studioAudio.playUiClick(isPlaying ? 'pause' : 'play');
    if (isPlaying) {
      onPauseTrack();
    } else {
      onPlayTrack(activeTrack);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!activeTrack || isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          title="Open Melody Player"
          aria-label="Open Melody Player"
          className="p-3 rounded-full bg-[#171A1C] text-white shadow-xl hover:bg-[var(--accent)] hover:text-[#171A1C] transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold"
        >
          <Music className="w-4 h-4 text-[var(--accent)] animate-pulse" />
          <span>Melody Player</span>
        </button>
      </div>
    );
  }

  const trackTotalDuration = duration || activeTrack.duration || 54;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / trackTotalDuration) * 100));

  return (
    <div
      id="global-melody-player"
      className="fixed bottom-3 sm:bottom-5 left-3 sm:left-auto sm:right-6 max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-[410px] z-40 select-none transition-all duration-300"
    >
      {/* Samples Selection Drawer Popup */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="mb-2 bg-white/95 backdrop-blur-xl border border-[#171A1C]/[0.10] rounded-2xl p-3 shadow-2xl space-y-2 max-h-[300px] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-1 pb-1 border-b border-[#171A1C]/[0.08]">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#171A1C]">
                <ListMusic className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>STUDIO MELODY SAMPLES ({publishedTracks.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-md text-[#6B6F72] hover:text-[#171A1C] hover:bg-[#171A1C]/5 transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {publishedTracks.map((t, idx) => {
                const isThisPlaying = currentTrackId === t.id && isPlaying;
                const isThisCurrent = currentTrackId === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onPlayTrack(t);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all text-xs cursor-pointer ${
                      isThisCurrent
                        ? 'bg-[#171A1C] text-white'
                        : 'hover:bg-[#171A1C]/5 text-[#171A1C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-code text-[10px] shrink-0 ${
                        isThisCurrent ? 'bg-[var(--accent)] text-[#171A1C] font-bold' : 'bg-[#171A1C]/10 text-[#6B6F72]'
                      }`}>
                        {isThisPlaying ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#171A1C] animate-ping" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold truncate leading-tight">{t.title}</p>
                        <p className={`font-body text-[11px] truncate ${isThisCurrent ? 'text-[#15BCDF]' : 'text-[#6B6F72]'}`}>
                          {t.genre}
                        </p>
                      </div>
                    </div>

                    <span className={`font-code text-[10px] shrink-0 ${isThisCurrent ? 'text-[#15BCDF]' : 'text-[#6B6F72]'}`}>
                      {t.scaleKey || 'Original'}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Player Card */}
      <div className="bg-white/92 backdrop-blur-xl border border-[#171A1C]/[0.10] rounded-2xl shadow-xl shadow-black/[0.08] p-3 sm:p-3.5 space-y-2.5 transition-all hover:shadow-2xl hover:border-[var(--accent)]/40">
        
        {/* Interactive Visual Waveform Layer (Mini or Expanded) */}
        <div className="pt-1">
          <VisualWaveform
            track={activeTrack}
            currentTime={currentTime}
            duration={trackTotalDuration}
            isPlaying={isPlaying}
            onSeek={onSeek}
            height={isExpanded ? 48 : 28}
            barCount={isExpanded ? 56 : 40}
            showTimeHover={true}
            className="w-full bg-[#171A1C]/5 rounded-xl px-2 py-1 transition-all duration-300"
          />
        </div>

        {/* Top Control Bar: Track Info & Action Buttons */}
        <div className="flex items-center justify-between gap-2.5">
          
          {/* Left: Spinning Record Icon + Track Meta */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          >
            {/* Spinning artwork disc */}
            <div className="relative w-10 h-10 rounded-full bg-[#171A1C] flex items-center justify-center shrink-0 border border-[#171A1C]/10 shadow-xs overflow-hidden">
              {activeTrack.artwork ? (
                <img
                  src={activeTrack.artwork}
                  alt={activeTrack.title}
                  className={`w-full h-full object-cover ${isPlaying && !shouldReduceMotion ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '8s' }}
                />
              ) : (
                <Music className="w-5 h-5 text-[var(--accent)]" />
              )}
              {/* Disc center hole */}
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-white border border-[#171A1C]/40" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="font-code text-[10px] text-[var(--accent)] font-bold tracking-wider uppercase truncate">
                  MELODY SAMPLE • {currentIndex + 1}/{publishedTracks.length}
                </span>
              </div>
              <p className="font-display font-bold text-xs sm:text-sm text-[#171A1C] truncate leading-tight group-hover:text-[var(--accent)] transition-colors">
                {activeTrack.title}
              </p>
              <p className="font-body text-[11px] text-[#6B6F72] truncate">
                {activeTrack.genre}
              </p>
            </div>
          </div>

          {/* Center & Right: Playback Buttons & Prominent Mute Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Previous Track */}
            <button
              type="button"
              onClick={handlePrev}
              title="Previous Melody"
              aria-label="Previous Melody"
              className="p-1.5 rounded-full text-[#6B6F72] hover:text-[#171A1C] hover:bg-[#171A1C]/5 transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Pause Melody' : 'Play Melody'}
              aria-label={isPlaying ? 'Pause Melody' : 'Play Melody'}
              className="w-9 h-9 rounded-full bg-[#171A1C] text-white hover:bg-[var(--accent)] hover:text-[#171A1C] flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={handleNext}
              title="Next Melody"
              aria-label="Next Melody"
              className="p-1.5 rounded-full text-[#6B6F72] hover:text-[#171A1C] hover:bg-[#171A1C]/5 transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Dedicated High-Visibility Mute / Sound Toggle Button */}
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Studio Sound (Click to unmute)' : 'Mute Studio Sound (Click to mute)'}
              aria-label={isMuted ? 'Unmute Studio Sound' : 'Mute Studio Sound'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-[var(--accent)]/15 text-[#171A1C] border border-[var(--accent)]/40 hover:bg-[var(--accent)] hover:text-[#171A1C]'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600" />
                  <span className="font-code text-[10px] uppercase font-bold">MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[var(--accent)]" />
                  {/* Miniature Equalizer animation */}
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-3 ml-0.5">
                      <span className="w-0.5 bg-current rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" />
                      <span className="w-0.5 bg-current rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_0.2s]" />
                      <span className="w-0.5 bg-current rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_0.4s]" />
                    </div>
                  )}
                </>
              )}
            </button>

            {/* Sample Selector Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              title="Browse All Melody Samples"
              aria-label="Browse All Melody Samples"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isDrawerOpen
                  ? 'bg-[#171A1C] text-white'
                  : 'text-[#6B6F72] hover:text-[#171A1C] hover:bg-[#171A1C]/5'
              }`}
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Expanded View: Waveform & Story Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-2 border-t border-[#171A1C]/[0.08] space-y-2"
          >
            <div className="flex items-center justify-between text-[10px] font-code text-[#6B6F72]">
              <span className="truncate max-w-[200px]">
                {activeTrack.occasion || 'Custom Studio Commission'}
              </span>
              <span>
                {formatTime(currentTime)} / {formatTime(trackTotalDuration)}
              </span>
            </div>

            <p className="font-body text-[11px] text-[#464B4F] line-clamp-2 italic">
              "{activeTrack.clientStory || activeTrack.description}"
            </p>

            <div className="flex items-center justify-between pt-1">
              <a
                href="#portfolio"
                onClick={() => setIsExpanded(false)}
                className="font-code text-[10px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>OPEN FULL CD RACK</span>
                <span>→</span>
              </a>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="font-code text-[10px] text-[#6B6F72] hover:text-[#171A1C] cursor-pointer"
              >
                Hide player
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
