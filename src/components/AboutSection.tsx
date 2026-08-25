import React from 'react';
import { Music, Heart, Clock, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { AboutContent } from '../types';
import { EditableText } from './EditableText';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';
import { SpecularCard, AudioReactiveSection, KineticBadge, AcousticWaveDivider } from './InteractiveEffects';

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
    <AudioReactiveSection
      id="about"
      isPlaying={isPlaying}
      className="py-24 bg-transparent border-t border-[var(--card-border)] z-10"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)'
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        
        {/* Editorial 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Studio Marker */}
          <div className="lg:col-span-5 space-y-4">
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
          </div>

          {/* Right Column: Editorial Mission Description & Pillars */}
          <div className="lg:col-span-7 space-y-10">
            {/* 400ms: Large descriptive paragraph */}
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

            {/* Studio Values / Distinction Grid: Staggered feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {/* 550ms: First feature card */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.55, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <SpecularCard
                  borderRadius="16px"
                  spotlightColor="rgba(21, 188, 223, 0.12)"
                  className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 transition-all hover:border-[var(--accent)]/40 shadow-xs h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                    <Heart className="w-5 h-5" />
                  </div>
                  <EditableText
                    value={content.pillar1.title}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar1: { ...content.pillar1, title: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    className="font-display font-bold text-base text-[var(--text-main)] block"
                    as="h3"
                  />
                  <EditableText
                    value={content.pillar1.description}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar1: { ...content.pillar1, description: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    multiline
                    className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed block"
                    as="p"
                  />
                </SpecularCard>
              </motion.div>

              {/* 700ms: Second feature card */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.7, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <SpecularCard
                  borderRadius="16px"
                  spotlightColor="rgba(21, 188, 223, 0.12)"
                  className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 transition-all hover:border-[var(--accent)]/40 shadow-xs h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                    <Music className="w-5 h-5" />
                  </div>
                  <EditableText
                    value={content.pillar2.title}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar2: { ...content.pillar2, title: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    className="font-display font-bold text-base text-[var(--text-main)] block"
                    as="h3"
                  />
                  <EditableText
                    value={content.pillar2.description}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar2: { ...content.pillar2, description: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    multiline
                    className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed block"
                    as="p"
                  />
                </SpecularCard>
              </motion.div>

              {/* 850ms: Third feature card */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 0.85, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <SpecularCard
                  borderRadius="16px"
                  spotlightColor="rgba(21, 188, 223, 0.12)"
                  className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 transition-all hover:border-[var(--accent)]/40 shadow-xs h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                    <Award className="w-5 h-5" />
                  </div>
                  <EditableText
                    value={content.pillar3.title}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar3: { ...content.pillar3, title: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    className="font-display font-bold text-base text-[var(--text-main)] block"
                    as="h3"
                  />
                  <EditableText
                    value={content.pillar3.description}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar3: { ...content.pillar3, description: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    multiline
                    className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed block"
                    as="p"
                  />
                </SpecularCard>
              </motion.div>

              {/* 1000ms: Fourth feature card */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.8, delay: 1.0, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <SpecularCard
                  borderRadius="16px"
                  spotlightColor="rgba(21, 188, 223, 0.12)"
                  className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 transition-all hover:border-[var(--accent)]/40 shadow-xs h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <EditableText
                    value={content.pillar4.title}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar4: { ...content.pillar4, title: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    className="font-display font-bold text-base text-[var(--text-main)] block"
                    as="h3"
                  />
                  <EditableText
                    value={content.pillar4.description}
                    onSave={(val) =>
                      onUpdateContent({
                        pillar4: { ...content.pillar4, description: val }
                      })
                    }
                    isEditingGlobal={isEditMode}
                    multiline
                    className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed block"
                    as="p"
                  />
                </SpecularCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AudioReactiveSection>
  );
};
