import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Play, Pause, ChevronLeft, ChevronRight, Disc, ArrowRight,
  Clock, Activity, Sparkles, ArrowDown
} from 'lucide-react';
import { Track, PortfolioContent } from '../types';
import { EditableText } from './EditableText';
import { VisualWaveform } from './VisualWaveform';
import { CDVinylDisc } from './CDVinylDisc';
import { studioAudio } from '../utils/audioEngine';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';
import { Magnetic, SpecularCard } from './InteractiveEffects';
import { ParallaxFloatingAura } from './ParallaxContainer';

interface PortfolioSectionProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  content: PortfolioContent;
  isEditMode?: boolean;
  onUpdateContent: (updated: Partial<PortfolioContent>) => void;
  onPlayTrack: (track: Track) => void;
  onPauseTrack: () => void;
  onSeek: (seconds: number) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  currentTime,
  duration,
  content,
  isEditMode = false,
  onUpdateContent,
  onPlayTrack,
  onPauseTrack,
  onSeek
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyContainerRef = useRef<HTMLDivElement | null>(null);
  const rackTrackRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  // Available published portfolio tracks (memoized)
  const portfolioTracks = React.useMemo(() => tracks.filter((t) => t.published !== false), [tracks]);
  const totalTracks = portfolioTracks.length || 1;

  // Track previous playing track to auto-sync when track switches
  const prevPlayingTrackIdRef = useRef<string | null>(null);

  // Sync active track if playing track changes from elsewhere
  useEffect(() => {
    if (currentTrackId && currentTrackId !== prevPlayingTrackIdRef.current) {
      prevPlayingTrackIdRef.current = currentTrackId;
      const idx = portfolioTracks.findIndex((t) => t.id === currentTrackId);
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    } else if (!currentTrackId) {
      prevPlayingTrackIdRef.current = null;
    }
  }, [currentTrackId, portfolioTracks, activeIndex]);

  // Height multiplier for sticky scroll: giving generous scroll distance so tracks glide smoothly across viewport
  // each track gets ~65vh of scroll distance
  const totalSectionHeightVh = Math.max(160, totalTracks * 65);

  // Scroll listener that measures vertical scroll within sectionRef and drives horizontal translation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
          if (!sectionRef.current) return;

          const rect = sectionRef.current.getBoundingClientRect();
          const totalScrollDistance = sectionRef.current.offsetHeight - window.innerHeight;

          if (totalScrollDistance <= 0) return;

          // How far we have scrolled into this section
          const scrolledAmount = -rect.top;
          const rawProgress = scrolledAmount / totalScrollDistance;
          const clamped = Math.max(0, Math.min(1, rawProgress));

          setScrollProgress(clamped);

          if (!isProgrammaticScrollRef.current) {
            // Map progress to active CD index
            const calculatedIndex = Math.min(
              totalTracks - 1,
              Math.max(0, Math.floor(clamped * totalTracks * 0.999))
            );
            if (calculatedIndex !== activeIndex) {
              setActiveIndex(calculatedIndex);
            }
          }
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [totalTracks, activeIndex]);

  // Programmatic scroll to a specific CD
  const scrollToCD = useCallback((index: number) => {
    if (!sectionRef.current) return;
    const clampedIndex = Math.max(0, Math.min(totalTracks - 1, index));
    setActiveIndex(clampedIndex);

    const totalScrollDistance = sectionRef.current.offsetHeight - window.innerHeight;
    if (totalScrollDistance > 0) {
      isProgrammaticScrollRef.current = true;
      const targetProgress = clampedIndex / (totalTracks - 1 || 1);
      const sectionTop = sectionRef.current.offsetTop;
      const targetScrollY = sectionTop + targetProgress * totalScrollDistance;

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    }
  }, [totalTracks]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToCD(activeIndex - 1);
    }
  }, [activeIndex, scrollToCD]);

  const handleNext = useCallback(() => {
    if (activeIndex < totalTracks - 1) {
      scrollToCD(activeIndex + 1);
    }
  }, [activeIndex, totalTracks, scrollToCD]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top <= 100 && rect.bottom >= window.innerHeight - 100;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        if (activeIndex < totalTracks - 1) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeIndex > 0) {
          e.preventDefault();
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, totalTracks, handleNext, handlePrev]);

  const activeTrack = portfolioTracks[activeIndex] || portfolioTracks[0] || tracks[0];

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = (trackToPlay: Track) => {
    const willPause = currentTrackId === trackToPlay.id && isPlaying;
    studioAudio.playUiClick(willPause ? 'pause' : 'play');
    if (willPause) {
      onPauseTrack();
    } else {
      onPlayTrack(trackToPlay);
    }
  };

  const shouldReduceMotion = useReducedMotion();

  // Calculate the horizontal translate percentage for the rack
  // Moves from 0% at track 0 to -(totalTracks - 1) * itemSpacing at last track
  const itemWidthRem = 22; // ~350px per card
  const horizontalOffsetRem = -scrollProgress * ((totalTracks - 1) * itemWidthRem);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative w-full bg-transparent"
      style={{
        height: `${totalSectionHeightVh}vh`
      }}
    >
      {/* Pinned Sticky Stage: Locks in viewport while scrolling through songs */}
      <div
        ref={stickyContainerRef}
        className="sticky top-0 h-screen w-full flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-8 max-w-[1500px] mx-auto overflow-hidden select-none z-20"
      >
        {/* Ambient Depth Floating Auras */}
        <ParallaxFloatingAura
          color="var(--accent)"
          size={450}
          top="15%"
          left="5%"
          speed={0.4}
          yRange={[60, -60]}
          opacity={0.08}
        />
        <ParallaxFloatingAura
          color="#3B82F6"
          size={380}
          bottom="10%"
          right="10%"
          speed={0.6}
          yRange={[80, -80]}
          opacity={0.06}
        />
        
        {/* 1. Header Bar: Title, Badge, and Progress */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--card-border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <EditableText
                value={content.badge}
                onSave={(val) => onUpdateContent({ badge: val })}
                isEditingGlobal={isEditMode}
                className="font-code text-xs tracking-widest text-[var(--text-muted)] uppercase font-semibold"
                as="span"
              />
            </div>

            <h2
              id="portfolio-heading"
              className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[var(--text-main)] leading-tight tracking-tight"
            >
              <EditableText
                value={content.headingLine1}
                onSave={(val) => onUpdateContent({ headingLine1: val })}
                isEditingGlobal={isEditMode}
                as="span"
              />{' '}
              <EditableText
                value={content.headingAccent}
                onSave={(val) => onUpdateContent({ headingAccent: val })}
                isEditingGlobal={isEditMode}
                className="text-[var(--accent)]"
                as="span"
              />
            </h2>
          </div>

          {/* Controls & Scroll Progress Bar */}
          <div className="flex items-center gap-3 font-code text-xs text-[var(--text-muted)] shrink-0 self-start sm:self-end">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm">
              <span className="font-bold text-[var(--text-main)]">
                {(activeIndex + 1).toString().padStart(2, '0')}
              </span>
              <span className="opacity-40">/</span>
              <span>{totalTracks.toString().padStart(2, '0')}</span>
            </div>

            {/* Step Dots indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm">
              {portfolioTracks.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCD(idx)}
                  title={`Jump to CD ${(idx + 1).toString().padStart(2, '0')}`}
                  aria-label={`Jump to CD ${(idx + 1).toString().padStart(2, '0')}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-6 bg-[var(--accent)]'
                      : 'w-2 bg-[var(--text-main)]/25 hover:bg-[var(--accent)]/60'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                title="Previous CD"
                className={`p-2 rounded-lg border font-code text-xs flex items-center justify-center transition-colors ${
                  activeIndex === 0
                    ? 'opacity-35 border-[var(--card-border)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={activeIndex === totalTracks - 1}
                title="Next CD"
                className={`p-2 rounded-lg border font-code text-xs flex items-center justify-center transition-colors ${
                  activeIndex === totalTracks - 1
                    ? 'opacity-35 border-[var(--card-border)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Center Stage: Sticky Scroll Driven Horizontal Carousel */}
        <div className="relative w-full my-auto overflow-hidden py-4">
          
          {/* Subtle helper instruction */}
          <div className="flex items-center justify-between text-[11px] font-code text-[var(--text-muted)] px-2 mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Disc className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" style={{ animationDuration: '8s' }} />
              <span>SCROLL DOWN / UP TO SHUFFLE SONGS • CLICK ANY CD TO LISTEN</span>
            </span>
            <span className="hidden sm:inline opacity-60">
              {Math.round(scrollProgress * 100)}% CATALOGUE EXPLORED
            </span>
          </div>

          {/* Smooth Horizontal Track Powered by Vertical Scroll progress */}
          <div
            ref={rackTrackRef}
            className="flex items-center gap-8 sm:gap-12 md:gap-14 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(calc(35vw + ${horizontalOffsetRem}rem), 0, 0)`,
              willChange: 'transform'
            }}
          >
            {portfolioTracks.map((track, idx) => {
              const isActive = idx === activeIndex;
              const discSize = typeof window !== 'undefined'
                ? (window.innerWidth < 640 ? (isActive ? 200 : 160) : (isActive ? 260 : 200))
                : (isActive ? 260 : 200);

              return (
                <div
                  key={track.id}
                  onClick={() => scrollToCD(idx)}
                  className={`shrink-0 flex flex-col items-center select-none transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'scale-105 opacity-100 z-20'
                      : 'scale-90 opacity-50 hover:opacity-80 hover:scale-95 z-10'
                  }`}
                  style={{ width: `${itemWidthRem}rem` }}
                >
                  {/* Top Step Badge */}
                  <div className="mb-2 flex items-center gap-2 font-code text-[11px]">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-[#171A1C]'
                        : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--card-border)]'
                    }`}>
                      CD {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[160px]">
                      {track.genre}
                    </span>
                  </div>

                  {/* CD Vinyl Disc Record */}
                  <div className="relative">
                    <CDVinylDisc
                      track={track}
                      isPlaying={isPlaying}
                      isCurrent={currentTrackId === track.id}
                      size={discSize}
                      showControls={isActive}
                      onClick={() => {
                        if (isActive) {
                          handleTogglePlay(track);
                        } else {
                          scrollToCD(idx);
                        }
                      }}
                      onPlayToggle={() => handleTogglePlay(track)}
                    />
                  </div>

                  {/* Bottom Album Title */}
                  <div className="mt-3 text-center max-w-[240px]">
                    <p className={`font-display text-sm sm:text-base font-bold truncate transition-colors ${
                      isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                    }`}>
                      {track.title}
                    </p>
                    <span className={`font-code text-[10px] uppercase transition-colors ${
                      isActive ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]/70'
                    }`}>
                      {isActive ? (currentTrackId === track.id && isPlaying ? 'PLAYING NOW' : 'FOCUSED') : 'CLICK TO VIEW'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left & Right subtle edge gradients */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[var(--bg-main)] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[var(--bg-main)] to-transparent pointer-events-none z-10" />
        </div>

        {/* 3. Bottom Console: Active Song Details & Waveform Player */}
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTrack && (
              <motion.div
                key={`portfolio-console-${activeTrack.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: premiumEase }}
                className="w-full"
              >
                <SpecularCard
                  borderRadius="16px"
                  spotlightColor="rgba(21, 188, 223, 0.16)"
                  className="bg-[var(--card-bg)] backdrop-blur-md p-4 sm:p-5 border border-[var(--card-border)] space-y-3 shadow-xl"
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-xs font-bold text-[var(--text-main)] px-2 py-0.5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40">
                        CD {(activeIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="font-code text-xs text-[var(--text-main)] uppercase font-bold tracking-wider">
                        {activeTrack.genre}
                      </span>
                      <span className="text-[var(--text-muted)]/40">•</span>
                      <span className="font-code text-xs text-[var(--text-muted)]">
                        {activeTrack.scaleKey || 'Original Key'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-code text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{formatTime(activeTrack.duration || 54)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Main Content & Action Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-center">
                    <div className="sm:col-span-8 space-y-1.5">
                      <h3 className="font-display font-black text-xl sm:text-2xl text-[var(--text-main)] leading-tight tracking-tight">
                        {activeTrack.title}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">
                        "{activeTrack.clientStory || activeTrack.description}"
                      </p>
                      {activeTrack.tags && activeTrack.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {activeTrack.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="font-code text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-main)]/80 text-[var(--text-main)] border border-[var(--card-border)] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Play & Navigation Actions */}
                    <div className="sm:col-span-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <Magnetic strength={0.15} className="w-full">
                        <button
                          id={`play-btn-${activeTrack.id}`}
                          type="button"
                          onClick={() => handleTogglePlay(activeTrack)}
                          className="w-full font-body text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#171A1C] hover:bg-[var(--accent-hover)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
                        >
                          {currentTrackId === activeTrack.id && isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span>PAUSE SONG</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              <span>PLAY SONG</span>
                            </>
                          )}
                        </button>
                      </Magnetic>
                    </div>
                  </div>

                  {/* Built-in Interactive Waveform Scrubber */}
                  <div className="pt-2 border-t border-[var(--card-border)]">
                    <div className="flex items-center justify-between font-code text-[10px] text-[var(--text-muted)] mb-1">
                      <div className="flex items-center gap-1 text-[var(--accent)] font-bold">
                        <Activity className={`w-3 h-3 ${currentTrackId === activeTrack.id && isPlaying ? 'animate-pulse' : ''}`} />
                        <span>STUDIO WAVEFORM</span>
                      </div>
                      <span className="font-semibold">
                        {currentTrackId === activeTrack.id
                          ? `${formatTime(currentTime)} / ${formatTime(duration || activeTrack.duration || 54)}`
                          : `0:00 / ${formatTime(activeTrack.duration || 54)}`}
                      </span>
                    </div>

                    <VisualWaveform
                      track={activeTrack}
                      currentTime={currentTrackId === activeTrack.id ? currentTime : 0}
                      duration={currentTrackId === activeTrack.id ? duration : (activeTrack.duration || 54)}
                      isPlaying={currentTrackId === activeTrack.id && isPlaying}
                      onSeek={(secs) => {
                        if (currentTrackId !== activeTrack.id) {
                          onPlayTrack(activeTrack);
                        }
                        onSeek(secs);
                      }}
                      height={22}
                      barCount={typeof window !== 'undefined' && window.innerWidth < 640 ? 36 : 56}
                      showTimeHover={false}
                    />
                  </div>
                </SpecularCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Bottom Footer Link & Section Completion Cue */}
        <div className="flex items-center justify-between font-code text-xs text-[var(--text-muted)] px-2 pt-2 border-t border-[var(--card-border)]">
          <span className="hidden sm:inline font-semibold">
            CUSTOM PRODUCTION READY • UNLIMITED REVISIONS
          </span>

          <a
            href="#pricing"
            className="text-[var(--text-main)] hover:text-[var(--accent)] font-bold inline-flex items-center gap-1 transition-colors group cursor-pointer ml-auto"
          >
            <span>CONTINUE TO PRICING</span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};
