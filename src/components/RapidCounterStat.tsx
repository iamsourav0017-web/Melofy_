import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { EditableText } from './EditableText';
import { studioAudio } from '../utils/audioEngine';

interface RapidCounterStatProps {
  numberValue: string;
  labelValue: string;
  onSaveNumber?: (val: string) => void;
  onSaveLabel?: (val: string) => void;
  isEditingGlobal?: boolean;
  delay?: number; // Delay before count up starts in seconds
  duration?: number; // Count duration in seconds (default 1.3s)
  soundVariant?: number;
  id?: string;
  className?: string;
}

interface ParsedNumber {
  isNumeric: boolean;
  prefix: string;
  targetNum: number;
  suffix: string;
  decimals: number;
  hasCommas: boolean;
}

function parseStatString(str: string): ParsedNumber {
  if (!str || typeof str !== 'string') {
    return { isNumeric: false, prefix: '', targetNum: 0, suffix: '', decimals: 0, hasCommas: false };
  }

  const trimmed = str.trim();
  // Regex to match prefix, numeric portion (with commas/dots), and suffix
  const match = trimmed.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);
  
  if (!match) {
    return { isNumeric: false, prefix: '', targetNum: 0, suffix: trimmed, decimals: 0, hasCommas: false };
  }

  const prefix = match[1] || '';
  const numRaw = match[2] || '';
  const suffix = match[3] || '';

  const hasCommas = numRaw.includes(',');
  const cleanNumStr = numRaw.replace(/,/g, '');
  const parsed = parseFloat(cleanNumStr);

  if (isNaN(parsed)) {
    return { isNumeric: false, prefix: '', targetNum: 0, suffix: trimmed, decimals: 0, hasCommas: false };
  }

  // Count decimals
  const dotIndex = cleanNumStr.indexOf('.');
  const decimals = dotIndex >= 0 ? cleanNumStr.length - dotIndex - 1 : 0;

  return {
    isNumeric: true,
    prefix,
    targetNum: parsed,
    suffix,
    decimals,
    hasCommas
  };
}

function formatDisplayNumber(val: number, parsed: ParsedNumber): string {
  if (!parsed.isNumeric) return parsed.suffix;

  let numFormatted = '';
  if (parsed.decimals > 0) {
    numFormatted = val.toFixed(parsed.decimals);
  } else {
    const rounded = Math.round(val);
    if (parsed.hasCommas) {
      numFormatted = rounded.toLocaleString('en-US');
    } else {
      numFormatted = rounded.toString();
    }
  }

  return `${parsed.prefix}${numFormatted}${parsed.suffix}`;
}

export const RapidCounterStat: React.FC<RapidCounterStatProps> = ({
  numberValue,
  labelValue,
  onSaveNumber,
  onSaveLabel,
  isEditingGlobal = false,
  delay = 0.25,
  duration = 1.4,
  soundVariant = 0,
  id,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });
  const shouldReduceMotion = useReducedMotion();

  const parsed = useMemo(() => parseStatString(numberValue), [numberValue]);
  
  const [displayStr, setDisplayStr] = useState<string>(() => 
    shouldReduceMotion || !parsed.isNumeric ? numberValue : formatDisplayNumber(0, parsed)
  );
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Update display immediately when numberValue changes or editing mode is active
  useEffect(() => {
    if (isEditingGlobal || shouldReduceMotion || !parsed.isNumeric) {
      setDisplayStr(numberValue);
    }
  }, [numberValue, isEditingGlobal, shouldReduceMotion, parsed]);

  const triggerAnimation = useCallback(() => {
    if (shouldReduceMotion || !parsed.isNumeric) {
      setDisplayStr(numberValue);
      return;
    }

    setIsFlashing(false);
    setDisplayStr(formatDisplayNumber(0, parsed));

    const controls = animate(0, parsed.targetNum, {
      duration: duration,
      delay: delay,
      ease: [0.12, 0.9, 0.25, 1], // Rapid high-velocity start with precise decelerating arrival
      onUpdate: (latest) => {
        setDisplayStr(formatDisplayNumber(latest, parsed));
      },
      onComplete: () => {
        setDisplayStr(numberValue);
        setIsFlashing(true);
        studioAudio.playStatFlashSound(soundVariant);

        setTimeout(() => {
          setIsFlashing(false);
        }, 750);
      }
    });

    return controls;
  }, [parsed, numberValue, duration, delay, shouldReduceMotion, soundVariant]);

  useEffect(() => {
    if (isEditingGlobal) return;

    if (isInView) {
      const controls = triggerAnimation();
      return () => {
        controls?.stop();
      };
    }
  }, [isInView, isEditingGlobal, triggerAnimation]);

  const handleManualTrigger = () => {
    if (isEditingGlobal) return;
    studioAudio.playUiClick('button');
    triggerAnimation();
  };

  return (
    <div
      ref={containerRef}
      id={id}
      onClick={handleManualTrigger}
      className={`group relative cursor-pointer select-none transition-all ${className}`}
      title="Click to replay count-up animation"
    >
      {/* Number Display Container with Flash & Glint FX */}
      <div className="relative inline-flex items-center">
        
        {/* Flash Radial Glow Aura behind number */}
        <motion.div
          animate={
            isFlashing
              ? {
                  scale: [0.7, 1.9, 2.2],
                  opacity: [0, 0.85, 0],
                  filter: ['blur(4px)', 'blur(16px)', 'blur(24px)']
                }
              : { scale: 0.8, opacity: 0 }
          }
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="absolute -inset-2 rounded-full bg-[var(--accent)] pointer-events-none -z-10"
        />

        {/* Secondary Warm / Golden Glint Flash Aura */}
        <motion.div
          animate={
            isFlashing
              ? {
                  scale: [0.5, 1.6, 2.0],
                  opacity: [0, 0.65, 0]
                }
              : { scale: 0.5, opacity: 0 }
          }
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="absolute -inset-1 rounded-full bg-white/70 pointer-events-none -z-10"
        />

        {/* Text Container with dynamic flash scale & brightness */}
        {isEditingGlobal ? (
          <EditableText
            value={numberValue}
            onSave={(val) => onSaveNumber && onSaveNumber(val)}
            isEditingGlobal={true}
            className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-main)] block tracking-tight"
            as="p"
          />
        ) : (
          <motion.div
            animate={
              isFlashing
                ? {
                    scale: [1, 1.15, 0.98, 1],
                    filter: [
                      'brightness(1) drop-shadow(0 0 0px var(--accent))',
                      'brightness(2.2) drop-shadow(0 0 16px var(--accent))',
                      'brightness(1.5) drop-shadow(0 0 8px var(--accent))',
                      'brightness(1) drop-shadow(0 0 0px var(--accent))'
                    ]
                  }
                : {
                    scale: 1,
                    filter: 'brightness(1) drop-shadow(0 0 0px transparent)'
                  }
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block overflow-hidden py-0.5 px-0.5"
          >
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-main)] tracking-tight tabular-nums flex items-center">
              <span>{displayStr}</span>
            </p>

            {/* Diagonal Shimmer / Light Beam passing through during flash */}
            <motion.div
              animate={
                isFlashing
                  ? {
                      x: ['-120%', '240%'],
                      opacity: [0, 1, 0]
                    }
                  : { x: '-120%', opacity: 0 }
              }
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="absolute inset-0 w-8 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-25 pointer-events-none"
            />
          </motion.div>
        )}

        {/* Micro Sparkle Icon Pop on Arrival Flash */}
        <motion.div
          animate={
            isFlashing
              ? {
                  scale: [0, 1.35, 0],
                  rotate: [0, 45, 90],
                  opacity: [0, 1, 0]
                }
              : { scale: 0, opacity: 0 }
          }
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute -top-2.5 -right-3.5 text-[var(--accent)] pointer-events-none"
        >
          <Sparkles className="w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" />
        </motion.div>

      </div>

      {/* Label Subtext */}
      <div>
        <EditableText
          value={labelValue}
          onSave={(val) => onSaveLabel && onSaveLabel(val)}
          isEditingGlobal={isEditingGlobal}
          className="font-body text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors block"
          as="p"
        />
      </div>

    </div>
  );
};
