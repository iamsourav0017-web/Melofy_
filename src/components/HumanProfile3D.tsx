import React, { useEffect, useRef, useState } from 'react';
import { studioAudio } from '../utils/audioEngine';

interface HumanProfile3DProps {
  isPlaying?: boolean;
}

// 3D Point in Organic Mesh
interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  alpha: number;
  colorType: 'brightCyan' | 'cyan' | 'white' | 'dimCyan';
  isFeatureNode?: boolean;
  isDissolve?: boolean;
  driftSpeed?: number;
  driftPhase?: number;
}

// Floating Musical Symbol
interface MusicalGlyph {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  type: 'eighth' | 'beamed' | 'clef' | 'quarter';
  size: number;
  alpha: number;
  baseAlpha: number;
  rot: number;
  rotSpeed: number;
}

// Shockwave Amplify Ring
interface AmplifyWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

export const HumanProfile3D: React.FC<HumanProfile3DProps> = ({ isPlaying = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    // High DPI Canvas Handling
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // =================================================================
    // 1. ANATOMICAL 3D FEMALE FACE MODEL (Facing Left, Dense Organic Mesh)
    // =================================================================
    const points: Point3D[] = [];
    const connections: Array<[number, number]> = [];

    // Smooth Bezier/Spline Interpolator for 2D profile curve
    const profileSplinePoints: Array<[number, number]> = [
      [30, -150],   // Crown top back
      [10, -152],   // Crown
      [-15, -145],  // Forehead top
      [-42, -132],  // Upper forehead
      [-68, -112],  // Mid forehead
      [-85, -85],   // Brow ridge / Glabella
      [-82, -68],   // Nasion notch
      [-84, -48],   // Upper nose bridge
      [-95, -20],   // Mid nose bridge (Rhinion)
      [-112, 12],   // NOSE TIP
      [-102, 22],   // Columella
      [-90, 26],    // Subnasale
      [-95, 38],    // UPPER LIP
      [-88, 44],    // Lip line closure
      [-94, 52],    // LOWER LIP
      [-86, 62],    // Mentolabial sulcus
      [-92, 78],    // CHIN TIP (Pogonion)
      [-82, 92],    // Menton
      [-60, 108],   // Submental / Throat
      [-40, 124],   // Larynx
      [-25, 145],   // Neck front
      [-12, 170],   // Base neck
    ];

    // Function to calculate depth Z and 3D surface position for any (x, y) on the face
    const getFaceDepth = (x: number, y: number): number | null => {
      // Find nearest profile y level to check bounds
      if (y < -155 || y > 175) return null;

      // Find profile front boundary X at this Y level
      let profileFrontX = -50;
      for (let i = 0; i < profileSplinePoints.length - 1; i++) {
        const [x1, y1] = profileSplinePoints[i];
        const [x2, y2] = profileSplinePoints[i + 1];
        if ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)) {
          const t = Math.abs(y2 - y1) > 0.001 ? (y - y1) / (y2 - y1) : 0;
          profileFrontX = x1 + (x2 - x1) * t;
          break;
        }
      }

      // Point must be behind profile boundary (X >= profileFrontX)
      if (x < profileFrontX - 4) return null;

      const distFromFront = x - profileFrontX;

      // Max lateral depth depends on facial region (Y level)
      let maxDepthZ = 45;
      if (y < -60) {
        // Forehead dome
        maxDepthZ = Math.sqrt(Math.max(0, 1 - Math.pow((y - -60) / 95, 2))) * 55;
      } else if (y >= -60 && y < 10) {
        // Eyes & Cheekbone prominence
        const cheekFactor = Math.sin(((y - -60) / 70) * Math.PI);
        maxDepthZ = 35 + cheekFactor * 25;
      } else if (y >= 10 && y < 65) {
        // Mouth & Jaw depth
        maxDepthZ = 42;
      } else {
        // Neck cylinder
        maxDepthZ = 32;
      }

      // Parabolic surface depth profile in Z
      const normalizedDist = Math.min(1.0, distFromFront / (maxDepthZ * 1.8));
      const zShape = Math.sin(normalizedDist * Math.PI);
      return zShape * maxDepthZ;
    };

    // A. Dense Anatomical Surface Sampling (Face Mesh)
    const yMin = -150;
    const yMax = 165;
    const yStep = 6.5; // Fine vertical resolution

    for (let y = yMin; y <= yMax; y += yStep) {
      // Find profile front X at this Y
      let frontX = -50;
      for (let i = 0; i < profileSplinePoints.length - 1; i++) {
        const [x1, y1] = profileSplinePoints[i];
        const [x2, y2] = profileSplinePoints[i + 1];
        if ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)) {
          const t = Math.abs(y2 - y1) > 0.001 ? (y - y1) / (y2 - y1) : 0;
          frontX = x1 + (x2 - x1) * t;
          break;
        }
      }

      const backX = frontX + 110 + (y < 40 ? (y - -150) * 0.2 : 30);
      const xStep = 7.0; // Fine horizontal resolution

      for (let x = frontX; x <= backX; x += xStep) {
        const z = getFaceDepth(x, y);
        if (z !== null && z >= 0) {
          // Add small organic jitter for hand-crafted particle feel
          const jx = x + (Math.random() - 0.5) * 2.2;
          const jy = y + (Math.random() - 0.5) * 2.2;
          const jz = z + (Math.random() - 0.5) * 2.5;

          const isEdge = x <= frontX + 6;
          const isHighlightRegion = (y > -30 && y < 60 && z > 15) || isEdge;

          points.push({
            x: jx,
            y: jy,
            z: jz,
            baseX: jx,
            baseY: jy,
            baseZ: jz,
            size: isEdge ? 2.0 : (Math.random() * 1.4 + 0.9),
            alpha: isEdge ? 0.95 : (Math.random() * 0.5 + 0.35),
            colorType: isHighlightRegion ? (Math.random() > 0.3 ? 'brightCyan' : 'white') : (Math.random() > 0.4 ? 'cyan' : 'dimCyan'),
            isFeatureNode: isEdge
          });

          // Also mirror a faint background z layer for full 3D head volume (-Z)
          if (z > 6 && Math.random() > 0.4) {
            points.push({
              x: jx,
              y: jy,
              z: -jz * 0.8,
              baseX: jx,
              baseY: jy,
              baseZ: -jz * 0.8,
              size: Math.random() * 1.2 + 0.7,
              alpha: Math.random() * 0.35 + 0.15,
              colorType: 'dimCyan'
            });
          }
        }
      }
    }

    // B. Detailed Closed Eye & Eyebrow Feature Points
    // Peaceful closed eye facing left (-X)
    const eyeX = -58;
    const eyeY = -12;
    for (let e = 0; e <= 18; e++) {
      const t = e / 18;
      const ex = eyeX + (t - 0.5) * 28;
      const ey = eyeY - Math.sin(t * Math.PI) * 4.5;
      const ez = 24 + Math.sin(t * Math.PI) * 8;
      points.push({
        x: ex,
        y: ey,
        z: ez,
        baseX: ex,
        baseY: ey,
        baseZ: ez,
        size: 2.0,
        alpha: 0.95,
        colorType: 'brightCyan',
        isFeatureNode: true
      });
    }

    // Eyebrow Arch
    for (let b = 0; b <= 16; b++) {
      const t = b / 16;
      const bx = -74 + t * 32;
      const by = -28 - Math.sin(t * Math.PI) * 7;
      const bz = 22 + Math.sin(t * Math.PI) * 10;
      points.push({
        x: bx,
        y: by,
        z: bz,
        baseX: bx,
        baseY: by,
        baseZ: bz,
        size: 1.8,
        alpha: 0.9,
        colorType: 'brightCyan',
        isFeatureNode: true
      });
    }

    // C. DISSOLVING REAR HAIR / MEMORY TAIL (Head → Memory → Music)
    // Stream of particles dissolving off the back of the head towards the right (+X)
    const dissolveCount = 450;
    for (let d = 0; d < dissolveCount; d++) {
      const u = Math.random();
      const startX = 30 + u * 250;
      const spreadY = (Math.random() - 0.5) * (200 + u * 160);
      const spreadZ = (Math.random() - 0.5) * (180 + u * 160);
      const driftSpeed = 0.5 + Math.random() * 1.3;

      points.push({
        x: startX,
        y: spreadY,
        z: spreadZ,
        baseX: startX,
        baseY: spreadY,
        baseZ: spreadZ,
        size: Math.random() * 2.4 + 0.8,
        alpha: (1 - u * 0.7) * (Math.random() * 0.65 + 0.2),
        colorType: Math.random() > 0.35 ? 'cyan' : (Math.random() > 0.5 ? 'brightCyan' : 'white'),
        isDissolve: true,
        driftSpeed,
        driftPhase: Math.random() * Math.PI * 2
      });
    }

    // D. Build High-Density Organic Mesh Connection Network
    // Connect nearby face points to create the delicate cyan wireframe network
    const facePoints = points.filter(p => !p.isDissolve);
    for (let i = 0; i < facePoints.length; i += 2) {
      for (let j = i + 1; j < facePoints.length; j += 2) {
        const p1 = facePoints[i];
        const p2 = facePoints[j];
        const dx = p1.baseX - p2.baseX;
        const dy = p1.baseY - p2.baseY;
        const dz = p1.baseZ - p2.baseZ;
        const distSq = dx * dx + dy * dy + dz * dz;

        // Connect if within 22px distance
        if (distSq < 484 && distSq > 16) {
          connections.push([i, j]);
        }
      }
    }

    // =================================================================
    // 2. FLOATING MUSICAL SYMBOLS (♪ ♫ ♬ 𝄞)
    // =================================================================
    const musicalGlyphs: MusicalGlyph[] = [];
    const glyphTypes: MusicalGlyph['type'][] = ['eighth', 'beamed', 'clef', 'quarter'];
    for (let g = 0; g < 18; g++) {
      musicalGlyphs.push({
        x: Math.random() * 340 - 30,
        y: (Math.random() - 0.5) * 300,
        z: (Math.random() - 0.5) * 220,
        vx: (Math.random() * 0.35 + 0.18),
        vy: (Math.random() - 0.5) * 0.22,
        type: glyphTypes[g % glyphTypes.length],
        size: Math.random() * 2.8 + 2.2,
        alpha: Math.random() * 0.45 + 0.35,
        baseAlpha: Math.random() * 0.45 + 0.35,
        rot: (Math.random() - 0.5) * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.008
      });
    }

    // Draw Musical Symbol Helper
    const drawGlyph = (
      c: CanvasRenderingContext2D,
      gx: number,
      gy: number,
      size: number,
      alpha: number,
      type: MusicalGlyph['type'],
      color: string
    ) => {
      c.save();
      c.translate(gx, gy);
      c.fillStyle = color;
      c.strokeStyle = color;
      c.globalAlpha = alpha;

      if (type === 'eighth') {
        c.beginPath();
        c.ellipse(0, 0, size * 2.2, size * 1.5, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = size * 0.6;
        c.beginPath();
        c.moveTo(size * 1.8, 0);
        c.lineTo(size * 1.8, -size * 5.5);
        c.stroke();
        c.beginPath();
        c.moveTo(size * 1.8, -size * 5.5);
        c.quadraticCurveTo(size * 4.2, -size * 4.5, size * 4.2, -size * 2.2);
        c.stroke();
      } else if (type === 'beamed') {
        const gap = size * 3.4;
        c.beginPath();
        c.ellipse(0, 0, size * 2, size * 1.4, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(gap, -size * 0.6, size * 2, size * 1.4, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = size * 0.55;
        c.beginPath();
        c.moveTo(size * 1.6, 0);
        c.lineTo(size * 1.6, -size * 5.2);
        c.moveTo(gap + size * 1.6, -size * 0.6);
        c.lineTo(gap + size * 1.6, -size * 5.8);
        c.stroke();
        c.lineWidth = size * 0.9;
        c.beginPath();
        c.moveTo(size * 1.6, -size * 5.2);
        c.lineTo(gap + size * 1.6, -size * 5.8);
        c.stroke();
      } else if (type === 'clef') {
        c.lineWidth = size * 0.6;
        c.beginPath();
        c.arc(0, 0, size * 1.8, 0, Math.PI * 1.5);
        c.moveTo(0, size * 3.5);
        c.lineTo(0, -size * 4.5);
        c.stroke();
      } else {
        c.beginPath();
        c.ellipse(0, 0, size * 2.2, size * 1.5, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = size * 0.6;
        c.beginPath();
        c.moveTo(size * 1.8, 0);
        c.lineTo(size * 1.8, -size * 5.5);
        c.stroke();
      }
      c.restore();
    };

    // =================================================================
    // 3. INTERACTION PHYSICS (3D Drag, Parallax, Wheel Zoom, Shockwave)
    // =================================================================
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    let mouseParallaxX = 0;
    let mouseParallaxY = 0;
    let targetMouseParallaxX = 0;
    let targetMouseParallaxY = 0;

    let amplifyFactor = 0;
    const shockwaves: AmplifyWave[] = [];

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      setIsDraggingState(true);
      lastPointerX = clientX;
      lastPointerY = clientY;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;

      targetMouseParallaxX = normX * 0.15;
      targetMouseParallaxY = normY * 0.12;

      if (isDragging) {
        const deltaX = clientX - lastPointerX;
        const deltaY = clientY - lastPointerY;
        lastPointerX = clientX;
        lastPointerY = clientY;

        targetRotY = Math.max(-0.35, Math.min(0.35, targetRotY + deltaX * 0.006));
        targetRotX = Math.max(-0.25, Math.min(0.25, targetRotX - deltaY * 0.006));
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        setIsDraggingState(false);
      }
    };

    const triggerAmplify = (clientX?: number, clientY?: number) => {
      amplifyFactor = 1.0;
      const rect = canvas.getBoundingClientRect();
      const cx = clientX !== undefined ? clientX - rect.left : width * 0.5;
      const cy = clientY !== undefined ? clientY - rect.top : height * 0.5;

      shockwaves.push({
        x: cx,
        y: cy,
        radius: 12,
        maxRadius: Math.min(width, height) * 0.65,
        alpha: 0.95,
        speed: 6.5,
        color: '#15BCDF'
      });
      shockwaves.push({
        x: cx,
        y: cy,
        radius: 4,
        maxRadius: Math.min(width, height) * 0.45,
        alpha: 0.85,
        speed: 4.8,
        color: '#3FD0EF'
      });

      studioAudio.playUiClick('button');
    };

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();
    const handleMouseLeave = () => {
      targetMouseParallaxX = 0;
      targetMouseParallaxY = 0;
      onPointerUp();
    };
    const handleClick = (e: MouseEvent) => triggerAmplify(e.clientX, e.clientY);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      onPointerUp();
      if (e.changedTouches.length > 0) {
        triggerAmplify(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        setZoomScale((prev) => {
          const delta = -e.deltaY * 0.0006;
          return Math.max(0.9, Math.min(1.12, prev + delta));
        });
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: true });

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // =================================================================
    // 4. MAIN 60 FPS RENDER LOOP
    // =================================================================
    const render = () => {
      time += 0.016;

      const analysis = studioAudio.getAudioAnalysis();
      const isCurrentlyPlaying = isPlaying || analysis.isPlaying;

      const bassVal = isCurrentlyPlaying ? analysis.bass : (Math.sin(time * 2.2) * 0.15 + 0.22);
      const midVal = isCurrentlyPlaying ? analysis.mid : (Math.sin(time * 3.5 + 1) * 0.12 + 0.18);
      const trebleVal = isCurrentlyPlaying ? analysis.treble : (Math.sin(time * 4.8 + 2) * 0.1 + 0.15);
      const overallAmp = isCurrentlyPlaying ? analysis.overall : (Math.sin(time * 1.8) * 0.12 + 0.25);

      if (amplifyFactor > 0.001) {
        amplifyFactor *= 0.93;
      } else {
        amplifyFactor = 0;
      }

      if (!isDragging) {
        targetRotY *= 0.96;
        targetRotX *= 0.96;
      }
      mouseParallaxX += (targetMouseParallaxX - mouseParallaxX) * 0.08;
      mouseParallaxY += (targetMouseParallaxY - mouseParallaxY) * 0.08;

      currentRotY += (targetRotY + mouseParallaxX - currentRotY) * 0.1;
      currentRotX += (targetRotX + mouseParallaxY - currentRotX) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.48;
      const centerY = height * 0.48;
      const baseScale = (Math.min(width, height) / 460) * zoomScale;
      const dynamicScale = baseScale * (1 + amplifyFactor * 0.08 + bassVal * 0.04);

      // A. Vibrant Cyan Halo Background Glow
      const auraRadius = (230 + overallAmp * 80 + amplifyFactor * 100) * baseScale;
      const auraGradient = ctx.createRadialGradient(
        centerX + currentRotY * 30,
        centerY + currentRotX * 20,
        20 * baseScale,
        centerX,
        centerY,
        auraRadius
      );
      auraGradient.addColorStop(0, `rgba(21, 188, 223, ${0.34 + overallAmp * 0.2 + amplifyFactor * 0.25})`);
      auraGradient.addColorStop(0.4, `rgba(63, 208, 239, ${0.16 + overallAmp * 0.12})`);
      auraGradient.addColorStop(0.75, `rgba(21, 188, 223, 0.04)`);
      auraGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // B. Shockwave Rings
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed;
        sw.alpha -= 0.028;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2.0;
        ctx.globalAlpha = sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // C. 3D Rotation Matrix Calculation
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      interface ProjectedPoint {
        px: number;
        py: number;
        pz: number;
        size: number;
        alpha: number;
        colorType: Point3D['colorType'];
        isFeatureNode?: boolean;
      }

      const projected: ProjectedPoint[] = [];

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        let curX = pt.baseX;
        let curY = pt.baseY;
        let curZ = pt.baseZ;

        if (pt.isDissolve) {
          const drift = Math.sin(time * 1.6 + (pt.driftPhase || 0)) * 12;
          const audioBurst = (overallAmp * 28 + amplifyFactor * 45) * (curX / 120);
          curX += drift + audioBurst;
          curY += Math.cos(time * 1.3 + (pt.driftPhase || 0)) * 8;
        } else {
          // Subtle organic breathing oscillation on face surface
          const breath = Math.sin(time * 2.2 + pt.baseY * 0.02) * (1.2 + bassVal * 3.5 + amplifyFactor * 6.0);
          curX += breath;
          curY += breath * 0.5;
        }

        // Apply 3D Rotation
        const x1 = curX * cosY + curZ * sinY;
        const z1 = -curX * sinY + curZ * cosY;

        const y2 = curY * cosX - z1 * sinX;
        const z2 = curY * sinX + z1 * cosX;

        // Perspective projection
        const fovDistance = 460;
        const fov = fovDistance / (fovDistance + z2);

        const projX = centerX + x1 * fov * dynamicScale;
        const projY = centerY + y2 * fov * dynamicScale;

        const depthAlpha = Math.max(0.18, (z2 + 220) / 440);
        let finalAlpha = pt.alpha * depthAlpha;

        if (isCurrentlyPlaying) {
          finalAlpha = Math.min(1.0, finalAlpha * (1 + midVal * 0.3));
        }

        projected.push({
          px: projX,
          py: projY,
          pz: z2,
          size: pt.size * fov * dynamicScale,
          alpha: finalAlpha,
          colorType: pt.colorType,
          isFeatureNode: pt.isFeatureNode
        });
      }

      // Sort by depth (back to front)
      projected.sort((a, b) => a.pz - b.pz);

      // D. DRAW FINE DELAUNAY MESH LINES
      const lineAlphaBase = 0.22 + midVal * 0.16 + amplifyFactor * 0.25;
      ctx.lineWidth = 0.85;

      for (let c = 0; c < connections.length; c++) {
        const [idxA, idxB] = connections[c];
        if (idxA < projected.length && idxB < projected.length) {
          const pA = projected[idxA];
          const pB = projected[idxB];

          const lineAlpha = (pA.alpha + pB.alpha) * 0.5 * lineAlphaBase;
          ctx.strokeStyle = `rgba(21, 188, 223, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.stroke();
        }
      }

      // E. RENDER 3D FACE SURFACE PARTICLES
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        if (p.colorType === 'brightCyan') {
          ctx.fillStyle = `rgba(63, 208, 239, ${p.alpha})`;
        } else if (p.colorType === 'cyan') {
          ctx.fillStyle = `rgba(21, 188, 223, ${p.alpha})`;
        } else if (p.colorType === 'white') {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(21, 188, 223, ${p.alpha * 0.35})`;
        }

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.6, p.size), 0, Math.PI * 2);
        ctx.fill();

        // Extra white core dot for prominent feature points (eye, lip line, nose tip)
        if (p.isFeatureNode) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, Math.max(0.4, p.size * 0.45), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // F. ALWAYS-ACTIVE HORIZONTAL AUDIO WAVEFORM BEAM
      // Emanating cleanly across mouth/jaw height
      const waveY = centerY + 28 * dynamicScale;
      const waveStepCount = Math.floor(width / 6);

      ctx.save();
      const waveGrad = ctx.createLinearGradient(0, waveY, width, waveY);
      waveGrad.addColorStop(0, 'rgba(21, 188, 223, 0.02)');
      waveGrad.addColorStop(0.25, 'rgba(21, 188, 223, 0.45)');
      waveGrad.addColorStop(0.48, 'rgba(63, 208, 239, 0.95)');
      waveGrad.addColorStop(0.7, 'rgba(21, 188, 223, 0.55)');
      waveGrad.addColorStop(1, 'rgba(21, 188, 223, 0.02)');

      const rawFreqs = analysis.rawFrequencies;

      for (let w = 0; w < waveStepCount; w++) {
        const t = w / waveStepCount;
        const wx = t * width;

        const distFromLips = Math.abs(wx - (centerX - 45 * dynamicScale));
        const envelope = Math.exp(-Math.pow(distFromLips / (width * 0.32), 2));

        let sampleVal = 0;
        if (rawFreqs && rawFreqs.length > 0) {
          const freqIndex = Math.floor(t * (rawFreqs.length * 0.75));
          sampleVal = (rawFreqs[freqIndex] / 255);
        } else {
          const h1 = Math.sin(time * 3.5 + t * 24);
          const h2 = Math.sin(time * 5.2 + t * 48) * 0.5;
          const h3 = Math.cos(time * 2.1 + t * 12) * 0.35;
          sampleVal = Math.abs(h1 + h2 + h3) * 0.4;
        }

        const barAmp = (10 + sampleVal * 60 * (isCurrentlyPlaying ? 1.4 : 0.6) + amplifyFactor * 40) * envelope;
        const barAlpha = Math.min(1.0, 0.35 + sampleVal * 0.6 + amplifyFactor * 0.3);

        ctx.strokeStyle = `rgba(21, 188, 223, ${barAlpha})`;
        ctx.lineWidth = Math.max(1.2, 2.0 * baseScale);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(wx, waveY - barAmp);
        ctx.lineTo(wx, waveY + barAmp);
        ctx.stroke();

        if (barAmp > 24) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${barAlpha * 0.85})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(wx, waveY - barAmp * 0.5);
          ctx.lineTo(wx, waveY + barAmp * 0.5);
          ctx.stroke();
        }
      }

      // Sine Baseline Beam
      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= width; x += 10) {
        const sineWave = Math.sin(time * 4.2 + x * 0.02) * (3 + trebleVal * 8);
        ctx.lineTo(x, waveY + sineWave);
      }
      ctx.stroke();
      ctx.restore();

      // Voice Emanation Core Orb at mouth level
      const voiceCenterX = centerX - 45 * dynamicScale;
      const voicePulseRadius = (18 + bassVal * 20 + amplifyFactor * 28) * baseScale;
      const voiceGrad = ctx.createRadialGradient(
        voiceCenterX, waveY, 2,
        voiceCenterX, waveY, voicePulseRadius
      );
      voiceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      voiceGrad.addColorStop(0.35, 'rgba(63, 208, 239, 0.75)');
      voiceGrad.addColorStop(0.7, 'rgba(21, 188, 223, 0.3)');
      voiceGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = voiceGrad;
      ctx.beginPath();
      ctx.arc(voiceCenterX, waveY, voicePulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // G. RENDER FLOATING MUSICAL GLYPHS (♪ ♫ ♬ 𝄞)
      for (let g = 0; g < musicalGlyphs.length; g++) {
        const mg = musicalGlyphs[g];

        mg.x += mg.vx * (isCurrentlyPlaying ? 1.4 : 1.0);
        mg.y += mg.vy + Math.sin(time * 1.5 + g) * 0.2;
        mg.rot += mg.rotSpeed;

        if (mg.x > 340) {
          mg.x = -80;
          mg.y = (Math.random() - 0.5) * 300;
        }

        const gx1 = mg.x * cosY + mg.z * sinY;
        const gz1 = -mg.x * sinY + mg.z * cosY;
        const gy2 = mg.y * cosX - gz1 * sinX;
        const gz2 = mg.y * sinX + gz1 * cosX;

        const gfov = 460 / (460 + gz2);
        const gprojX = centerX + gx1 * gfov * dynamicScale;
        const gprojY = centerY + gy2 * gfov * dynamicScale;

        const gAlpha = Math.min(1.0, mg.baseAlpha * (0.8 + Math.sin(time * 2.5 + g) * 0.3 + amplifyFactor * 0.5));
        const glyphColor = g % 2 === 0 ? '#15BCDF' : '#3FD0EF';

        drawGlyph(ctx, gprojX, gprojY, mg.size * gfov * dynamicScale, gAlpha, mg.type, glyphColor);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isPlaying, zoomScale]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] flex items-center justify-center select-none"
      title="Interact with the music: Drag to rotate, scroll to zoom, click to amplify"
    >
      <canvas
        ref={canvasRef}
        id="human-profile-3d-canvas"
        className={`w-full h-full absolute inset-0 pointer-events-auto transition-cursor ${
          isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        aria-label="Interactive 3D Human Profile Music Visualization. The artwork faces left toward the story headline, constructed from crisp particles, glowing mesh lines, and soundwaves. Drag to rotate in 3D, click to amplify, scroll to zoom."
      />
    </div>
  );
};
