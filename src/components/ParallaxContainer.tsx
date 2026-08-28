import React, { createContext, useContext, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue, useReducedMotion } from 'motion/react';

interface ParallaxContextValue {
  scrollYProgress: MotionValue<number>;
  smoothProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

export const useParallaxContext = () => useContext(ParallaxContext);

interface ParallaxSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  offset?: [string, string];
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  id,
  className = '',
  style,
  as: Component = 'section',
  offset = ['start end', 'end start']
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: offset as any
  });

  // Soft spring physics to guarantee ultra-smooth, jitter-free parallax gliding
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
    restDelta: 0.0005
  });

  return (
    <ParallaxContext.Provider value={{ scrollYProgress, smoothProgress, shouldReduceMotion: !!shouldReduceMotion }}>
      {/* @ts-ignore */}
      <Component
        ref={containerRef}
        id={id}
        className={`relative w-full ${className}`}
        style={style}
      >
        {children}
      </Component>
    </ParallaxContext.Provider>
  );
};

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // Speed factor: e.g. -0.2 (moves slower than scroll) to 0.4 (moves faster)
  yRange?: [number, number]; // Explicit pixel displacement: e.g. [30, -30]
  xRange?: [number, number]; // Optional horizontal drift: e.g. [-10, 10]
  scaleRange?: [number, number]; // Optional subtle scale breath
  opacityRange?: [number, number]; // Optional depth fade
  rotateRange?: [number, number]; // Optional subtle tilt
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed,
  yRange,
  xRange,
  scaleRange,
  opacityRange,
  rotateRange,
  className = '',
  style,
  zIndex
}) => {
  const ctx = useParallaxContext();
  const shouldReduceMotion = ctx?.shouldReduceMotion ?? false;

  // Compute effective Y range: if explicit yRange provided use it, otherwise derive from speed (default: 40px * speed)
  const effectiveYRange: [number, number] = yRange
    ? yRange
    : speed !== undefined
    ? [speed * 60, -speed * 60]
    : [0, 0];

  const y = useTransform(
    ctx ? ctx.smoothProgress : new MotionValue(0.5),
    [0, 1],
    effectiveYRange
  );

  const x = useTransform(
    ctx ? ctx.smoothProgress : new MotionValue(0.5),
    [0, 1],
    xRange || [0, 0]
  );

  const scale = useTransform(
    ctx ? ctx.smoothProgress : new MotionValue(0.5),
    [0, 1],
    scaleRange || [1, 1]
  );

  const opacity = useTransform(
    ctx ? ctx.smoothProgress : new MotionValue(0.5),
    [0, 1],
    opacityRange || [1, 1]
  );

  const rotate = useTransform(
    ctx ? ctx.smoothProgress : new MotionValue(0.5),
    [0, 1],
    rotateRange || [0, 0]
  );

  if (shouldReduceMotion || !ctx) {
    return (
      <div className={className} style={{ ...style, zIndex }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      style={{
        y,
        ...(xRange ? { x } : {}),
        ...(scaleRange ? { scale } : {}),
        ...(opacityRange ? { opacity } : {}),
        ...(rotateRange ? { rotate } : {}),
        ...style,
        zIndex
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * Ambient floating glowing aura orb that drifts in the background with deep parallax displacement
 */
interface ParallaxFloatingAuraProps {
  color?: string;
  size?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  speed?: number;
  yRange?: [number, number];
  opacity?: number;
  blur?: string;
  className?: string;
}

export const ParallaxFloatingAura: React.FC<ParallaxFloatingAuraProps> = ({
  color = 'var(--accent)',
  size = 350,
  top,
  left,
  right,
  bottom,
  speed = 0.5,
  yRange = [60, -60],
  opacity = 0.15,
  blur = 'blur-3xl',
  className = ''
}) => {
  return (
    <div
      className={`pointer-events-none absolute overflow-hidden select-none z-0 ${className}`}
      style={{ top, left, right, bottom }}
    >
      <ParallaxLayer yRange={yRange} speed={speed}>
        <div
          className={`rounded-full ${blur}`}
          style={{
            width: size,
            height: size,
            background: color,
            opacity
          }}
        />
      </ParallaxLayer>
    </div>
  );
};

/**
 * Parallax Card Wrapper with built-in depth offset based on child index
 */
interface ParallaxStaggerCardProps {
  children: React.ReactNode;
  index: number;
  baseDisplacement?: number; // e.g. 15px
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxStaggerCard: React.FC<ParallaxStaggerCardProps> = ({
  children,
  index,
  baseDisplacement = 18,
  className = '',
  style
}) => {
  // Center cards move slightly differently than edge cards to create a subtle curved depth field
  const factor = (index % 2 === 0 ? 1 : -1) * (1 + (index % 3) * 0.35);
  const displacement = baseDisplacement * factor;

  return (
    <ParallaxLayer
      yRange={[displacement, -displacement]}
      className={`h-full ${className}`}
      style={style}
    >
      {children}
    </ParallaxLayer>
  );
};
