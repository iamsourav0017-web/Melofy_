import React, { useEffect, useRef } from 'react';
import { studioAudio } from '../utils/audioEngine';

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  startTime: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  theta: number;
  phi: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  symbol?: string;
  isStar?: boolean;
}

interface MelofyAudioReactiveCanvasProps {
  isPlaying: boolean;
  mousePos: { x: number; y: number; normalizedX: number; normalizedY: number };
  shockwaves: Shockwave[];
  reducedMotion?: boolean;
  onAudioUpdate?: (data: { overall: number; bass: number; mid: number; treble: number }) => void;
  renderLayer?: 'all' | 'back' | 'front';
  rotAngles: { x: number; y: number };
  onDragRotate?: (deltaX: number, deltaY: number) => void;
}

export const MelofyAudioReactiveCanvas: React.FC<MelofyAudioReactiveCanvasProps> = ({
  isPlaying,
  mousePos,
  shockwaves,
  reducedMotion = false,
  onAudioUpdate,
  renderLayer = 'all',
  rotAngles,
  onDragRotate
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic input refs to prevent canvas teardowns on rapid interaction
  const mousePosRef = useRef(mousePos);
  const rotAnglesRef = useRef(rotAngles);
  const shockwavesRef = useRef(shockwaves);
  const isPlayingRef = useRef(isPlaying);
  const reducedMotionRef = useRef(reducedMotion);
  const onAudioUpdateRef = useRef(onAudioUpdate);

  useEffect(() => {
    mousePosRef.current = mousePos;
    rotAnglesRef.current = rotAngles;
    shockwavesRef.current = shockwaves;
    isPlayingRef.current = isPlaying;
    reducedMotionRef.current = reducedMotion;
    onAudioUpdateRef.current = onAudioUpdate;
  });

  // 3D State
  const particles3DRef = useRef<Particle3D[]>([]);
  const timeRef = useRef<number>(0);
  const audioStateRef = useRef({ overall: 0, bass: 0, mid: 0, treble: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      init3DParticles();
    };

    window.addEventListener('resize', handleResize);

    // Initialize 3D Spherical Particle Cloud
    const init3DParticles = () => {
      const pCount = window.innerWidth < 768 ? 55 : 95;
      const symbols = ['♪', '♫', '♬', '𝄞', '✦', '•'];
      const particles: Particle3D[] = [];

      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const baseRadius = 140 + Math.random() * 180;
        const isSymbol = Math.random() < 0.25;
        const isStar = !isSymbol && Math.random() < 0.3;

        particles.push({
          x: 0,
          y: 0,
          z: 0,
          baseRadius,
          theta,
          phi,
          speed: (Math.random() - 0.5) * 0.008,
          size: isSymbol ? 13 + Math.random() * 8 : isStar ? 2.5 + Math.random() * 2.5 : 1.2 + Math.random() * 2.2,
          color: Math.random() < 0.7 ? '#15BCDF' : '#FFFFFF',
          alpha: 0.25 + Math.random() * 0.65,
          symbol: isSymbol ? symbols[Math.floor(Math.random() * symbols.length)] : undefined,
          isStar
        });
      }
      particles3DRef.current = particles;
    };

    init3DParticles();

    // ------------------------------------------------------------------
    // 3D Projection Matrix Helper
    // ------------------------------------------------------------------
    const project3D = (
      px: number,
      py: number,
      pz: number,
      centerX: number,
      centerY: number,
      rx: number,
      ry: number,
      fov = 650
    ) => {
      // Rotation Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = px * cosY + pz * sinY;
      const y1 = py;
      const z1 = -px * sinY + pz * cosY;

      // Rotation X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective Scale
      const scale = Math.max(0.01, fov / Math.max(10, fov + z2));
      const screenX = centerX + x2 * scale;
      const screenY = centerY + y2 * scale;

      return { x: screenX, y: screenY, z: z2, scale };
    };

    // ------------------------------------------------------------------
    // MAIN RENDER LOOP (60 FPS)
    // ------------------------------------------------------------------
    const render = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Audio analysis
      const analysis = studioAudio.getAudioAnalysis();
      const isActuallyPlaying = analysis.isPlaying;

      const targetOverall = isActuallyPlaying ? analysis.overall : 0;
      const targetBass = isActuallyPlaying ? analysis.bass : 0;
      const targetMid = isActuallyPlaying ? analysis.mid : 0;
      const targetTreble = isActuallyPlaying ? analysis.treble : 0;

      const smoothFactor = 0.14;
      audioStateRef.current.overall += (targetOverall - audioStateRef.current.overall) * smoothFactor;
      audioStateRef.current.bass += (targetBass - audioStateRef.current.bass) * smoothFactor;
      audioStateRef.current.mid += (targetMid - audioStateRef.current.mid) * smoothFactor;
      audioStateRef.current.treble += (targetTreble - audioStateRef.current.treble) * smoothFactor;

      const audio = audioStateRef.current;
      if (onAudioUpdateRef.current) {
        onAudioUpdateRef.current(audio);
      }

      ctx.clearRect(0, 0, width, height);

      const mPos = mousePosRef.current || { x: 0, y: 0, normalizedX: 0, normalizedY: 0 };
      const rAngles = rotAnglesRef.current || { x: 0.1, y: 0 };
      const rMotion = reducedMotionRef.current;
      const curShockwaves = shockwavesRef.current || [];

      const centerX = width * 0.52 + (mPos.normalizedX || 0) * 16;
      const centerY = height * 0.48 + (mPos.normalizedY || 0) * 12;

      const currentRotX = rAngles.x + (rMotion ? 0 : Math.sin(t * 0.15) * 0.10);
      const currentRotY = rAngles.y + (rMotion ? 0 : t * 0.12); // Continuous proper direction

      const orbRadius = (width * 0.32) * (1 + audio.bass * 0.12);

      // ================================================================
      // SECTION 1: 3D REVOLVING ORB & GYROSCOPE RINGS
      // ================================================================
      ctx.save();

      // Ring 1: Equatorial Visualizer Ring (with 360° Frequency Bars)
      const ringSegments = 90;
      const rawFreq = analysis.rawFrequencies;

      // Draw Equatorial Orbit Ring
      const eqPoints: { x: number; y: number; z: number; scale: number; norm: number; barH: number }[] = [];
      for (let i = 0; i <= ringSegments; i++) {
        const angle = (i / ringSegments) * Math.PI * 2;
        const norm = i / ringSegments;

        let barHeight = 0;
        if (isActuallyPlaying && rawFreq) {
          const fIdx = Math.floor(norm * (rawFreq.length - 1));
          barHeight = (rawFreq[fIdx] / 255) * 35 * (1 + audio.mid * 0.8);
        } else {
          barHeight = Math.sin(t * 2.5 + norm * 12) * (4 + audio.overall * 8);
        }

        const r = orbRadius;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle * 2) * 12; // Slight undulating warp
        const pz = Math.sin(angle) * r;

        const proj = project3D(px, py, pz, centerX, centerY, currentRotX, currentRotY);
        eqPoints.push({ ...proj, norm, barH: barHeight });
      }

      // Draw back segments vs front segments depending on renderLayer
      for (let i = 0; i < eqPoints.length - 1; i++) {
        const p1 = eqPoints[i];
        const p2 = eqPoints[i + 1];
        const isBack = (p1.z + p2.z) / 2 < 0;

        if (renderLayer === 'back' && !isBack) continue;
        if (renderLayer === 'front' && isBack) continue;

        const alpha = Math.min(1, Math.max(0.04, (p1.scale - 0.5) * 0.7 + audio.overall * 0.4));

        // Sleek continuous ring line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#15BCDF';
        ctx.lineWidth = (p1.scale * 1.8) * (1 + audio.overall * 0.5);
        ctx.globalAlpha = alpha;
        ctx.stroke();

        // Elegant soft wave pulses protruding from the revolving 3D circle
        if (i % 2 === 0 && Math.abs(p1.barH) > 2) {
          const dx = p1.x - centerX;
          const dy = p1.y - centerY;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const pinLen = (p1.barH * p1.scale * 0.8) * (isBack ? 0.5 : 1.0);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p1.x + (dx / len) * pinLen, p1.y + (dy / len) * pinLen);
          ctx.strokeStyle = isBack ? 'rgba(21, 188, 223, 0.4)' : 'rgba(21, 188, 223, 0.85)';
          ctx.lineWidth = p1.scale * 0.8;
          ctx.globalAlpha = alpha * 0.9;
          ctx.stroke();
        }
      }

      // Ring 2: Tilted Gyroscopic Polar Ring (Orbit 2) - sleek & fine
      const gyroSegments = 70;
      const gyroPoints: { x: number; y: number; z: number; scale: number }[] = [];
      const gyroRadius = orbRadius * 1.15;
      const gyroTilt = 0.75; // 45 degree tilt

      for (let i = 0; i <= gyroSegments; i++) {
        const angle = (i / gyroSegments) * Math.PI * 2;
        const px = Math.cos(angle) * gyroRadius;
        const py = Math.sin(angle) * gyroRadius * Math.cos(gyroTilt);
        const pz = Math.sin(angle) * gyroRadius * Math.sin(gyroTilt);

        // Counter spin
        const proj = project3D(px, py, pz, centerX, centerY, currentRotX * 0.7, -currentRotY * 0.6);
        gyroPoints.push(proj);
      }

      for (let i = 0; i < gyroPoints.length - 1; i++) {
        const p1 = gyroPoints[i];
        const p2 = gyroPoints[i + 1];
        const isBack = (p1.z + p2.z) / 2 < 0;

        if (renderLayer === 'back' && !isBack) continue;
        if (renderLayer === 'front' && isBack) continue;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#171A1C';
        ctx.lineWidth = 0.5 * p1.scale;
        ctx.globalAlpha = isBack ? 0.05 : 0.15 + audio.overall * 0.1;
        ctx.stroke();
      }

      // Rotating Node Satellites on Ring 2
      for (let n = 0; n < 3; n++) {
        const nodeAngle = t * 0.6 + (n * Math.PI * 2) / 3;
        const px = Math.cos(nodeAngle) * gyroRadius;
        const py = Math.sin(nodeAngle) * gyroRadius * Math.cos(gyroTilt);
        const pz = Math.sin(nodeAngle) * gyroRadius * Math.sin(gyroTilt);
        const proj = project3D(px, py, pz, centerX, centerY, currentRotX * 0.7, -currentRotY * 0.6);

        const isBack = proj.z < 0;
        if ((renderLayer === 'back' && !isBack) || (renderLayer === 'front' && isBack)) continue;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, (3.5 + audio.bass * 3) * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#15BCDF';
        ctx.globalAlpha = isBack ? 0.35 : 0.85;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 1.2 * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.95;
        ctx.fill();
      }

      ctx.restore();

      // ================================================================
      // SECTION 2: 3D SPHERICAL PARTICLES & MUSICAL GLYPHS
      // ================================================================
      ctx.save();
      const particles = particles3DRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reducedMotion) {
          p.theta += p.speed * (1 + audio.overall * 2);
        }

        // Spherical to Cartesian coordinates
        const curR = p.baseRadius * (1 + audio.bass * 0.15);
        const px = curR * Math.sin(p.phi) * Math.cos(p.theta);
        const py = curR * Math.cos(p.phi);
        const pz = curR * Math.sin(p.phi) * Math.sin(p.theta);

        const proj = project3D(px, py, pz, centerX, centerY, currentRotX, currentRotY);
        const isBack = proj.z < 0;

        if ((renderLayer === 'back' && !isBack) || (renderLayer === 'front' && isBack)) continue;

        const depthAlpha = Math.min(1, Math.max(0.1, p.alpha * proj.scale + (isBack ? -0.15 : 0.25) + audio.overall * 0.3));

        if (p.symbol) {
          ctx.font = `${(p.size + audio.mid * 3) * proj.scale}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = depthAlpha * (isBack ? 0.4 : 0.9);
          ctx.fillText(p.symbol, proj.x, proj.y);
        } else if (p.isStar) {
          const starSize = (p.size + audio.treble * 3) * proj.scale;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = depthAlpha;

          ctx.beginPath();
          ctx.moveTo(proj.x, proj.y - starSize * 2);
          ctx.lineTo(proj.x + starSize * 0.5, proj.y);
          ctx.lineTo(proj.x, proj.y + starSize * 2);
          ctx.lineTo(proj.x - starSize * 0.5, proj.y);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(proj.x - starSize * 2, proj.y);
          ctx.lineTo(proj.x, proj.y + starSize * 0.5);
          ctx.lineTo(proj.x + starSize * 2, proj.y);
          ctx.lineTo(proj.x, proj.y - starSize * 0.5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, (p.size * proj.scale) * (1 + audio.bass * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = depthAlpha;
          ctx.fill();
        }
      }
      ctx.restore();

      // ================================================================
      // SECTION 3: AUDIO-REACTIVE CARRIER WAVEFORM (Horizontal Core)
      // Rendered primarily in 'front' or 'all' layer
      // ================================================================
      if (renderLayer !== 'back') {
        ctx.save();
        const waveY = height * 0.50 + mousePos.normalizedY * 6;
        const waveStartX = width * 0.04;
        const waveEndX = width * 0.96;
        const waveLen = waveEndX - waveStartX;
        const stepCount = 120;
        const stepWidth = waveLen / stepCount;

        // Draw Carrier Sine Wave
        ctx.beginPath();
        ctx.moveTo(waveStartX, waveY);

        const rawWave = analysis.rawWaveform;

        for (let i = 0; i <= stepCount; i++) {
          const norm = i / stepCount;
          const x = waveStartX + i * stepWidth;

          const baseSin = Math.sin(norm * 14 - t * 3.2) * (6 + audio.mid * 16);
          const harmonic = Math.sin(norm * 28 + t * 4.5) * (3 + audio.treble * 10);
          const subBass = Math.sin(norm * 6 - t * 1.8) * (4 + audio.bass * 20);

          let timeOffset = 0;
          if (isActuallyPlaying && rawWave) {
            const waveIdx = Math.floor(norm * (rawWave.length - 1));
            timeOffset = ((rawWave[waveIdx] - 128) / 128) * 26;
          }

          const envelope = Math.sin(norm * Math.PI);
          const y = waveY + (baseSin + harmonic + subBass + timeOffset) * envelope;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#15BCDF';
        ctx.lineWidth = 1.6 + audio.overall * 1.4;
        ctx.globalAlpha = 0.8 + audio.overall * 0.2;
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.9;
        ctx.stroke();

        // Resonance Core at hands meeting point
        const coreX = Number.isFinite(width * 0.53 + (mPos.normalizedX || 0) * 10) ? width * 0.53 + (mPos.normalizedX || 0) * 10 : width * 0.5;
        const safeWaveY = Number.isFinite(waveY) ? waveY : height * 0.5;
        const rawCoreR = (12 + (audio.bass || 0) * 22 + Math.sin(t * 3) * 3) * (isActuallyPlaying ? 1.3 : 1.0);
        const coreR = Math.max(0.1, Number.isFinite(rawCoreR) ? rawCoreR : 12);

        const radGrad = ctx.createRadialGradient(coreX, safeWaveY, 0, coreX, safeWaveY, coreR);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        radGrad.addColorStop(0.35, 'rgba(21, 188, 223, 0.65)');
        radGrad.addColorStop(0.7, 'rgba(21, 188, 223, 0.18)');
        radGrad.addColorStop(1, 'rgba(21, 188, 223, 0.0)');

        ctx.beginPath();
        ctx.arc(coreX, safeWaveY, coreR, 0, Math.PI * 2);
        ctx.fillStyle = radGrad;
        ctx.globalAlpha = 0.85 + (audio.overall || 0) * 0.15;
        ctx.fill();

        ctx.restore();
      }

      // ================================================================
      // SECTION 4: INTERACTIVE CLICK SHOCKWAVES
      // ================================================================
      if (curShockwaves.length > 0 && renderLayer !== 'back') {
        ctx.save();
        const now = performance.now();
        curShockwaves.forEach(sw => {
          const elapsed = (now - sw.startTime) / 1000;
          if (elapsed > 0 && elapsed < 0.9) {
            const progress = elapsed / 0.9;
            const currentR = sw.maxRadius * Math.sin((progress * Math.PI) / 2);
            const currentAlpha = (1 - progress) * 0.85;

            ctx.beginPath();
            ctx.arc(sw.x, sw.y, currentR, 0, Math.PI * 2);
            ctx.strokeStyle = '#15BCDF';
            ctx.lineWidth = Math.max(0.5, 3 * (1 - progress));
            ctx.globalAlpha = currentAlpha;
            ctx.stroke();

            if (currentR > 25) {
              ctx.beginPath();
              ctx.arc(sw.x, sw.y, currentR * 0.72, 0, Math.PI * 2);
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1.2 * (1 - progress);
              ctx.globalAlpha = currentAlpha * 0.7;
              ctx.stroke();
            }
          }
        });
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderLayer]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: renderLayer === 'back' ? 1 : 15 }}
    />
  );
};
