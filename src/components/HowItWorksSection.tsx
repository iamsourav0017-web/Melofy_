import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { HowItWorksContent } from '../types';
import { EditableText } from './EditableText';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';
import { SpecularCard, Magnetic } from './InteractiveEffects';

interface HowItWorksSectionProps {
  content: HowItWorksContent;
  isEditMode?: boolean;
  onUpdateContent: (updated: Partial<HowItWorksContent>) => void;
  onStartSong: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  content,
  isEditMode = false,
  onUpdateContent,
  onStartSong
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="relative w-full py-24 bg-transparent border-t border-[var(--card-border)] z-10"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)'
      }}
    >
      <div className="max-w-[1440px] mx-auto space-y-14">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.7, delay: 0, ease: premiumEase }}
            className="flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <EditableText
              value={content.badge}
              onSave={(val) => onUpdateContent({ badge: val })}
              isEditingGlobal={isEditMode}
              className="font-code text-xs tracking-widest text-[var(--text-muted)] uppercase font-semibold"
              as="span"
            />
          </motion.div>

          {/* Heading */}
          <motion.h2
            id="how-it-works-heading"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, delay: 0.05, ease: premiumEase }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-[1.05] tracking-tight"
          >
            <EditableText
              value={content.headingLine1}
              onSave={(val) => onUpdateContent({ headingLine1: val })}
              isEditingGlobal={isEditMode}
              as="span"
            />
            <br />
            <EditableText
              value={content.headingAccent}
              onSave={(val) => onUpdateContent({ headingAccent: val })}
              isEditingGlobal={isEditMode}
              className="text-[var(--accent)]"
              as="span"
            />
          </motion.h2>

          {/* Subtitle */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, delay: 0.15, ease: premiumEase }}
          >
            <EditableText
              value={content.subtitle}
              onSave={(val) => onUpdateContent({ subtitle: val })}
              isEditingGlobal={isEditMode}
              multiline
              className="font-body text-base sm:text-lg text-[var(--text-muted)] block"
              as="p"
            />
          </motion.div>
        </div>

        {/* 4-Step Process Grid: Sequential Guided Journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.steps.map((step, idx) => {
            const stepDelay = 0.25 + idx * 0.15; // 0.25s, 0.40s, 0.55s, 0.70s

            return (
              <motion.div
                key={step.number}
                id={`step-card-${step.number}`}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={{ duration: 0.85, delay: stepDelay, ease: premiumEase }}
                className="flex flex-col h-full"
              >
                <SpecularCard
                  borderRadius="24px"
                  spotlightColor="rgba(21, 188, 223, 0.15)"
                  className="p-7 bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between space-y-6 hover:border-[var(--accent)]/50 hover:shadow-md transition-all duration-300 group shadow-xs h-full"
                >
                  <div className="space-y-4">
                    {/* Large Distinct Number */}
                    <div className="flex items-center justify-between">
                      <span className="font-display font-extrabold text-4xl sm:text-5xl text-[var(--text-muted)] opacity-40 group-hover:text-[var(--accent)] group-hover:opacity-100 transition-all">
                        {step.number}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <EditableText
                      value={step.title}
                      onSave={(val) => {
                        const newSteps = [...content.steps];
                        newSteps[idx].title = val;
                        onUpdateContent({ steps: newSteps });
                      }}
                      isEditingGlobal={isEditMode}
                      className="font-display font-bold text-lg text-[var(--text-main)] tracking-wide block"
                      as="h3"
                    />

                    <EditableText
                      value={step.description}
                      onSave={(val) => {
                        const newSteps = [...content.steps];
                        newSteps[idx].description = val;
                        onUpdateContent({ steps: newSteps });
                      }}
                      isEditingGlobal={isEditMode}
                      multiline
                      className="font-body text-xs sm:text-sm text-[var(--text-main)] font-medium leading-relaxed block"
                      as="p"
                    />
                  </div>

                  <div className="pt-4 border-t border-[var(--card-border)]">
                    <EditableText
                      value={step.detail}
                      onSave={(val) => {
                        const newSteps = [...content.steps];
                        newSteps[idx].detail = val;
                        onUpdateContent({ steps: newSteps });
                      }}
                      isEditingGlobal={isEditMode}
                      multiline
                      className="font-body text-xs text-[var(--text-muted)] leading-relaxed block"
                      as="p"
                    />
                  </div>
                </SpecularCard>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.8, delay: 0.85, ease: premiumEase }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md"
        >
          <div className="space-y-1 text-center sm:text-left">
            <EditableText
              value={content.ctaBannerTitle}
              onSave={(val) => onUpdateContent({ ctaBannerTitle: val })}
              isEditingGlobal={isEditMode}
              className="font-display font-bold text-xl sm:text-2xl text-[var(--text-main)] block"
              as="h4"
            />
            <EditableText
              value={content.ctaBannerSubtitle}
              onSave={(val) => onUpdateContent({ ctaBannerSubtitle: val })}
              isEditingGlobal={isEditMode}
              className="font-body text-xs sm:text-sm text-[var(--text-muted)] block"
              as="p"
            />
          </div>

          <Magnetic strength={0.2}>
            <button
              type="button"
              onClick={onStartSong}
              className="font-body text-xs sm:text-sm font-bold tracking-wider px-8 py-3.5 rounded-full bg-[var(--accent)] text-[#090A0C] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-200 shadow-sm inline-flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <EditableText
                value={content.ctaButtonText}
                onSave={(val) => onUpdateContent({ ctaButtonText: val })}
                isEditingGlobal={isEditMode}
                as="span"
              />
              <ArrowRight className="w-4 h-4" />
            </button>
          </Magnetic>
        </motion.div>

      </div>
    </section>
  );
};
