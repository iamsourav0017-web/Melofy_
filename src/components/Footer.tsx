import React from 'react';
import { Music2, ArrowUp, Lock, Sliders } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FooterContent } from '../types';
import { EditableText } from './EditableText';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';

interface FooterProps {
  content: FooterContent;
  isEditMode?: boolean;
  onUpdateContent: (updated: Partial<FooterContent>) => void;
  onOpenAdmin: (tab?: 'writings' | 'theme' | 'tracks' | 'pricing' | 'inquiries') => void;
  onScrollTo: (selector: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  content,
  isEditMode = false,
  onUpdateContent,
  onOpenAdmin,
  onScrollTo
}) => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="footer"
      className="relative w-full bg-transparent text-[var(--text-main)] pt-20 pb-28 border-t border-[var(--card-border)] z-10"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)'
      }}
    >
      <div className="max-w-[1440px] mx-auto space-y-16">
        
        {/* Main Footer Top Grid: Sequential Column Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Brand Column */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, delay: 0, ease: premiumEase }}
            className="md:col-span-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <span className="font-display font-black text-2xl tracking-widest text-[var(--text-main)]">
                MELOFY
              </span>
            </div>

            <EditableText
              value={content.tagline}
              onSave={(val) => onUpdateContent({ tagline: val })}
              isEditingGlobal={isEditMode}
              className="font-code text-xs text-[var(--accent)] tracking-wider uppercase block"
              as="p"
            />

            <EditableText
              value={content.description}
              onSave={(val) => onUpdateContent({ description: val })}
              isEditingGlobal={isEditMode}
              multiline
              className="font-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm block"
              as="p"
            />
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, delay: 0.15, ease: premiumEase }}
            className="md:col-span-3 space-y-3"
          >
            <p className="font-display font-bold text-xs tracking-wider uppercase text-[var(--text-muted)]">
              EXPLORE
            </p>
            <ul className="space-y-2 text-xs font-body">
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('#portfolio')}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Audio Catalogue
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('#about')}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Studio Philosophy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('#how-it-works')}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Composition Pipeline
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('#pricing')}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Pricing & Deliverables
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('#contact')}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Start Your Song
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Studio Contact & Back to Top */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, delay: 0.3, ease: premiumEase }}
            className="md:col-span-4 space-y-4"
          >
            <p className="font-display font-bold text-xs tracking-wider uppercase text-[var(--text-muted)]">
              CONNECT
            </p>
            <p className="font-body text-xs text-[var(--text-muted)]">
              Have questions or want a bespoke orchestral arrangement?
            </p>
            <EditableText
              value={content.directEmail}
              onSave={(val) => onUpdateContent({ directEmail: val })}
              isEditingGlobal={isEditMode}
              className="font-code text-xs text-[var(--accent)] hover:underline block"
              as="a"
            />

            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToTop}
                className="font-body text-xs font-semibold px-4 py-2 rounded-full bg-white/10 hover:bg-[var(--accent)] text-[var(--text-main)] hover:text-[#171A1C] transition-all flex items-center gap-2 cursor-pointer border border-[var(--card-border)]"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* Bottom Bar: Copyright and Studio Signature */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={defaultViewport}
          transition={{ duration: 0.8, delay: 0.45, ease: premiumEase }}
          className="pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-code text-[var(--text-muted)]"
        >
          <div>
            <EditableText
              value={content.copyrightText}
              onSave={(val) => onUpdateContent({ copyrightText: val })}
              isEditingGlobal={isEditMode}
              as="span"
            />
          </div>

          <div className="flex items-center gap-4 text-[var(--text-muted)]">
            <span>Handcrafted Studio Audio • Bespoke Compositions</span>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};
