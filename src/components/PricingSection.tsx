import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PricingTier, PricingContent } from '../types';
import { EditableText } from './EditableText';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';
import { SpecularCard, Magnetic } from './InteractiveEffects';

interface PricingSectionProps {
  pricingTiers: PricingTier[];
  content: PricingContent;
  isEditMode?: boolean;
  onUpdateContent: (updated: Partial<PricingContent>) => void;
  onSelectPackage: (packageName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  pricingTiers,
  content,
  isEditMode = false,
  onUpdateContent,
  onSelectPackage,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="pricing"
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
            id="pricing-heading"
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

        {/* Pricing Cards Grid: Staggered Sequential Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier, idx) => {
            const isRecommended = tier.recommended || tier.name.toUpperCase() === 'STANDARD';
            const cardDelay = 0.3 + idx * 0.15; // 0.30s (Basic), 0.45s (Standard), 0.60s (Premium)

            return (
              <motion.div
                key={tier.id}
                id={`pricing-card-${tier.id}`}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={{ duration: 0.85, delay: cardDelay, ease: premiumEase }}
                className={`flex flex-col h-full ${isRecommended ? 'md:-translate-y-2' : ''}`}
              >
                <SpecularCard
                  borderRadius="24px"
                  borderColor={isRecommended ? 'var(--accent)' : 'var(--card-border)'}
                  spotlightColor={isRecommended ? 'rgba(21, 188, 223, 0.22)' : 'rgba(21, 188, 223, 0.1)'}
                  className={`p-8 sm:p-9 flex flex-col justify-between h-full transition-all duration-300 relative shadow-xs ${
                    isRecommended
                      ? 'bg-[var(--card-bg)] border-2 border-[var(--accent)] shadow-xl'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent)]/50 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-6">
                    {/* Top Bar: Name and Optional Tag */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-xl text-[var(--text-main)] tracking-wide uppercase">
                        {tier.name}
                      </h3>
                      {tier.tag && (
                        <span className={`font-code text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isRecommended 
                            ? 'bg-[var(--accent)] text-[#090A0C]' 
                            : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        }`}>
                          {tier.tag}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="pt-1">
                      <span className="font-display font-black text-4xl sm:text-5xl text-[var(--text-main)] tracking-tight">
                        {tier.price}
                      </span>
                      <span className="font-body text-xs text-[var(--text-muted)] ml-2">
                        / complete song
                      </span>
                    </div>

                    {/* Turnaround & Revision Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--card-border)]">
                      <span className="font-code text-xs px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--text-main)] font-medium">
                        {tier.deliveryTime}
                      </span>
                      <span className="font-code text-xs px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--text-main)] font-medium">
                        {tier.revisions}
                      </span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3.5 pt-4">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span className="font-body text-xs sm:text-sm text-[var(--text-main)] leading-snug">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom CTA Button */}
                  <div className="pt-8">
                    <Magnetic strength={0.15} className="w-full">
                      <button
                        type="button"
                        id={`pricing-cta-${tier.id}`}
                        onClick={() => onSelectPackage(tier.name)}
                        className={`w-full py-4 rounded-full font-body font-bold text-xs sm:text-sm tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                          isRecommended
                            ? 'bg-[var(--accent)] text-[#090A0C] hover:bg-[var(--accent-hover)] active:scale-[0.98] shadow-md'
                            : 'bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--accent)] hover:text-[#090A0C] active:scale-[0.98]'
                        }`}
                      >
                        <span>{tier.ctaText || `START ${tier.name}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Magnetic>
                  </div>
                </SpecularCard>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance Banner */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.8, delay: 0.75, ease: premiumEase }}
          className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <EditableText
              value={content.reassuranceText}
              onSave={(val) => onUpdateContent({ reassuranceText: val })}
              isEditingGlobal={isEditMode}
              multiline
              className="font-body text-xs sm:text-sm text-[var(--text-main)] block"
              as="p"
            />
          </div>
          <button
            type="button"
            onClick={() => onSelectPackage('Custom Brief')}
            className="font-body text-xs font-semibold text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
          >
            <EditableText
              value={content.customScopeLinkText}
              onSave={(val) => onUpdateContent({ customScopeLinkText: val })}
              isEditingGlobal={isEditMode}
              as="span"
            />
          </button>
        </motion.div>

      </div>
    </section>
  );
};
