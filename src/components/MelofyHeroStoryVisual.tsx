import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { ZoomIn, ZoomOut, Move, RotateCcw, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { MelofyAudioReactiveCanvas } from './MelofyAudioReactiveCanvas';
import { studioAudio } from '../utils/audioEngine';
import { optimizeImageFile } from '../utils/mediaStorage';
import { SiteBrandConfig } from '../types';

interface MelofyHeroStoryVisualProps {
  isPlaying: boolean;
  brandConfig?: SiteBrandConfig;
  isAdminMode?: boolean;
  onUpdateBrandConfig?: (updated: Partial<SiteBrandConfig>) => void;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  startTime: number;
}

export const MelofyHeroStoryVisual: React.FC<MelofyHeroStoryVisualProps> = ({
  isPlaying,
  brandConfig,
  isAdminMode = false,
  onUpdateBrandConfig
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const artworkBoxRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse parallax state (normalized -1 to 1)
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0
  });

  // 3D Orbital Rotation Angles with Dragging & Momentum
  const [rotAngles, setRotAngles] = useState({ x: 0.18, y: 0 });
  const [isRotating3D, setIsRotating3D] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0.18, rotY: 0 });
  const hasMovedRef = useRef(false);

  // Centerpiece Media from Brand Config or fallback
  const heroMediaUrl = brandConfig?.heroArtworkUrl || '/couple.png';
  const heroMediaType = brandConfig?.heroArtworkType || 'image';

  // Artwork Drag Position & Scale state
  const [artworkScale, setArtworkScale] = useState<number>(brandConfig?.heroArtworkScale ?? 1.0);
  const [artworkOffset, setArtworkOffset] = useState<{ x: number; y: number }>({
    x: brandConfig?.heroArtworkOffsetX ?? 0,
    y: brandConfig?.heroArtworkOffsetY ?? 0
  });

  const artworkScaleRef = useRef(artworkScale);
  artworkScaleRef.current = artworkScale;
  const artworkOffsetRef = useRef(artworkOffset);
  artworkOffsetRef.current = artworkOffset;

  // Dragging Artwork state
  const [isDraggingArtwork, setIsDraggingArtwork] = useState(false);
  const artworkDragStartRef = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });

  // Resizing Artwork via Corner Handle state
  const [isResizingArtwork, setIsResizingArtwork] = useState(false);
  const resizeStartRef = useRef({ startX: 0, startScale: 1.0 });

  // Interaction modes: 'orbit' (default 3D rotation) or 'artwork' (drag/resize artwork)
  const [interactionMode, setInteractionMode] = useState<'orbit' | 'artwork'>('orbit');
  const [showControls, setShowControls] = useState(false);

  // Synchronize local states when brandConfig updates from admin
  useEffect(() => {
    if (brandConfig?.heroArtworkScale !== undefined) {
      setArtworkScale(brandConfig.heroArtworkScale);
    }
    if (brandConfig?.heroArtworkOffsetX !== undefined && brandConfig?.heroArtworkOffsetY !== undefined) {
      setArtworkOffset({
        x: brandConfig.heroArtworkOffsetX,
        y: brandConfig.heroArtworkOffsetY
      });
    }
  }, [brandConfig?.heroArtworkScale, brandConfig?.heroArtworkOffsetX, brandConfig?.heroArtworkOffsetY]);

  // Click shockwaves list
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Save changes callback helper
  const handlePersistChanges = useCallback((newScale: number, newOffset: { x: number; y: number }) => {
    if (onUpdateBrandConfig) {
      onUpdateBrandConfig({
        heroArtworkScale: Number(newScale.toFixed(2)),
        heroArtworkOffsetX: Math.round(newOffset.x),
        heroArtworkOffsetY: Math.round(newOffset.y)
      });
    }
  }, [onUpdateBrandConfig]);

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const directFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingMedia(true);
      const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|mov)$/i);
      const optimizedDataUrl = await optimizeImageFile(file);
      if (onUpdateBrandConfig) {
        onUpdateBrandConfig({
          heroArtworkUrl: optimizedDataUrl,
          heroArtworkType: isVideo ? 'video' : 'image'
        });
      }
      studioAudio.playUiClick('button');
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Zoom In / Out Handlers
  const handleZoom = useCallback((delta: number) => {
    const next = Math.max(0.4, Math.min(2.5, Number((artworkScaleRef.current + delta).toFixed(2))));
    setArtworkScale(next);
    handlePersistChanges(next, artworkOffsetRef.current);
  }, [handlePersistChanges]);

  // Reset Artwork position & scale
  const handleResetArtwork = useCallback(() => {
    setArtworkScale(1.0);
    setArtworkOffset({ x: 0, y: 0 });
    handlePersistChanges(1.0, { x: 0, y: 0 });
    studioAudio.playUiClick('button');
  }, [handlePersistChanges]);

  const mouseAnimRef = useRef<number | null>(null);

  // Container Mouse Move (for Parallax & 3D Orb Rotation)
  const handleContainerPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;

    if (!mouseAnimRef.current) {
      mouseAnimRef.current = requestAnimationFrame(() => {
        mouseAnimRef.current = null;
        setMousePos({ x, y, normalizedX, normalizedY });
      });
    }

    // Handle 3D Orb Rotation
    if (isRotating3D && interactionMode === 'orbit') {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMovedRef.current = true;
      }
      setRotAngles({
        x: dragStartRef.current.rotX - deltaY * 0.008,
        y: dragStartRef.current.rotY + deltaX * 0.010
      });
    }

    // Handle Centerpiece Position Dragging
    if (isDraggingArtwork) {
      const deltaX = e.clientX - artworkDragStartRef.current.x;
      const deltaY = e.clientY - artworkDragStartRef.current.y;
      const newOffsetX = artworkDragStartRef.current.startOffsetX + deltaX;
      const newOffsetY = artworkDragStartRef.current.startOffsetY + deltaY;
      setArtworkOffset({ x: newOffsetX, y: newOffsetY });
    }

    // Handle Corner Resize Dragging
    if (isResizingArtwork) {
      const deltaX = e.clientX - resizeStartRef.current.startX;
      const scaleDelta = deltaX * 0.006;
      const newScale = Math.max(0.4, Math.min(2.5, resizeStartRef.current.startScale + scaleDelta));
      setArtworkScale(Number(newScale.toFixed(2)));
    }
  }, [isRotating3D, interactionMode, isDraggingArtwork, isResizingArtwork]);

  // Pointer Down on background (for 3D Orb Drag Rotation)
  const handleContainerPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingArtwork || isResizingArtwork) return;
    if (!containerRef.current) return;

    setIsRotating3D(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotAngles.x,
      rotY: rotAngles.y
    };
    try {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
  }, [isDraggingArtwork, isResizingArtwork, rotAngles]);

  // Pointer Up globally on container
  const handleContainerPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingArtwork) {
      setIsDraggingArtwork(false);
      handlePersistChanges(artworkScaleRef.current, artworkOffsetRef.current);
    }
    if (isResizingArtwork) {
      setIsResizingArtwork(false);
      handlePersistChanges(artworkScaleRef.current, artworkOffsetRef.current);
    }
    if (isRotating3D) {
      setIsRotating3D(false);
      try {
        if ((e.currentTarget as HTMLElement)?.hasPointerCapture?.(e.pointerId)) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      // Clean click spawns pulse shockwave
      if (!hasMovedRef.current && containerRef.current && !isDraggingArtwork && !isResizingArtwork) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const newShockwave: Shockwave = {
          x: clickX,
          y: clickY,
          radius: 0,
          maxRadius: Math.max(rect.width, rect.height) * 0.75,
          opacity: 1,
          startTime: performance.now()
        };

        setShockwaves((prev) => [...prev.slice(-3), newShockwave]);
        studioAudio.playUiClick('button');

        setTimeout(() => {
          setShockwaves((prev) => prev.filter((sw) => sw !== newShockwave));
        }, 950);
      }
    }
  }, [isDraggingArtwork, isResizingArtwork, isRotating3D, handlePersistChanges]);

  // Pointer Down on Centerpiece Artwork (Drag-to-move)
  const handleArtworkPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdminMode) return;
    e.stopPropagation();
    setIsDraggingArtwork(true);
    artworkDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: artworkOffset.x,
      startOffsetY: artworkOffset.y
    };
    try {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
  }, [isAdminMode, artworkOffset]);

  // Pointer Down on Corner Resize Handle
  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdminMode) return;
    e.stopPropagation();
    setIsResizingArtwork(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startScale: artworkScale
    };
    try {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
  }, [isAdminMode, artworkScale]);

  // Mouse Wheel zooming over visualizer with Alt/Ctrl or hover
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (isHovered && (e.ctrlKey || e.altKey || interactionMode === 'artwork')) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      handleZoom(delta);
    }
  }, [isHovered, interactionMode, handleZoom]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsRotating3D(false);
    setIsDraggingArtwork(false);
    setIsResizingArtwork(false);
    setMousePos({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    studioAudio.playUiHover();
  }, []);

  return (
    <div
      id="melofy-hero-story-visual"
      ref={containerRef}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      role="region"
      aria-label="Interactive 3D Musical Orb and Centerpiece Artwork Visualizer"
      className={`w-full h-[500px] sm:h-[580px] md:h-[640px] relative flex items-center justify-center select-none overflow-hidden rounded-3xl transition-all duration-500 touch-none group ${
        isAdminMode && isDraggingArtwork
          ? 'cursor-move'
          : isAdminMode && isResizingArtwork
          ? 'cursor-nwse-resize'
          : isRotating3D
          ? 'cursor-grabbing'
          : 'cursor-grab'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 52% 48%, rgba(21, 188, 223, 0.08) 0%, rgba(242, 241, 240, 0.0) 72%)'
      }}
    >
      {/* Dynamic Ambient Cyan Glow behind Centerpiece */}
      <div
        className="absolute w-[460px] h-[460px] rounded-full pointer-events-none transition-all duration-700 blur-3xl -z-10"
        style={{
          background: isPlaying
            ? 'radial-gradient(circle, rgba(21, 188, 223, 0.24) 0%, rgba(21, 188, 223, 0.06) 55%, transparent 80%)'
            : isHovered
            ? 'radial-gradient(circle, rgba(21, 188, 223, 0.16) 0%, rgba(21, 188, 223, 0.03) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(21, 188, 223, 0.10) 0%, transparent 65%)',
          transform: `translate3d(${mousePos.normalizedX * 25}px, ${mousePos.normalizedY * 18}px, 0px)`
        }}
      />

      {/* Layer 1: 3D Revolving Orb & Gyroscope Rings (BACK HEMISPHERE z < 0) */}
      <MelofyAudioReactiveCanvas
        isPlaying={isPlaying}
        mousePos={mousePos}
        shockwaves={shockwaves}
        reducedMotion={shouldReduceMotion || false}
        renderLayer="back"
        rotAngles={rotAngles}
      />

      {/* Layer 2: Centerpiece Artwork / Media with Drag & Resize Capabilities */}
      <div
        ref={artworkBoxRef}
        onPointerDown={isAdminMode ? handleArtworkPointerDown : undefined}
        className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-75 ${
          isAdminMode ? 'cursor-move pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          transform: `translate3d(${artworkOffset.x + mousePos.normalizedX * 6}px, ${artworkOffset.y + mousePos.normalizedY * 4}px, 0px) scale(${artworkScale})`
        }}
      >
        <div className="relative w-[85%] max-w-[520px] h-[85%] flex items-center justify-center group/artwork">
          {heroMediaType === 'video' ? (
            <video
              src={heroMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover filter transition-all duration-500 ease-out pointer-events-none"
              style={{
                mixBlendMode: 'multiply',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
                borderRadius: '16px'
              }}
            />
          ) : (
            <img
              src={heroMediaUrl}
              alt="Custom Studio Story Artwork"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter transition-all duration-500 ease-out pointer-events-none"
              style={{
                mixBlendMode: 'multiply',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)'
              }}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/couple.png') {
                  target.src = '/couple.png';
                }
              }}
            />
          )}

          {/* Interactive Drag & Resize Bounding Frame: ONLY in Admin Mode on Hover or Active Interaction */}
          {isAdminMode && (
            <div className="absolute inset-0 border border-dashed border-[var(--accent)]/60 rounded-2xl pointer-events-none opacity-0 group-hover/artwork:opacity-100 transition-opacity duration-200">
              {/* Corner Resize Handles */}
              <div
                onPointerDown={handleResizePointerDown}
                className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[var(--accent)] text-[#171A1C] shadow-md flex items-center justify-center cursor-ne-resize pointer-events-auto hover:scale-125 transition-transform"
                title="Drag to resize artwork"
              >
                <span className="w-2 h-2 rounded-full bg-[#171A1C]" />
              </div>
              <div
                onPointerDown={handleResizePointerDown}
                className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full bg-[var(--accent)] text-[#171A1C] shadow-md flex items-center justify-center cursor-se-resize pointer-events-auto hover:scale-125 transition-transform"
                title="Drag to resize artwork"
              >
                <span className="w-2 h-2 rounded-full bg-[#171A1C]" />
              </div>
              <div
                onPointerDown={handleResizePointerDown}
                className="absolute -bottom-2.5 -left-2.5 w-6 h-6 rounded-full bg-[var(--accent)] text-[#171A1C] shadow-md flex items-center justify-center cursor-sw-resize pointer-events-auto hover:scale-125 transition-transform"
                title="Drag to resize artwork"
              >
                <span className="w-2 h-2 rounded-full bg-[#171A1C]" />
              </div>
              <div
                onPointerDown={handleResizePointerDown}
                className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[var(--accent)] text-[#171A1C] shadow-md flex items-center justify-center cursor-nw-resize pointer-events-auto hover:scale-125 transition-transform"
                title="Drag to resize artwork"
              >
                <span className="w-2 h-2 rounded-full bg-[#171A1C]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layer 3: 3D Revolving Orb, 360° Visualizer Equalizer Circle & Particles (FRONT HEMISPHERE z >= 0) */}
      <MelofyAudioReactiveCanvas
        isPlaying={isPlaying}
        mousePos={mousePos}
        shockwaves={shockwaves}
        reducedMotion={shouldReduceMotion || false}
        renderLayer="front"
        rotAngles={rotAngles}
      />

      {/* User Drag & Resize Floating Controls Dock: ONLY in Admin Mode */}
      {isAdminMode && (
        <div
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/95 dark:bg-[#13181F]/95 backdrop-blur-md border border-[var(--accent)]/40 shadow-xl z-30 transition-all duration-300 opacity-90 hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="p-1.5 rounded-full hover:bg-[#171A1C]/[0.08] dark:hover:bg-white/10 text-[#171A1C] dark:text-white transition-colors cursor-pointer"
            title="Zoom Out Artwork"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-code text-[11px] font-semibold text-[#171A1C] dark:text-white min-w-[40px] text-center select-none">
            {Math.round(artworkScale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="p-1.5 rounded-full hover:bg-[#171A1C]/[0.08] dark:hover:bg-white/10 text-[#171A1C] dark:text-white transition-colors cursor-pointer"
            title="Zoom In Artwork"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-[#171A1C]/15 dark:bg-white/15 mx-0.5" />

          <div
            className="flex items-center gap-1 text-[11px] font-body text-[#6B6F72] dark:text-[#9CA3AF] px-1 select-none"
            title="Drag anywhere on image to reposition artwork"
          >
            <Move className="w-3 h-3 text-[var(--accent)]" />
            <span className="hidden sm:inline text-[10px]">Drag to Position</span>
          </div>

          <div className="w-[1px] h-3.5 bg-[#171A1C]/15 dark:bg-white/15 mx-0.5" />

          {/* Quick Direct Image Upload in Admin Dock */}
          <input
            type="file"
            ref={directFileInputRef}
            accept="image/*,video/*"
            onChange={handleDirectImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => directFileInputRef.current?.click()}
            disabled={isUploadingMedia}
            className="p-1.5 px-2 rounded-full hover:bg-[var(--accent)]/15 text-[#171A1C] dark:text-white hover:text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-body"
            title="Upload/Replace Centerpiece Artwork"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline text-[10px] font-medium">
              {isUploadingMedia ? 'Saving...' : 'Change Image'}
            </span>
          </button>

          {(artworkScale !== 1.0 || artworkOffset.x !== 0 || artworkOffset.y !== 0) && (
            <>
              <div className="w-[1px] h-3.5 bg-[#171A1C]/15 dark:bg-white/15 mx-0.5" />
              <button
                type="button"
                onClick={handleResetArtwork}
                className="p-1.5 rounded-full hover:bg-[#171A1C]/[0.08] dark:hover:bg-white/10 text-[#6B6F72] dark:text-[#9CA3AF] hover:text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1"
                title="Reset Position & Zoom"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[10px] hidden md:inline">Reset</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
