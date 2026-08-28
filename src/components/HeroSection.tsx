import React, { useState, useRef } from 'react';
import { ArrowRight, Video, Sliders, UploadCloud, Eye, Repeat, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MelofyHeroStoryVisual } from './MelofyHeroStoryVisual';
import { Track, HeroContent, SiteBrandConfig } from '../types';
import { EditableText } from './EditableText';
import { premiumEase } from '../utils/motionTransitions';
import { Magnetic, KineticBadge, EqualizerMicroBars } from './InteractiveEffects';
import { optimizeImageFile } from '../utils/mediaStorage';
import { ParallaxSection, ParallaxLayer, ParallaxFloatingAura } from './ParallaxContainer';
import { RapidCounterStat } from './RapidCounterStat';

interface HeroSectionProps {
  isPlaying: boolean;
  featuredTrack?: Track;
  content: HeroContent;
  brandConfig?: SiteBrandConfig;
  isEditMode?: boolean;
  isAdminMode?: boolean;
  onUpdateContent: (updated: Partial<HeroContent>) => void;
  onUpdateBrandConfig?: (updated: Partial<SiteBrandConfig>) => void;
  onPlayFeaturedTrack: () => void;
  onScrollTo: (selector: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isPlaying,
  content,
  brandConfig,
  isEditMode = false,
  isAdminMode = false,
  onUpdateContent,
  onUpdateBrandConfig,
  onScrollTo
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [showVideoAdminPanel, setShowVideoAdminPanel] = useState(false);
  const heroVideoFileRef = useRef<HTMLInputElement | null>(null);

  const handleStartSong = () => {
    onScrollTo('#contact');
    setTimeout(() => {
      const input = document.getElementById('client-name');
      if (input) input.focus();
    }, 400);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedUrl = await optimizeImageFile(file);
      onUpdateContent({
        enableBackgroundVideo: true,
        backgroundVideoUrl: optimizedUrl
      });
    } catch (err) {
      console.error('Failed to upload hero background video', err);
    }
  };

  return (
    <ParallaxSection
      id="hero"
      offset={['start start', 'end start']}
      className="min-h-[100svh] flex items-center justify-center overflow-hidden bg-transparent pt-24 pb-16 z-10"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)'
      }}
    >
      {/* Parallax Ambient Aura Halos */}
      <ParallaxFloatingAura
        color="var(--accent)"
        size={420}
        top="-10%"
        left="5%"
        speed={0.4}
        yRange={[0, 90]}
        opacity={0.12}
      />
      <ParallaxFloatingAura
        color="#F43F5E"
        size={380}
        top="40%"
        right="5%"
        speed={0.6}
        yRange={[0, 110]}
        opacity={0.08}
      />

      {/* Quick Hero Video Floating Admin Toolbar when in Admin Mode */}
      {isAdminMode && (
        <div className="absolute top-20 right-6 z-30">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVideoAdminPanel(!showVideoAdminPanel)}
              className="px-3 py-1.5 rounded-full bg-[#171D25]/90 hover:bg-[#171D25] border border-white/20 hover:border-[var(--accent)] text-white text-xs font-code flex items-center gap-2 shadow-lg backdrop-blur-md transition-all cursor-pointer"
              title="Adjust Hero Video Background"
            >
              <Video className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Hero Video Controls</span>
              <span className={`w-2 h-2 rounded-full ${content.enableBackgroundVideo ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            </button>

            {showVideoAdminPanel && (
              <div className="absolute right-0 top-10 w-80 p-4 rounded-2xl bg-[#171D25] border border-white/15 shadow-2xl space-y-4 text-white z-40 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 font-display font-bold text-xs text-white">
                    <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Hero Video Adjustments</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVideoAdminPanel(false)}
                    className="text-xs text-[#9CA3AF] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-[#9CA3AF]">Background Video</span>
                  <button
                    type="button"
                    onClick={() => onUpdateContent({ enableBackgroundVideo: !content.enableBackgroundVideo })}
                    className={`px-3 py-1 rounded-full text-xs font-bold font-code transition-colors cursor-pointer ${
                      content.enableBackgroundVideo ? 'bg-[var(--accent)] text-[#171A1C]' : 'bg-white/10 text-white'
                    }`}
                  >
                    {content.enableBackgroundVideo ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Direct Upload Video */}
                <div className="space-y-1.5">
                  <label className="font-code text-[10px] text-[#9CA3AF] uppercase block">
                    Upload Background Video (MP4 / WebM)
                  </label>
                  <input
                    type="file"
                    ref={heroVideoFileRef}
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => heroVideoFileRef.current?.click()}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-body text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Upload Video File</span>
                    </button>
                  </div>
                </div>

                {/* Video URL */}
                <div className="space-y-1">
                  <label className="font-code text-[10px] text-[#9CA3AF] uppercase block">
                    Or Video URL
                  </label>
                  <input
                    type="text"
                    value={content.backgroundVideoUrl || ''}
                    onChange={(e) => onUpdateContent({ backgroundVideoUrl: e.target.value })}
                    placeholder="https://... (mp4)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#1B2129] border border-white/10 text-white text-xs font-code focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Transparency / Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-code text-[#9CA3AF]">
                    <span>Transparency / Opacity</span>
                    <span className="text-[var(--accent)]">{Math.round((content.backgroundVideoOpacity ?? 0.35) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={content.backgroundVideoOpacity ?? 0.35}
                    onChange={(e) => onUpdateContent({ backgroundVideoOpacity: Number(e.target.value) })}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Sizing / Fit / Fill */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-code text-[10px] text-[#9CA3AF] uppercase block mb-1">
                      Fit / Fill Mode
                    </label>
                    <select
                      value={content.backgroundVideoFit || 'cover'}
                      onChange={(e) => onUpdateContent({ backgroundVideoFit: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1B2129] border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="cover">Cover (Fill & Crop)</option>
                      <option value="contain">Contain (Fit Full)</option>
                      <option value="fill">Fill (Stretch)</option>
                      <option value="scale-down">Scale Down</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-code text-[10px] text-[#9CA3AF] uppercase block mb-1">
                      Overlay Tint
                    </label>
                    <select
                      value={content.backgroundVideoOverlayTint || 'vignette'}
                      onChange={(e) => onUpdateContent({ backgroundVideoOverlayTint: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#1B2129] border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="vignette">Studio Vignette</option>
                      <option value="gradient">Subtle Gradient</option>
                      <option value="dark">Obsidian Tint</option>
                      <option value="none">Clear</option>
                    </select>
                  </div>
                </div>

                {/* Loop Mode & Mute Mode */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onUpdateContent({ backgroundVideoLoop: content.backgroundVideoLoop === false })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-code flex items-center gap-1.5 cursor-pointer ${
                      content.backgroundVideoLoop !== false ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-white/5 text-[#9CA3AF]'
                    }`}
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Loop: {content.backgroundVideoLoop !== false ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateContent({ backgroundVideoMuted: content.backgroundVideoMuted === false })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-code flex items-center gap-1.5 cursor-pointer ${
                      content.backgroundVideoMuted !== false ? 'bg-white/10 text-white' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {content.backgroundVideoMuted !== false ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    <span>{content.backgroundVideoMuted !== false ? 'Muted' : 'Audio ON'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Bold Oversized Editorial Typography with Parallax Layer */}
        <ParallaxLayer
          yRange={[0, -28]}
          className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center z-10 space-y-7"
        >
          {/* Studio Tag / Category Indicator with Kinetic Badge & Micro Equalizer */}
          <KineticBadge isPlaying={isPlaying} delay={0.1}>
            <EqualizerMicroBars isPlaying={isPlaying} barCount={3} />
            <EditableText
              value={content.studioBadge}
              onSave={(val) => onUpdateContent({ studioBadge: val })}
              isEditingGlobal={isEditMode}
              className="font-code text-xs tracking-widest uppercase font-semibold"
              as="span"
            />
          </KineticBadge>

          {/* Main Headline with Sequential Kinetic Line-by-Line Reveal */}
          <h1
            id="hero-main-heading"
            className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.04] tracking-tight text-[var(--text-main)]"
          >
            <span className="overflow-hidden block">
              <motion.span
                initial={shouldReduceMotion ? false : { y: '110%', opacity: 0, rotate: 1 }}
                animate={{ y: '0%', opacity: 1, rotate: 0 }}
                transition={{ duration: 0.85, delay: 0.2, ease: premiumEase }}
                className="inline-block"
              >
                <EditableText
                  value={content.mainHeadingLine1}
                  onSave={(val) => onUpdateContent({ mainHeadingLine1: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
              </motion.span>
            </span>
            
            <span className="overflow-hidden block">
              <motion.span
                initial={shouldReduceMotion ? false : { y: '110%', opacity: 0, rotate: 1 }}
                animate={{ y: '0%', opacity: 1, rotate: 0 }}
                transition={{ duration: 0.85, delay: 0.35, ease: premiumEase }}
                className="inline-block"
              >
                <EditableText
                  value={content.mainHeadingLine2}
                  onSave={(val) => onUpdateContent({ mainHeadingLine2: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
              </motion.span>
            </span>

            <span className="overflow-hidden block">
              <motion.span
                initial={shouldReduceMotion ? false : { y: '110%', opacity: 0, rotate: 1 }}
                animate={{ y: '0%', opacity: 1, rotate: 0 }}
                transition={{ duration: 0.85, delay: 0.5, ease: premiumEase }}
                className="inline-block text-[var(--accent)]"
              >
                <EditableText
                  value={content.mainHeadingAccent}
                  onSave={(val) => onUpdateContent({ mainHeadingAccent: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
              </motion.span>
            </span>
          </h1>

          {/* Editorial Subtitle with Kinetic Unmasking */}
          <motion.div
            id="hero-subtitle"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: premiumEase }}
            className="max-w-xl"
          >
            <EditableText
              value={content.subtitle}
              onSave={(val) => onUpdateContent({ subtitle: val })}
              isEditingGlobal={isEditMode}
              multiline
              as="p"
              className="font-body text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-normal"
            />
          </motion.div>

          {/* CTA Group with Magnetic Pull */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: premiumEase }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            {/* Primary CTA */}
            <Magnetic strength={0.2}>
              <button
                id="hero-cta-listen-samples"
                type="button"
                onClick={() => onScrollTo('#portfolio')}
                className="font-body text-xs sm:text-sm font-bold tracking-wider px-7 py-3.5 rounded-full bg-[var(--accent)] text-[#090A0C] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-200 shadow-md inline-flex items-center gap-2.5 cursor-pointer"
              >
                <EditableText
                  value={content.primaryCtaText}
                  onSave={(val) => onUpdateContent({ primaryCtaText: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
                <ArrowRight className="w-4 h-4" />
              </button>
            </Magnetic>

            {/* Secondary CTA */}
            <Magnetic strength={0.2}>
              <button
                id="hero-cta-create-song"
                type="button"
                onClick={handleStartSong}
                className="font-body text-xs sm:text-sm font-bold tracking-wider px-7 py-3.5 rounded-full bg-transparent border border-[var(--text-main)]/30 text-[var(--text-main)] hover:border-[var(--text-main)] hover:bg-[var(--text-main)]/[0.06] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <EditableText
                  value={content.secondaryCtaText}
                  onSave={(val) => onUpdateContent({ secondaryCtaText: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
              </button>
            </Magnetic>
          </motion.div>

          {/* Quick Studio Credibility Ticker with Rapid Count-up and Flash */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: premiumEase }}
            className="pt-6 border-t border-[var(--text-main)]/10 flex items-center gap-6 sm:gap-8 flex-wrap"
          >
            <RapidCounterStat
              id="hero-stat-1"
              numberValue={content.stat1Number}
              labelValue={content.stat1Label}
              onSaveNumber={(val) => onUpdateContent({ stat1Number: val })}
              onSaveLabel={(val) => onUpdateContent({ stat1Label: val })}
              isEditingGlobal={isEditMode}
              delay={0.3}
              duration={1.2}
              soundVariant={0}
            />

            <div className="w-[1px] h-8 bg-[var(--text-main)]/15 shrink-0" />

            <RapidCounterStat
              id="hero-stat-2"
              numberValue={content.stat2Number}
              labelValue={content.stat2Label}
              onSaveNumber={(val) => onUpdateContent({ stat2Number: val })}
              onSaveLabel={(val) => onUpdateContent({ stat2Label: val })}
              isEditingGlobal={isEditMode}
              delay={0.5}
              duration={1.3}
              soundVariant={1}
            />

            {content.stat3Number && (
              <>
                <div className="w-[1px] h-8 bg-[var(--text-main)]/15 shrink-0" />
                <RapidCounterStat
                  id="hero-stat-3"
                  numberValue={content.stat3Number}
                  labelValue={content.stat3Label}
                  onSaveNumber={(val) => onUpdateContent({ stat3Number: val })}
                  onSaveLabel={(val) => onUpdateContent({ stat3Label: val })}
                  isEditingGlobal={isEditMode}
                  delay={0.7}
                  duration={1.2}
                  soundVariant={2}
                />
              </>
            )}
          </motion.div>
        </ParallaxLayer>

        {/* Right Column: Live Interactive Line-Art Couple in Revolving 3D Musical Orb with Parallax Depth */}
        <ParallaxLayer
          yRange={[0, 36]}
          className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center justify-center z-10"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.4, ease: premiumEase }}
            className="w-full relative flex items-center justify-center"
          >
            <MelofyHeroStoryVisual
              isPlaying={isPlaying}
              brandConfig={brandConfig}
              isAdminMode={isAdminMode}
              onUpdateBrandConfig={onUpdateBrandConfig}
            />
          </motion.div>
        </ParallaxLayer>

      </div>
    </ParallaxSection>
  );
};

