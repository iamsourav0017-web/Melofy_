import React, { useEffect, useRef, useState } from 'react';

export interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  objectFitClass?: string;
  loop?: boolean;
  muted?: boolean;
  playbackRate?: number;
  autoPlay?: boolean;
  onVideoReady?: () => void;
}

/**
 * LazyVideo Component
 * Renders an instant poster image placeholder frame 0 so the UI displays immediately.
 * Defers video binary fetching & attaching until component enters viewport or DOM settles,
 * then smoothly cross-fades from poster placeholder to live video once ready.
 */
export const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className = '',
  objectFitClass = 'object-cover',
  loop = true,
  muted = true,
  playbackRate = 1.0,
  autoPlay = true,
  onVideoReady
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 1. Intersection Observer / Deferred Video Attachment
  useEffect(() => {
    if (!src) return;

    // Use IntersectionObserver to start binary load when near/in viewport, or fallback after short micro-idle delay
    let observer: IntersectionObserver | null = null;

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setShouldLoadVideo(true);
            if (observer && containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        },
        { rootMargin: '200px 0px' } // Pre-trigger 200px before scrolling into view
      );
      observer.observe(containerRef.current);
    } else {
      // Fallback: defer by 50ms to guarantee zero layout blocking
      const timer = setTimeout(() => setShouldLoadVideo(true), 50);
      return () => clearTimeout(timer);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src]);

  // 2. Control Playback Rate & Sync
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current && isVideoLoaded) {
      videoRef.current.playbackRate = playbackRate || 1.0;
      if (autoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy fallback
          });
        }
      }
    }
  }, [shouldLoadVideo, isVideoLoaded, playbackRate, autoPlay]);

  const handleVideoReady = () => {
    setIsVideoLoaded(true);
    setHasError(false);
    if (onVideoReady) {
      onVideoReady();
    }
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full h-full ${className}`}>
      {/* Instant Poster Image & Ambient Backdrop Placeholder (Frame 0 Render) */}
      <div
        className={`absolute inset-0 w-full h-full bg-gradient-to-tr from-[var(--bg-main)] via-[var(--card-bg)] to-[var(--bg-main)] transition-opacity duration-700 ease-out z-0 pointer-events-none ${
          isVideoLoaded && !hasError ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {poster && (
          <img
            src={poster}
            alt="Hero Background Poster Placeholder"
            loading="eager"
            decoding="async"
            className={`w-full h-full ${objectFitClass} opacity-80 filter brightness-90 contrast-105`}
          />
        )}
      </div>

      {/* Lazy Loaded Video binary layer */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={handleVideoReady}
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onPlaying={handleVideoReady}
          onPlay={handleVideoReady}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full ${objectFitClass} z-10 transition-opacity duration-700 ease-in-out ${
            isVideoLoaded && !hasError ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
