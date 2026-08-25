import React, { useEffect, useRef, useState } from 'react';

interface MusicalOrb3DProps {
  isPlaying?: boolean;
}

export const MusicalOrb3D: React.FC<MusicalOrb3DProps> = ({ isPlaying = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

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

    // -------------------------------------------------------------
    // 3D Physics, Rotation, and Interactive Drag Momentum
    // -------------------------------------------------------------
    let rotX = 0.2;
    let rotY = 0;
    let velX = 0;
    let velY = 0.006;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    // Mouse coordinates for gentle parallax and light reflection
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let isPointerOver = false;

    // Interactive Shockwave rings generated on click
    interface ShockwaveRing {
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
      color: string;
      lineWidth: number;
    }
    const shockwaves: ShockwaveRing[] = [];

    // Interactive burst particles on click
    interface SparkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      vz: number;
      alpha: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      type: 'note' | 'spark';
    }
    const sparkParticles: SparkParticle[] = [];

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      setIsDraggingState(true);
      lastPointerX = clientX;
      lastPointerY = clientY;
      velX = 0;
      velY = 0;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;
      targetMouseX = Math.max(-1, Math.min(1, normX * 2));
      targetMouseY = Math.max(-1, Math.min(1, normY * 2));
      isPointerOver = true;

      if (isDragging) {
        const deltaX = clientX - lastPointerX;
        const deltaY = clientY - lastPointerY;
        lastPointerX = clientX;
        lastPointerY = clientY;

        // Apply angular rotation
        rotY += deltaX * 0.012;
        rotX -= deltaY * 0.012;

        // Track velocity for inertia release
        velY = deltaX * 0.008;
        velX = -deltaY * 0.008;
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        setIsDraggingState(false);
      }
    };

    // Canvas Mouse / Touch event handlers
    const handleMouseDown = (e: MouseEvent) => {
      onPointerDown(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      onPointerUp();
    };

    const handleMouseLeave = () => {
      isPointerOver = false;
      onPointerUp();
    };

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

    const handleTouchEnd = () => {
      onPointerUp();
    };

    // Click interactive ripple burst
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Spawn concentric sound shockwave
      shockwaves.push({
        radius: 10,
        maxRadius: Math.min(width, height) * 0.55,
        alpha: 0.85,
        speed: 4.5,
        color: '#15BCDF',
        lineWidth: 2
      });

      // Spawn temporary 3D spark particles
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        sparkParticles.push({
          x: cx - width / 2,
          y: cy - height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: (Math.random() - 0.5) * 6,
          alpha: 1,
          life: 0,
          maxLife: Math.floor(Math.random() * 30 + 25),
          size: Math.random() * 3 + 2,
          color: Math.random() > 0.5 ? '#15BCDF' : '#3FD0EF',
          type: Math.random() > 0.6 ? 'note' : 'spark'
        });
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // -------------------------------------------------------------
    // Floating 3D Musical Notation Particles
    // -------------------------------------------------------------
    interface MusicParticle {
      x: number;
      y: number;
      z: number;
      type: 'eighth' | 'sixteenth' | 'clef' | 'dot' | 'node';
      angle: number;
      radius: number;
      speed: number;
      size: number;
      alpha: number;
      phase: number;
      tilt: number;
    }

    const particles: MusicParticle[] = [];
    const particleCount = 56;
    for (let i = 0; i < particleCount; i++) {
      const typeRoll = Math.random();
      let type: MusicParticle['type'] = 'dot';
      if (typeRoll > 0.8) type = 'eighth';
      else if (typeRoll > 0.65) type = 'sixteenth';
      else if (typeRoll > 0.52) type = 'clef';
      else if (typeRoll > 0.3) type = 'node';

      particles.push({
        x: 0,
        y: 0,
        z: (Math.random() - 0.5) * 180,
        type,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 160 + 75,
        speed: (Math.random() * 0.007 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.8 + 1.2,
        alpha: Math.random() * 0.55 + 0.35,
        phase: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.6
      });
    }

    // -------------------------------------------------------------
    // 3D Fibonacci Sphere Lattice Geometry
    // -------------------------------------------------------------
    interface SphereNode {
      x: number;
      y: number;
      z: number;
      baseRadius: number;
      index: number;
    }

    const sphereNodes: SphereNode[] = [];
    const nodeCount = 108;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < nodeCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const r = 115;
      sphereNodes.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseRadius: r,
        index: i
      });
    }

    // Helper: Draw 3D vector musical notation glyph
    const drawMusicalGlyph = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      type: MusicParticle['type'],
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.fillStyle = color;
      c.strokeStyle = color;
      c.globalAlpha = alpha;
      c.lineWidth = Math.max(1, size * 0.4);

      if (type === 'eighth') {
        // Eighth Note ♫
        c.beginPath();
        c.ellipse(0, 0, size * 1.8, size * 1.3, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(size * 1.4, 0);
        c.lineTo(size * 1.4, -size * 4.5);
        c.stroke();
        c.beginPath();
        c.moveTo(size * 1.4, -size * 4.5);
        c.quadraticCurveTo(size * 3.2, -size * 3.5, size * 3.2, -size * 2);
        c.stroke();
      } else if (type === 'sixteenth') {
        // Double Beam Pair ♬
        const gap = size * 2.6;
        c.beginPath();
        c.ellipse(0, 0, size * 1.5, size * 1.1, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(gap, -size * 0.4, size * 1.5, size * 1.1, -Math.PI / 6, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(size * 1.2, 0);
        c.lineTo(size * 1.2, -size * 4.2);
        c.moveTo(gap + size * 1.2, -size * 0.4);
        c.lineTo(gap + size * 1.2, -size * 4.6);
        c.stroke();
        c.lineWidth = size * 0.7;
        c.beginPath();
        c.moveTo(size * 1.2, -size * 4.2);
        c.lineTo(gap + size * 1.2, -size * 4.6);
        c.moveTo(size * 1.2, -size * 3.2);
        c.lineTo(gap + size * 1.2, -size * 3.6);
        c.stroke();
      } else if (type === 'clef') {
        // Stylized G-Clef contour 𝄞
        c.lineWidth = size * 0.5;
        c.beginPath();
        c.arc(0, 0, size * 1.4, 0, Math.PI * 1.5);
        c.moveTo(0, size * 2.5);
        c.lineTo(0, -size * 3.5);
        c.stroke();
      }

      c.restore();
    };

    // -------------------------------------------------------------
    // Main 60 FPS Render Loop
    // -------------------------------------------------------------
    const render = () => {
      time += 0.016;

      // Inertia and rotational physics damping
      if (!isDragging) {
        rotY += velY;
        rotX += velX;
        // Damping towards standard subtle ambient rotation
        velY = velY * 0.95 + (0.005 + (isPlaying ? 0.004 : 0)) * 0.05;
        velX = velX * 0.95;
      }

      // Parallax smooth interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const scale = Math.min(width, height) / 480;
      const audioAmp = isPlaying ? Math.sin(time * 7) * 0.35 + 0.65 : 0.22;

      // 1. Ambient Volumetric Glow Core
      const glowRad = 210 * scale * (1 + audioAmp * 0.2);
      const coreGlow = ctx.createRadialGradient(
        centerX + currentMouseX * 18,
        centerY + currentMouseY * 18,
        25 * scale,
        centerX,
        centerY,
        glowRad
      );
      coreGlow.addColorStop(0, `rgba(21, 188, 223, ${0.22 + audioAmp * 0.15})`);
      coreGlow.addColorStop(0.45, `rgba(63, 208, 239, ${0.1 + audioAmp * 0.06})`);
      coreGlow.addColorStop(0.8, `rgba(21, 188, 223, 0.02)`);
      coreGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRad, 0, Math.PI * 2);
      ctx.fill();

      // 2. Interactive Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed;
        sw.alpha -= 0.025;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = sw.lineWidth;
        ctx.globalAlpha = sw.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Temporary Spark Particles
      for (let p = sparkParticles.length - 1; p >= 0; p--) {
        const sp = sparkParticles[p];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 1;
        sp.alpha = Math.max(0, 1 - sp.life / sp.maxLife);

        if (sp.life >= sp.maxLife) {
          sparkParticles.splice(p, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(centerX + sp.x, centerY + sp.y, sp.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Counter-Rotating Resonance Equatorial Rings
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const ringProgress = ((time * 0.35 + r * 0.33) % 1);
        const radius = (125 + ringProgress * 120) * scale;
        const ringAlpha = (1 - ringProgress) * (0.3 + audioAmp * 0.25);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotY * 0.4 + (r * Math.PI) / 3 + currentMouseX * 0.15);
        ctx.strokeStyle = `rgba(21, 188, 223, ${ringAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.72, rotX * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 5. 3D Rotating Orb Nodes with Depth Projection
      const currentRotY = rotY + currentMouseX * 0.35;
      const currentRotX = rotX + currentMouseY * 0.35;

      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      const projectedNodes: Array<{
        x: number;
        y: number;
        z: number;
        waveR: number;
        alpha: number;
        index: number;
        isHighlighted: boolean;
      }> = [];

      sphereNodes.forEach((node) => {
        // Rotate around Y
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        // Rotate around X
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Audio frequency wave displacement
        const waveDisplacement = Math.sin(time * 3.5 + node.index * 0.4) * (8 + audioAmp * 16);
        const rScale = (node.baseRadius + waveDisplacement) * scale;

        const distance = 380;
        const fov = Math.max(0.01, distance / Math.max(10, distance + z2));

        const projX = centerX + x1 * fov * (rScale / node.baseRadius);
        const projY = centerY + y2 * fov * (rScale / node.baseRadius);
        const depthAlpha = Math.max(0.12, (z2 + node.baseRadius) / (node.baseRadius * 2));

        // Proximity to mouse cursor interactive illumination
        const distToMouse = Math.hypot(projX - (centerX + currentMouseX * 100), projY - (centerY + currentMouseY * 100));
        const isHoverNear = isPointerOver && distToMouse < 80 * scale;

        projectedNodes.push({
          x: projX,
          y: projY,
          z: z2,
          waveR: (isHoverNear ? 3.2 : 2.2) * fov * scale,
          alpha: isHoverNear ? Math.min(1, depthAlpha * 1.5) : depthAlpha,
          index: node.index,
          isHighlighted: isHoverNear || node.index % 5 === 0
        });
      });

      // Sort by depth (back to front)
      projectedNodes.sort((a, b) => a.z - b.z);

      // Connecting 3D wireframe chord lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedNodes.length; i += 3) {
        const next = projectedNodes[(i + 4) % projectedNodes.length];
        const avgAlpha = (projectedNodes[i].alpha + next.alpha) * 0.16;
        ctx.strokeStyle = `rgba(23, 26, 28, ${avgAlpha})`;
        ctx.beginPath();
        ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }

      // Draw Sphere Nodes (Glowing Cyan & Slate Nodes)
      projectedNodes.forEach((pn) => {
        const isCyan = pn.isHighlighted;
        ctx.fillStyle = isCyan
          ? `rgba(21, 188, 223, ${pn.alpha * 0.95})`
          : `rgba(27, 30, 33, ${pn.alpha * 0.75})`;

        ctx.beginPath();
        ctx.arc(pn.x, pn.y, isCyan ? pn.waveR * 1.25 : pn.waveR, 0, Math.PI * 2);
        ctx.fill();

        if (isCyan && pn.z > 0) {
          ctx.strokeStyle = `rgba(63, 208, 239, ${pn.alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 6. Circular 3D Equalizer Harmonic Ring
      const eqBarCount = 40;
      const baseEqRadius = 138 * scale;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-time * 0.25);

      for (let b = 0; b < eqBarCount; b++) {
        const angle = (b / eqBarCount) * Math.PI * 2;
        const wave = Math.sin(time * 4.5 + b * 0.55) * 0.5 + 0.5;
        const barHeight = (4 + wave * (18 + audioAmp * 22)) * scale;

        const xStart = Math.cos(angle) * baseEqRadius;
        const yStart = Math.sin(angle) * baseEqRadius;
        const xEnd = Math.cos(angle) * (baseEqRadius + barHeight);
        const yEnd = Math.sin(angle) * (baseEqRadius + barHeight);

        const barAlpha = 0.35 + wave * 0.5;
        ctx.strokeStyle = b % 3 === 0
          ? `rgba(21, 188, 223, ${barAlpha})`
          : `rgba(27, 30, 33, ${barAlpha * 0.65})`;
        ctx.lineWidth = 1.8 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }
      ctx.restore();

      // 7. Floating 3D Music Particles Orbiting
      particles.forEach((p) => {
        p.angle += p.speed * (isPlaying ? 1.5 : 1);
        const orbitX = Math.cos(p.angle) * p.radius * scale;
        const orbitY = Math.sin(p.angle) * p.radius * 0.75 * scale + Math.sin(time * 2 + p.phase) * 14;

        const posX = centerX + orbitX + currentMouseX * 24;
        const posY = centerY + orbitY + currentMouseY * 24;

        if (p.type === 'eighth' || p.type === 'sixteenth' || p.type === 'clef') {
          drawMusicalGlyph(
            ctx,
            posX,
            posY,
            p.size * scale * 1.5,
            p.alpha * (0.65 + Math.sin(time * 2.2 + p.phase) * 0.35),
            p.type,
            '#15BCDF'
          );
        } else if (p.type === 'node') {
          ctx.fillStyle = `rgba(21, 188, 223, ${p.alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(posX, posY, p.size * scale * 1.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(27, 30, 33, ${p.alpha * 0.55})`;
          ctx.beginPath();
          ctx.arc(posX, posY, p.size * scale * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      });

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
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isPlaying]);

  return (
    <div
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] flex items-center justify-center select-none"
      title="Click and drag to spin in 3D • Click to pulse soundwaves"
    >
      <canvas
        ref={canvasRef}
        id="musical-orb-canvas"
        className={`w-full h-full absolute inset-0 pointer-events-auto transition-cursor ${
          isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        aria-label="Interactive 3D Musical Orb Visualizer (Drag to rotate, click to burst)"
      />
    </div>
  );
};
