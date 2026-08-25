import React, { useEffect, useRef, useState } from 'react';

interface Page3DCanvasProps {
  isPlaying: boolean;
  activeSection: string;
  enableHeroVideo?: boolean;
  heroVideoUrl?: string;
  heroVideoOpacity?: number;
  heroVideoFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  heroVideoBlur?: number;
  heroVideoBrightness?: number;
  heroVideoContrast?: number;
  heroVideoLoop?: boolean;
  heroVideoMuted?: boolean;
  heroVideoPlaybackRate?: number;
  heroVideoOverlayTint?: 'none' | 'subtle' | 'vignette' | 'gradient' | 'dark';
}

interface Particle3D {
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  yOffset: number;
  size: number;
  color: string;
  baseAlpha: number;
}

interface OrbitalRing {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  angle: number;
}

export const Page3DCanvas: React.FC<Page3DCanvasProps> = ({
  isPlaying,
  activeSection,
  enableHeroVideo = false,
  heroVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-sound-waves-moving-on-a-dark-background-42999-large.mp4',
  heroVideoOpacity = 0.35,
  heroVideoFit = 'cover',
  heroVideoBlur = 0,
  heroVideoBrightness = 95,
  heroVideoContrast = 105,
  heroVideoLoop = true,
  heroVideoMuted = true,
  heroVideoPlaybackRate = 1.0,
  heroVideoOverlayTint = 'vignette'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [, setVideoLoaded] = useState(false);

  // Play / pause video sync & playback properties
  useEffect(() => {
    if (enableHeroVideo && videoRef.current) {
      videoRef.current.playbackRate = heroVideoPlaybackRate || 1.0;
      videoRef.current.muted = heroVideoMuted !== false;
      videoRef.current.loop = heroVideoLoop !== false;
      videoRef.current.play().catch(() => {
        // Auto-play policy fallback
      });
    }
  }, [enableHeroVideo, heroVideoUrl, heroVideoPlaybackRate, heroVideoMuted, heroVideoLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Scroll Progress Tracker with smooth interpolation
    let currentScrollProgress = 0;
    let targetScrollProgress = 0;

    const onScroll = () => {
      const totalScrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = Math.min(1, Math.max(0, window.scrollY / totalScrollable));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mouse coordinates in normalized screen space (-1 to 1)
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width) * 2 - 1;
      targetMouseY = (e.clientY / height) * 2 - 1;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 1. Initialize sleek, lightweight ambient particles
    const particleCount = window.innerWidth < 768 ? 50 : 90;
    const particles: Particle3D[] = [];
    const colors = ['#FFFFFF', '#E2F8FC', '#15BCDF', '#A3D9E8'];

    for (let i = 0; i < particleCount; i++) {
      const radius = 80 + Math.random() * (Math.max(width, height) * 0.75);
      particles.push({
        orbitRadius: radius,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.0015 + 0.0005) * (Math.random() > 0.5 ? 1 : -1),
        yOffset: (Math.random() - 0.5) * height * 1.3,
        size: Math.random() > 0.85 ? 2.2 : 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.35 + 0.1,
      });
    }

    // 2. Initialize elegant orbital rings
    const rings: OrbitalRing[] = [
      { radius: Math.max(width, height) * 0.38, tiltX: 0.2, tiltZ: 0.1, speed: 0.001, angle: 0 },
      { radius: Math.max(width, height) * 0.52, tiltX: -0.15, tiltZ: -0.25, speed: -0.0008, angle: Math.PI / 4 },
      { radius: Math.max(width, height) * 0.68, tiltX: 0.3, tiltZ: -0.1, speed: 0.0005, angle: Math.PI / 2 },
    ];

    let focalZ = 450;
    let targetFocalZ = 450;
    let clickRipple = 0;
    
    const onWindowClick = () => {
      clickRipple = 1.0;
    };
    window.addEventListener('click', onWindowClick);

    // Dynamic Theme Accent Color Resolver
    const getThemeAccent = (): string => {
      if (typeof window === 'undefined') return '#15BCDF';
      const rootStyle = getComputedStyle(document.documentElement);
      const acc = rootStyle.getPropertyValue('--accent').trim();
      return acc || '#15BCDF';
    };

    const render = () => {
      time += 0.016;

      // Smooth scroll interpolation (eased lerp)
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Fluid Audio-Reactive Section Transitions & Depth Shifting
      if (activeSection === 'hero' || activeSection === '') {
        targetFocalZ = 410;
      } else if (activeSection === 'about') {
        targetFocalZ = 440;
      } else if (activeSection === 'portfolio') {
        targetFocalZ = 475;
      } else if (activeSection === 'pricing') {
        targetFocalZ = 430;
      } else if (activeSection === 'how-it-works') {
        targetFocalZ = 450;
      } else if (activeSection === 'contact') {
        targetFocalZ = 390;
      } else {
        targetFocalZ = 440;
      }

      // If playing, add subtle harmonic breathing to focal depth
      if (isPlaying) {
        targetFocalZ += Math.sin(time * 2.5) * 15;
      }

      focalZ += (targetFocalZ - focalZ) * 0.05;

      const energy = isPlaying ? 1.5 : 0.85;
      
      if (clickRipple > 0) {
        clickRipple -= 0.015;
      }

      ctx.clearRect(0, 0, width, height);

      const themeAccent = getThemeAccent();

      // Subtle atmospheric 3D gradient aura around center
      const cx = width / 2 + mouseX * 40;
      const cy = height / 2 + mouseY * 40;
      const ambientGlow = ctx.createRadialGradient(
        cx, cy, 0,
        cx, cy, Math.max(width, height) * 0.65
      );
      ambientGlow.addColorStop(0, isPlaying ? 'rgba(21, 188, 223, 0.05)' : 'rgba(21, 188, 223, 0.025)');
      ambientGlow.addColorStop(0.5, 'rgba(21, 188, 223, 0.008)');
      ambientGlow.addColorStop(1, 'rgba(242, 241, 240, 0)');
      
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // Camera Matrix setup
      const camRotY = mouseX * 0.12 + time * 0.03 + (isPlaying ? Math.sin(time * 0.8) * 0.02 : 0); 
      const camRotX = -mouseY * 0.08 + (currentScrollProgress * 0.1);
      const cosCamY = Math.cos(camRotY);
      const sinCamY = Math.sin(camRotY);
      const cosCamX = Math.cos(camRotX);
      const sinCamX = Math.sin(camRotX);

      // Projecting a general 3D point helper
      const projectGlobal = (px: number, py: number, pz: number) => {
        const x1 = px * cosCamY + pz * sinCamY;
        const z1 = -px * sinCamY + pz * cosCamY;
        const y1 = py * cosCamX - z1 * sinCamX;
        const z2 = py * sinCamX + z1 * cosCamX;
        
        const scale = Math.max(0.01, focalZ / Math.max(10, focalZ + z2));
        return {
          sx: width / 2 + x1 * scale,
          sy: height / 2 + y1 * scale,
          scale,
          z: z2
        };
      };

      // ----------------------------------------------------------------------
      // 1. RENDER GRACEFUL ORBITAL RINGS
      // ----------------------------------------------------------------------
      for (const ring of rings) {
        ring.angle += ring.speed * energy;
        const pts = 50;
        ctx.beginPath();
        
        let started = false;
        for (let i = 0; i <= pts; i++) {
          const theta = (i / pts) * Math.PI * 2;
          
          const ringX = Math.cos(theta) * ring.radius;
          const ringZ = Math.sin(theta) * ring.radius;
          
          const yTilt = ringX * Math.sin(ring.tiltZ) + ringZ * Math.sin(ring.tiltX);
          
          const finalX = ringX * Math.cos(ring.angle) - ringZ * Math.sin(ring.angle);
          const finalZ = ringX * Math.sin(ring.angle) + ringZ * Math.cos(ring.angle);

          const proj = projectGlobal(finalX, yTilt, finalZ);
          
          if (proj.scale > 0) {
            if (!started) {
              ctx.moveTo(proj.sx, proj.sy);
              started = true;
            } else {
              ctx.lineTo(proj.sx, proj.sy);
            }
          }
        }
        
        ctx.strokeStyle = themeAccent;
        ctx.lineWidth = isPlaying ? 1.4 : 1;
        ctx.globalAlpha = (isPlaying ? 0.09 : 0.035) + (clickRipple * 0.1);
        ctx.stroke();
      }

      // ----------------------------------------------------------------------
      // 2. COLLECT AND PROJECT PARTICLES
      // ----------------------------------------------------------------------
      const projectedParticles = [];

      for (const p of particles) {
        p.orbitAngle += p.orbitSpeed * energy;
        
        const yWave = Math.sin(time * 0.5 + p.orbitAngle) * 30 + (isPlaying ? Math.cos(time * 2 + p.orbitAngle * 3) * 12 : 0);

        const px = Math.cos(p.orbitAngle) * p.orbitRadius;
        const pz = Math.sin(p.orbitAngle) * p.orbitRadius;
        const py = p.yOffset + yWave;

        const proj = projectGlobal(px, py, pz);
        if (proj.scale > 0) {
          projectedParticles.push({ ...proj, p });
        }
      }

      // Sort particles back-to-front
      projectedParticles.sort((a, b) => b.z - a.z);

      // Render Sleek Particles
      for (const item of projectedParticles) {
        const { sx, sy, scale, p } = item;
        
        const depthAlpha = Math.min(1, Math.max(0.05, p.baseAlpha * scale));
        const pulse = isPlaying ? Math.sin(time * 2.5 + p.orbitAngle * 5) * 0.35 + 0.75 : 1;
        const rad = Math.max(0.5, p.size * scale * pulse) + (clickRipple * scale * 2);
        
        ctx.save();
        ctx.translate(sx, sy);
        
        // Luminous Core
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#15BCDF' ? themeAccent : p.color;
        ctx.globalAlpha = depthAlpha * (isPlaying ? 1.0 : 0.6) + (clickRipple * 0.4);
        ctx.fill();

        // Soft glow for larger particles
        if (p.size > 1.5 || clickRipple > 0 || isPlaying) {
          ctx.beginPath();
          ctx.arc(0, 0, rad * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color === '#15BCDF' ? themeAccent : p.color;
          ctx.globalAlpha = (depthAlpha * 0.18) + (clickRipple * 0.15);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onWindowClick);
    };
  }, [isPlaying, activeSection]);

  const isHeroActive = activeSection === 'hero' || activeSection === '';
  const currentVideoOpacity = enableHeroVideo ? (isHeroActive ? heroVideoOpacity : heroVideoOpacity * 0.25) : 0;

  // Object fit styling
  const getObjectFitClass = () => {
    switch (heroVideoFit) {
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      case 'scale-down': return 'object-scale-down';
      case 'cover':
      default: return 'object-cover';
    }
  };

  return (
    <div
      id="page-3d-background-wrapper"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Dynamic Background Video Loop Layer */}
      {enableHeroVideo && heroVideoUrl && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-out"
          style={{
            opacity: currentVideoOpacity,
            filter: `blur(${heroVideoBlur}px) brightness(${heroVideoBrightness}%) contrast(${heroVideoContrast}%)`
          }}
        >
          <video
            ref={videoRef}
            src={heroVideoUrl}
            autoPlay
            loop={heroVideoLoop !== false}
            muted={heroVideoMuted !== false}
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full ${getObjectFitClass()}`}
          />
          {/* Configurable Overlay Tints */}
          {heroVideoOverlayTint === 'vignette' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-main)]/20 to-[var(--bg-main)]/80 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(23,26,28,0.3)_100%)] pointer-events-none" />
            </>
          )}
          {heroVideoOverlayTint === 'gradient' && (
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)]/40 via-transparent to-[var(--bg-main)] pointer-events-none" />
          )}
          {heroVideoOverlayTint === 'dark' && (
            <div className="absolute inset-0 bg-[#090A0C]/50 pointer-events-none" />
          )}
          {heroVideoOverlayTint === 'subtle' && (
            <div className="absolute inset-0 bg-[var(--bg-main)]/30 pointer-events-none" />
          )}
        </div>
      )}

      {/* 3D Interactive Audio Particle & Musical Note Canvas */}
      <canvas
        id="page-3d-interactive-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: 0.95,
          willChange: 'transform'
        }}
      />
    </div>
  );
};



