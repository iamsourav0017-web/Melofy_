import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AboutContent } from '../types';
import { EditableText } from './EditableText';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';
import { AudioReactiveSection, KineticBadge } from './InteractiveEffects';
import { AboutPillarCard3D } from './AboutPillarCard3D';
import { ParallaxSection, ParallaxLayer, ParallaxFloatingAura } from './ParallaxContainer';

interface AboutSectionProps {
  content: AboutContent;
  isEditMode?: boolean;
  isPlaying?: boolean;
  onUpdateContent: (updated: Partial<AboutContent>) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  content,
  isEditMode = false,
  isPlaying = false,
  onUpdateContent
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ParallaxSection
      id="about"
      className="relative py-24 bg-transparent border-t border-[var(--card-border)] z-10 overflow-hidden"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)'
      }}
    >
      {/* 3D Ambient Musical Wave & Particle Background Depth Layer with Parallax */}
      <ParallaxFloatingAura
        color="var(--accent)"
        size={400}
        top="10%"
        left="-5%"
        speed={0.6}
        yRange={[80, -80]}
        opacity={0.12}
      />
      <ParallaxFloatingAura
        color="#F43F5E"
        size={360}
        bottom="5%"
        right="-5%"
        speed={0.8}
        yRange={[100, -100]}
        opacity={0.08}
      />

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Editorial 2-Column Layout with Parallax Depth */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Studio Marker with Steady Parallax Anchorage */}
          <ParallaxLayer
            yRange={[20, -20]}
            className="lg:col-span-5 space-y-4"
          >
            {/* Studio badge with kinetic pulse */}
            <KineticBadge isPlaying={isPlaying} delay={0}>
              <EditableText
                value={content.badge || 'ABOUT MELOFY'}
                onSave={(val) => onUpdateContent({ badge: val })}
                isEditingGlobal={isEditMode}
                className="font-code text-xs tracking-widest uppercase font-semibold text-[var(--accent)]"
                as="span"
              />
            </KineticBadge>

            {/* ABOUT / MELOFY Heading */}
            <h2
              id="about-heading"
              className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-[1.08] tracking-tight space-y-1"
            >
              <motion.span
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.7, delay: 0.1, ease: premiumEase }}
                className="block"
              >
                <EditableText
                  value={content.headingLine1 || 'ABOUT OUR STUDIO,'}
                  onSave={(val) => onUpdateContent({ headingLine1: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
              </motion.span>
              <motion.span
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.7, delay: 0.22, ease: premiumEase }}
                className="block text-[var(--accent)]"
              >
                <EditableText
                  value={content.headingAccent || 'MUSIC FOR YOUR STORY.'}
                  onSave={(val) => onUpdateContent({ headingAccent: val })}
                  isEditingGlobal={isEditMode}
                  as="span"
                />
              </motion.span>
            </h2>
            
            {/* Left supporting text */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.75, delay: 0.3, ease: premiumEase }}
            >
              <EditableText
                value={content.tagline || 'Every memory has a frequency. We craft the chords, lyrics, and arrangements that immortalize yours.'}
                onSave={(val) => onUpdateContent({ tagline: val })}
                isEditingGlobal={isEditMode}
                multiline
                className="font-body text-sm text-[var(--text-muted)] max-w-sm pt-2 block leading-relaxed"
                as="p"
              />
            </motion.div>

            {/* Interactive 3D Guide Callout */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.75, delay: 0.45, ease: premiumEase }}
              className="pt-4 hidden lg:block"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--card-border)] text-xs font-code text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span>Move cursor over cards to explore in 3D & sound</span>
              </div>
            </motion.div>
          </ParallaxLayer>

          {/* Right Column: Editorial Mission Description & 3D Interactive Pillars with Elevation Parallax */}
          <ParallaxLayer
            yRange={[40, -40]}
            className="lg:col-span-7 space-y-8"
          >
            {/* Large descriptive paragraph */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.85, delay: 0.4, ease: premiumEase }}
            >
              <EditableText
                value={content.mainParagraph}
                onSave={(val) => onUpdateContent({ mainParagraph: val })}
                isEditingGlobal={isEditMode}
                multiline
                className="font-body text-lg sm:text-xl md:text-2xl text-[var(--text-main)] leading-relaxed font-normal block"
                as="p"
              />
            </motion.div>

            {/* Studio Values / Distinction Grid: 4 Interactive 3D Animated Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Pillar 1: Purely Story-Driven */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.5, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <AboutPillarCard3D
                  pillar={content.pillar1}
                  index={0}
                  isEditMode={isEditMode}
                  isPlaying={isPlaying}
                  onUpdate={(updated) =>
                    onUpdateContent({
                      pillar1: { ...content.pillar1, ...updated }
                    })
                  }
                />
              </motion.div>

              {/* Pillar 2: Any Genre & Language */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.65, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <AboutPillarCard3D
                  pillar={content.pillar2}
                  index={1}
                  isEditMode={isEditMode}
                  isPlaying={isPlaying}
                  onUpdate={(updated) =>
                    onUpdateContent({
                      pillar2: { ...content.pillar2, ...updated }
                    })
                  }
                />
              </motion.div>

              {/* Pillar 3: Studio-Grade Master */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.8, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <AboutPillarCard3D
                  pillar={content.pillar3}
                  index={2}
                  isEditMode={isEditMode}
                  isPlaying={isPlaying}
                  onUpdate={(updated) =>
                    onUpdateContent({
                      pillar3: { ...content.pillar3, ...updated }
                    })
                  }
                />
              </motion.div>

              {/* Pillar 4: Guaranteed 3-Day Delivery */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.95, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <AboutPillarCard3D
                  pillar={content.pillar4}
                  index={3}
                  isEditMode={isEditMode}
                  isPlaying={isPlaying}
                  onUpdate={(updated) =>
                    onUpdateContent({
                      pillar4: { ...content.pillar4, ...updated }
                    })
                  }
                />
              </motion.div>
            </div>
          </ParallaxLayer>
        </div>
      </div>
    </ParallaxSection>
  );
};
