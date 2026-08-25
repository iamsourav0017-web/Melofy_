import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
import { premiumEase, defaultViewport } from '../utils/motionTransitions';

/**
 * Magnetic element wrapper:
 * Gently tracks cursor position when hovering within proximity, creating an ultra-premium tactile pull.
 */
interface MagneticProps {
  children: React.ReactNode;
  strength?: number; // Distance multiplier (default: 0.25)
  className?: string;
  disabled?: boolean;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.25,
  className = '',
  disabled = false
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Spring physics for buttery smooth motion & natural recovery
  const springConfig = { stiffness: 220, damping: 18, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || shouldReduceMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (disabled || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * Specular Card:
 * Renders an ambient radial spotlight that smoothly follows cursor coordinate (X, Y)
 * creating real-time specular refraction on glass surfaces and borders.
 */
interface SpecularCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  borderRadius?: string;
  onClick?: () => void;
  id?: string;
}

export const SpecularCard: React.FC<SpecularCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(21, 188, 223, 0.12)',
  borderColor = 'rgba(255, 255, 255, 0.08)',
  borderRadius = '16px',
  onClick,
  id
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      onClick={onClick}
      style={{
        borderRadius,
        borderColor: isHovered ? 'rgba(21, 188, 223, 0.35)' : borderColor
      }}
      className={`relative overflow-hidden transition-colors duration-300 ${className}`}
    >
      {/* Specular Spotlight Layer */}
      {!shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 75%)`
          }}
        />
      )}

      {/* Subtle Specular Border Highlight */}
      {!shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
          style={{
            opacity: isHovered ? 1 : 0,
            borderRadius,
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(21, 188, 223, 0.4), transparent 70%)`,
            maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px'
          }}
        />
      )}

      {/* Card Content Layer */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

/**
 * Kinetic Line Reveal:
 * Luxury typography mask that unmasks text lines from below an invisible baseline
 * with smooth cubic-bezier easing.
 */
interface KineticTextRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const KineticTextReveal: React.FC<KineticTextRevealProps> = ({
  children,
  delay = 0,
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`overflow-hidden inline-block ${className}`}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={defaultViewport}
        transition={{
          duration: 0.85,
          delay,
          ease: premiumEase
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Kinetic Words:
 * Splits a phrase into word-by-word staggered reveal animations with spring physics.
 */
interface KineticWordsProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  className?: string;
  wordClassName?: string;
  accentIndices?: number[];
  accentClassName?: string;
}

export const KineticWords: React.FC<KineticWordsProps> = ({
  text,
  delay = 0,
  staggerDelay = 0.04,
  className = '',
  wordClassName = '',
  accentIndices = [],
  accentClassName = 'text-[var(--accent)]'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(' ');

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}>
      {words.map((word, idx) => {
        const isAccent = accentIndices.includes(idx);
        return (
          <span key={idx} className="overflow-hidden inline-block align-bottom">
            <motion.span
              initial={{ y: '110%', opacity: 0, rotate: 1.5 }}
              whileInView={{ y: '0%', opacity: 1, rotate: 0 }}
              viewport={defaultViewport}
              transition={{
                duration: 0.75,
                delay: delay + idx * staggerDelay,
                ease: premiumEase
              }}
              className={`inline-block ${wordClassName} ${isAccent ? accentClassName : ''}`}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
};

/**
 * Kinetic Studio Badge:
 * High-end badge with animated audio pulse dot / micro equalizer.
 */
interface KineticBadgeProps {
  children: React.ReactNode;
  delay?: number;
  isPlaying?: boolean;
  className?: string;
}

export const KineticBadge: React.FC<KineticBadgeProps> = ({
  children,
  delay = 0,
  isPlaying = false,
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={defaultViewport}
      transition={{ duration: 0.7, delay, ease: premiumEase }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--text-muted)] ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] ${isPlaying ? 'opacity-90' : 'opacity-40'}`} />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
      </span>
      {children}
    </motion.div>
  );
};

/**
 * Equalizer Micro Bars:
 * Miniature frequency level bars that animate rhythmically when audio is active.
 */
interface EqualizerMicroBarsProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

export const EqualizerMicroBars: React.FC<EqualizerMicroBarsProps> = ({
  isPlaying,
  barCount = 4,
  className = '',
  color = 'var(--accent)'
}) => {
  return (
    <div className={`inline-flex items-end gap-[2px] h-3.5 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const dur = 0.5 + (i % 3) * 0.2;
        const del = (i * 0.15) % 0.6;
        return (
          <span
            key={i}
            className="w-[2.5px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: color,
              height: isPlaying ? '100%' : '30%',
              animation: isPlaying
                ? `equalizerBar ${dur}s ease-in-out infinite alternate ${del}s`
                : 'none'
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Fluid Audio-Reactive Section Container:
 * Gently breathes with harmonic frequency waves when audio plays, creating seamless transitions.
 */
interface AudioReactiveSectionProps {
  children: React.ReactNode;
  id?: string;
  isPlaying?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AudioReactiveSection: React.FC<AudioReactiveSectionProps> = ({
  children,
  id,
  isPlaying = false,
  className = '',
  style
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: premiumEase }}
      className={`relative w-full overflow-hidden transition-all duration-700 ${className}`}
      style={style}
    >
      {/* Subtle audio-reactive harmonic perimeter pulse */}
      {isPlaying && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40 z-0"
          style={{
            background: 'radial-gradient(1000px circle at 50% 10%, rgba(21, 188, 223, 0.03), transparent 70%)',
            animation: 'acousticPulse 4s ease-in-out infinite alternate'
          }}
        />
      )}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.section>
  );
};

/**
 * Acoustic Wave Section Divider:
 * Ambient, smoothly moving frequency wave divider that harmoniously separates page sections.
 * Reacts subtly to playback state with harmonic wave animation.
 */
interface AcousticWaveDividerProps {
  opacity?: number;
  accentColor?: string;
  flip?: boolean;
  isPlaying?: boolean;
  className?: string;
}

export const AcousticWaveDivider: React.FC<AcousticWaveDividerProps> = ({
  opacity = 0.45,
  accentColor = 'var(--accent)',
  flip = false,
  isPlaying = false,
  className = ''
}) => {
  return (
    <div
      className={`relative w-full h-12 overflow-hidden pointer-events-none select-none z-10 flex items-center justify-center ${
        flip ? 'rotate-180' : ''
      } ${className}`}
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 48"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,24 C180,6 360,42 540,20 C720,-2 900,46 1080,24 C1260,2 1350,38 1440,24"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray="4 6"
          strokeOpacity="0.4"
          className={isPlaying ? 'animate-pulse' : ''}
        />
        <path
          d="M0,24 C240,40 480,8 720,24 C960,40 1200,8 1440,24"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />
        {/* Subtle center frequency accent nodes */}
        <circle cx="360" cy="24" r="2.5" fill={accentColor} fillOpacity={isPlaying ? 1.0 : 0.8} />
        <circle cx="720" cy="24" r="3" fill={accentColor} fillOpacity={isPlaying ? 1.0 : 0.9} />
        <circle cx="1080" cy="24" r="2.5" fill={accentColor} fillOpacity={isPlaying ? 1.0 : 0.8} />
      </svg>
    </div>
  );
};

