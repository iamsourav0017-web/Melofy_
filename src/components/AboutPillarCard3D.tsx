import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { Heart, Music, Award, Clock, Sparkles, Volume2, CheckCircle2, Waves, Radio } from 'lucide-react';
import { AboutValuePillar } from '../types';
import { EditableText } from './EditableText';
import { studioAudio } from '../utils/audioEngine';

interface AboutPillarCard3DProps {
  pillar: AboutValuePillar;
  index: number;
  isEditMode?: boolean;
  isPlaying?: boolean;
  onUpdate: (updated: Partial<AboutValuePillar>) => void;
}

export const AboutPillarCard3D: React.FC<AboutPillarCard3DProps> = ({
  pillar,
  index,
  isEditMode = false,
  isPlaying = false,
  onUpdate
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<number>(0);
  const [soundPulseActive, setSoundPulseActive] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Mouse coordinate motion values for 3D tilt calculation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for natural tactile 3D perspective tilt
  const springConfig = { damping: 20, stiffness: 260, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const scale = useSpring(isHovered ? 1.025 : 1, springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Play subtle harmonic spatial chime on hover
    studioAudio.playPillarChime(index);
    setSoundPulseActive(true);
    setTimeout(() => setSoundPulseActive(false), 600);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleInteractiveClick = () => {
    studioAudio.playPillarChime(index);
    setSoundPulseActive(true);
    setTimeout(() => setSoundPulseActive(false), 500);
  };

  // Icons configuration for each pillar index
  const pillarIcons = [
    <Heart key="heart" className="w-6 h-6 text-rose-400" />,
    <Music key="music" className="w-6 h-6 text-sky-400" />,
    <Award key="award" className="w-6 h-6 text-amber-400" />,
    <Clock key="clock" className="w-6 h-6 text-emerald-400" />
  ];

  const pillarGradients = [
    'from-rose-500/20 via-pink-500/5 to-transparent',
    'from-cyan-500/20 via-blue-500/5 to-transparent',
    'from-amber-500/20 via-orange-500/5 to-transparent',
    'from-emerald-500/20 via-teal-500/5 to-transparent'
  ];

  const pillarAccentBorders = [
    'hover:border-rose-500/50',
    'hover:border-cyan-500/50',
    'hover:border-amber-500/50',
    'hover:border-emerald-500/50'
  ];

  const pillarIconBg = [
    'bg-rose-500/15 border-rose-500/30 text-rose-400',
    'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    'bg-amber-500/15 border-amber-500/30 text-amber-400',
    'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
  ];

  return (
    <div
      style={{ perspective: 1200 }}
      className="h-full w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInteractiveClick}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          scale: shouldReduceMotion ? 1 : scale,
          transformStyle: 'preserve-3d'
        }}
        className={`relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] ${pillarAccentBorders[index % 4]} transition-colors duration-300 shadow-md group cursor-pointer overflow-hidden backdrop-blur-md`}
      >
        {/* Dynamic Holographic Specular Glare Layer */}
        {!shouldReduceMotion && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-30 opacity-40 mix-blend-screen"
            style={{
              background: `radial-gradient(circle 260px at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, 0.25), transparent 70%)`
            }}
          />
        )}

        {/* Ambient Gradient Glow Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${pillarGradients[index % 4]} opacity-30 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none z-0`}
        />

        {/* Dynamic Floating 3D Depth Layer */}
        <div className="relative z-10 space-y-4" style={{ transform: 'translateZ(25px)' }}>
          {/* Header Row: Icon + Sound Pulse Indicator */}
          <div className="flex items-center justify-between">
            {/* 3D Elevated Icon Badge */}
            <div className="relative">
              {/* Outer pulsing acoustic ring */}
              {(isHovered || isPlaying || soundPulseActive) && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute -inset-1.5 rounded-2xl border ${pillarIconBg[index % 4]} opacity-40`}
                />
              )}
              
              <div
                style={{ transform: isHovered ? 'translateZ(35px) scale(1.08)' : 'translateZ(0px)' }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-300 ${pillarIconBg[index % 4]}`}
              >
                {pillarIcons[index % 4]}
              </div>
            </div>

            {/* Interactive Audio Signal Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-code text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:border-[var(--accent)]/40 transition-colors">
              <Volume2 className={`w-3 h-3 ${isHovered || soundPulseActive ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--text-muted)]'}`} />
              <span>{isHovered ? 'Acoustic Tone' : 'Hover 3D'}</span>
            </div>
          </div>

          {/* Title with 3D Elevation */}
          <div style={{ transform: 'translateZ(30px)' }}>
            <EditableText
              value={pillar.title}
              onSave={(val) => onUpdate({ title: val })}
              isEditingGlobal={isEditMode}
              className="font-display font-bold text-lg sm:text-xl text-[var(--text-main)] block tracking-tight group-hover:text-[var(--accent)] transition-colors"
              as="h3"
            />
          </div>

          {/* Description */}
          <div style={{ transform: 'translateZ(18px)' }}>
            <EditableText
              value={pillar.description}
              onSave={(val) => onUpdate({ description: val })}
              isEditingGlobal={isEditMode}
              multiline
              className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed block font-light"
              as="p"
            />
          </div>
        </div>

        {/* 3D Micro-Visualizer / Interactive Animated Module (Unique to each pillar) */}
        <div
          style={{ transform: 'translateZ(35px)' }}
          className="mt-6 pt-4 border-t border-white/10 relative z-20"
        >
          {/* PILLAR 1: Purely Story-Driven -> Dynamic Story Resonance Tags */}
          {index === 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-code text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  <span>Story Elements</span>
                </span>
                <span className="text-[10px] text-rose-400/90 font-semibold">100% Bespoke</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['First Date', 'Private Vows', 'Nicknames', 'Inside Jokes'].map((tag, tIdx) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInteractiveTab(tIdx);
                      studioAudio.playPillarChime(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-body transition-all duration-200 cursor-pointer ${
                      activeInteractiveTab === tIdx
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-[var(--text-muted)] border border-white/5'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 2: Any Genre & Language -> Interactive Genre Chips & Floating Notes */}
          {index === 1 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-code text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Waves className="w-3 h-3 text-sky-400" />
                  <span>Genre Explorer</span>
                </span>
                <span className="text-[10px] text-sky-400/90 font-semibold">Any Language</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Bollywood', 'Acoustic Pop', 'R&B / Soul', 'Sufi Folk'].map((genre, gIdx) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInteractiveTab(gIdx);
                      studioAudio.playPillarChime(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-body transition-all duration-200 cursor-pointer ${
                      activeInteractiveTab === gIdx
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-[var(--text-muted)] border border-white/5'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 3: Studio-Grade Master -> Real-Time Animated EQ Spectrum & Specs */}
          {index === 2 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-code text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>Analog Mastering EQ</span>
                </span>
                <span className="text-[10px] text-amber-400/90 font-semibold">24-Bit / 96kHz</span>
              </div>

              {/* Animated Master Frequency Bars */}
              <div className="h-6 w-full flex items-end gap-1.5 px-2 py-1 bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                {[45, 80, 60, 95, 70, 85, 55, 90, 65, 100, 75, 50].map((height, bIdx) => (
                  <motion.div
                    key={bIdx}
                    animate={
                      isHovered || isPlaying
                        ? { height: [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`] }
                        : { height: `${height * 0.4}%` }
                    }
                    transition={{
                      duration: 0.6 + (bIdx % 4) * 0.15,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      delay: bIdx * 0.05
                    }}
                    className="flex-1 rounded-t-xs bg-gradient-to-t from-amber-500/60 to-amber-300"
                  />
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 4: Guaranteed 3-Day Delivery -> 3D Timeline Phase Progress */}
          {index === 3 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-code text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>72h Studio Pipeline</span>
                </span>
                <span className="text-[10px] text-emerald-400/90 font-semibold">Express Timeline</span>
              </div>

              {/* 3-Step Milestone Indicator */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-code">
                {[
                  { day: 'Day 1', label: 'Lyrics & Chords' },
                  { day: 'Day 2', label: 'Vocals & Stems' },
                  { day: 'Day 3', label: 'Final Master' }
                ].map((step, sIdx) => (
                  <div
                    key={step.day}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      isHovered
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/5 text-[var(--text-muted)]'
                    }`}
                  >
                    <div className="font-bold">{step.day}</div>
                    <div className="text-[9px] truncate opacity-80">{step.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
