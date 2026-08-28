/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PortfolioSection } from './components/PortfolioSection';
import { PricingSection } from './components/PricingSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModals';
import { AdminModal } from './components/AdminModal';
import { BuilderBar } from './components/BuilderBar';
import { AdminTriggerDot } from './components/AdminTriggerDot';
import { Page3DCanvas } from './components/Page3DCanvas';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { GlobalMelodyPlayer } from './components/GlobalMelodyPlayer';
import { UserProfileModal } from './components/UserProfileModal';
import { AcousticWaveDivider } from './components/InteractiveEffects';

import {
  DEFAULT_TRACKS,
  DEFAULT_PRICING,
  DEFAULT_SITE_CONTENT,
  DEFAULT_THEME_CONFIG,
  DEFAULT_BRAND_CONFIG,
  DEFAULT_USER_ORDERS
} from './data/defaultData';
import {
  Track,
  PricingTier,
  InquirySubmission,
  FullSiteContent,
  SiteThemeConfig,
  SiteBrandConfig,
  UserProfile,
  UserOrder
} from './types';
import { studioAudio } from './utils/audioEngine';
import { applyThemeToDOM, normalizeThemeConfig } from './utils/themeHelper';
import {
  safeGetStorage,
  safeSetStorage,
  idbGet,
  idbSet,
  idbClear,
  idbGetAudio,
  idbSetAudio
} from './utils/mediaStorage';

export default function App() {
  const [isStorageHydrated, setIsStorageHydrated] = useState<boolean>(false);

  // 1. Site Theme & Font Architecture with local persistence and automatic contrast normalization
  const [themeConfig, setThemeConfig] = useState<SiteThemeConfig>(() => {
    const stored = safeGetStorage('melofy_theme_v1', DEFAULT_THEME_CONFIG);
    return normalizeThemeConfig(stored);
  });

  // 2. Brand Identity & 3D Media Visualizer config
  const [brandConfig, setBrandConfig] = useState<SiteBrandConfig>(() => {
    return safeGetStorage('melofy_brand_v1', DEFAULT_BRAND_CONFIG);
  });

  // 3. Full Site Copy / Content Architecture with local persistence
  const [siteContent, setSiteContent] = useState<FullSiteContent>(() => {
    const stored = safeGetStorage<FullSiteContent>('melofy_content_v1', DEFAULT_SITE_CONTENT);
    
    // Normalize and clean up About section fields if corrupted or duplicating hero badge
    const rawAboutBadge = stored.about?.badge || '';
    const cleanAboutBadge =
      !rawAboutBadge || rawAboutBadge.toUpperCase().includes('KOLKATA') || rawAboutBadge.toUpperCase().includes('CUSTOM MUSIC STUDIO')
        ? 'ABOUT MELOFY'
        : rawAboutBadge;

    const cleanHeadingLine1 =
      stored.about?.headingLine1 && stored.about.headingLine1.trim() !== ''
        ? stored.about.headingLine1
        : DEFAULT_SITE_CONTENT.about.headingLine1;

    const cleanHeadingAccent =
      stored.about?.headingAccent && stored.about.headingAccent.trim() !== ''
        ? stored.about.headingAccent
        : DEFAULT_SITE_CONTENT.about.headingAccent;

    return {
      ...DEFAULT_SITE_CONTENT,
      ...stored,
      hero: {
        ...DEFAULT_SITE_CONTENT.hero,
        ...(stored.hero || {})
      },
      about: {
        ...DEFAULT_SITE_CONTENT.about,
        ...(stored.about || {}),
        badge: cleanAboutBadge,
        headingLine1: cleanHeadingLine1,
        headingAccent: cleanHeadingAccent
      },
      howItWorks: {
        ...DEFAULT_SITE_CONTENT.howItWorks,
        ...(stored.howItWorks || {})
      },
      portfolio: {
        ...DEFAULT_SITE_CONTENT.portfolio,
        ...(stored.portfolio || {})
      },
      pricing: {
        ...DEFAULT_SITE_CONTENT.pricing,
        ...(stored.pricing || {})
      },
      contact: {
        ...DEFAULT_SITE_CONTENT.contact,
        ...(stored.contact || {})
      },
      footer: {
        ...DEFAULT_SITE_CONTENT.footer,
        ...(stored.footer || {})
      }
    };
  });

  // 4. Live In-Place Click-To-Edit Builder Mode & Admin State
  const [isAdminActive, setIsAdminActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('melofy_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // 5. Studio Data with local persistence
  const [tracks, setTracks] = useState<Track[]>(() => {
    return safeGetStorage('melofy_tracks_v3', DEFAULT_TRACKS);
  });

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(() => {
    return safeGetStorage('melofy_pricing_v3', DEFAULT_PRICING);
  });

  const [inquiries, setInquiries] = useState<InquirySubmission[]>(() => {
    return safeGetStorage('melofy_inquiries_v3', []);
  });

  // 6. User Authentication & Profile Hub
  const [user, setUser] = useState<UserProfile | null>(() => {
    return safeGetStorage('melofy_user_session', null);
  });

  const [userOrders, setUserOrders] = useState<UserOrder[]>(() => {
    return safeGetStorage('melofy_user_orders', DEFAULT_USER_ORDERS);
  });

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Audio Playback State
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(54);

  // Active section for Scroll-Spy
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Contact Form pre-fill package
  const [selectedPackage, setSelectedPackage] = useState<string>('STANDARD');

  // Modals state
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'brand' | 'video' | 'theme' | 'tracks' | 'writings' | 'pricing' | 'inquiries' | 'security'>('brand');

  // Initial async hydration from IndexedDB (handles high-res uploaded artwork, background videos, and audio tracks)
  useEffect(() => {
    let isMounted = true;

    async function hydrateStorage() {
      try {
        const [
          idbTracksRes,
          idbContentRes,
          idbBrandRes,
          idbThemeRes,
          idbPricingRes,
          idbInquiriesRes,
          idbOrdersRes
        ] = await Promise.allSettled([
          idbGet<Track[]>('melofy_tracks_v3'),
          idbGet<FullSiteContent>('melofy_content_v1'),
          idbGet<SiteBrandConfig>('melofy_brand_v1'),
          idbGet<SiteThemeConfig>('melofy_theme_v1'),
          idbGet<PricingTier[]>('melofy_pricing_v3'),
          idbGet<InquirySubmission[]>('melofy_inquiries_v3'),
          idbGet<UserOrder[]>('melofy_user_orders')
        ]);

        if (!isMounted) return;

        // 1. Tracks hydration with audio integrity recovery (only update if custom audio blobs exist)
        if (idbTracksRes.status === 'fulfilled' && idbTracksRes.value && Array.isArray(idbTracksRes.value) && idbTracksRes.value.length > 0) {
          const loadedTracks = idbTracksRes.value;
          let hasAudioBlobRestored = false;
          const enrichedTracks = await Promise.all(
            loadedTracks.map(async (t) => {
              if (!t.audioUrl || !t.audioUrl.startsWith('data:')) {
                try {
                  const individualAudio = await idbGetAudio(t.id);
                  if (individualAudio) {
                    hasAudioBlobRestored = true;
                    return { ...t, audioUrl: individualAudio };
                  }
                } catch (_) {}
              }
              return t;
            })
          );
          if (hasAudioBlobRestored) {
            setTracks(enrichedTracks);
          }
        }

        // 2. Site Content hydration (only if custom background video or distinct copy exists)
        if (idbContentRes.status === 'fulfilled' && idbContentRes.value && idbContentRes.value.hero) {
          const contentVal = idbContentRes.value;
          if (contentVal.hero?.backgroundVideoUrl && contentVal.hero.backgroundVideoUrl.startsWith('data:')) {
            setSiteContent((prev) => ({
              ...prev,
              ...contentVal,
              hero: {
                ...prev.hero,
                ...(contentVal.hero || {})
              }
            }));
          }
        }

        // 3. Brand Config hydration
        if (idbBrandRes.status === 'fulfilled' && idbBrandRes.value && idbBrandRes.value.heroArtworkUrl?.startsWith('data:')) {
          setBrandConfig((prev) => ({
            ...prev,
            ...idbBrandRes.value
          }));
        }

        // 4. Pricing hydration
        if (idbPricingRes.status === 'fulfilled' && idbPricingRes.value && Array.isArray(idbPricingRes.value) && idbPricingRes.value.length > 0) {
          setPricingTiers(idbPricingRes.value);
        }

        // 5. Inquiries hydration
        if (idbInquiriesRes.status === 'fulfilled' && idbInquiriesRes.value && Array.isArray(idbInquiriesRes.value)) {
          setInquiries(idbInquiriesRes.value);
        }

        // 6. Orders hydration
        if (idbOrdersRes.status === 'fulfilled' && idbOrdersRes.value && Array.isArray(idbOrdersRes.value)) {
          setUserOrders(idbOrdersRes.value);
        }
      } catch (err) {
        console.warn('[Storage] Hydration error fallback', err);
      } finally {
        if (isMounted) {
          setIsStorageHydrated(true);
        }
      }
    }

    hydrateStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Theme CSS Variables & Dark/Light Mode to Root DOM
  useEffect(() => {
    const normalized = normalizeThemeConfig(themeConfig);
    if (isStorageHydrated) {
      safeSetStorage('melofy_theme_v1', normalized);
    }
    applyThemeToDOM(normalized);
  }, [themeConfig, isStorageHydrated]);

  // Sync Brand Config to local storage & IndexedDB
  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('melofy_brand_v1', brandConfig);
  }, [brandConfig, isStorageHydrated]);

  // Sync Content to local storage & IndexedDB (including background video)
  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('melofy_content_v1', siteContent);
  }, [siteContent, isStorageHydrated]);

  // Sync Data to local storage & IndexedDB (including uploaded sample audio tracks)
  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('melofy_tracks_v3', tracks);
    tracks.forEach((t) => {
      if (t.audioUrl && (t.audioUrl.startsWith('data:') || t.audioUrl.startsWith('blob:'))) {
        idbSetAudio(t.id, t.audioUrl).catch(() => {});
      }
    });
  }, [tracks, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('melofy_pricing_v3', pricingTiers);
  }, [pricingTiers, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('melofy_inquiries_v3', inquiries);
  }, [inquiries, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('melofy_user_orders', userOrders);
  }, [userOrders, isStorageHydrated]);

  // Audio Engine Hookup & Automatic Autoplay on visit
  useEffect(() => {
    studioAudio.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
      },
      (playing, trackId) => {
        setIsPlaying(playing);
        if (trackId) setCurrentTrackId(trackId);
      },
      (muted) => {
        setIsMuted(muted);
      }
    );

    // Automatically start playing the featured melody track when anyone arrives
    const featured = tracks.find((t) => t.isFeatured) || tracks[0];
    if (featured) {
      studioAudio.playTrack({
        id: featured.id,
        audioUrl: featured.audioUrl,
        synthPreset: featured.synthPreset,
        duration: featured.duration
      });
    }

    // Modern browsers require a user gesture if background audio without interaction is blocked:
    // This handler guarantees instant seamless playback upon the very first user scroll, touch, or click anywhere
    const handleFirstInteraction = () => {
      const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks.find((t) => t.isFeatured) || tracks[0];
      if (!studioAudio.getIsPlaying() && currentTrack) {
        studioAudio.playTrack({
          id: currentTrack.id,
          audioUrl: currentTrack.audioUrl,
          synthPreset: currentTrack.synthPreset,
          duration: currentTrack.duration
        });
      }
      cleanupGestureListeners();
    };

    const cleanupGestureListeners = () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });

    return () => {
      cleanupGestureListeners();
      studioAudio.stop();
    };
  }, []);

  // Admin routing check: URL /admin, hash #admin, or query ?admin=true
  useEffect(() => {
    const checkAdminUrl = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      if (path === '/admin' || search.includes('admin=true') || hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkAdminUrl();
    window.addEventListener('popstate', checkAdminUrl);
    window.addEventListener('hashchange', checkAdminUrl);
    return () => {
      window.removeEventListener('popstate', checkAdminUrl);
      window.removeEventListener('hashchange', checkAdminUrl);
    };
  }, []);

  // Keyboard shortcut for Admin Panel (Ctrl+Shift+M or Cmd+Shift+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // IntersectionObserver Scroll-Spy for active navigation tracking
  useEffect(() => {
    const sectionIds = ['hero', 'about', 'portfolio', 'pricing', 'how-it-works', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Smooth scroll handler
  const handleScrollTo = (selector: string) => {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Audio Handlers (single track playback exclusivity & mute toggle)
  const handlePlayTrack = (track: Track) => {
    studioAudio.playTrack({
      id: track.id,
      audioUrl: track.audioUrl,
      synthPreset: track.synthPreset,
      duration: track.duration
    });
  };

  const handlePauseTrack = () => {
    studioAudio.pause();
  };

  const handleToggleMute = () => {
    const nextMuted = studioAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSeek = (seconds: number) => {
    studioAudio.seek(seconds);
    setCurrentTime(seconds);
  };

  const handlePlayFeaturedTrack = () => {
    if (tracks.length === 0) return;
    const featured = tracks.find((t) => t.isFeatured) || tracks[0];
    if (currentTrackId === featured.id && isPlaying) {
      handlePauseTrack();
    } else {
      handlePlayTrack(featured);
    }
  };

  // Package Selection from Pricing Section
  const handleSelectPackage = (packageName: string) => {
    setSelectedPackage(packageName);
    handleScrollTo('#contact');
    setTimeout(() => {
      const input = document.getElementById('client-name');
      if (input) input.focus();
    }, 450);
  };

  // Google Authentication Handlers
  const handleGoogleLogin = (customData?: Partial<UserProfile>) => {
    const newProfile: UserProfile = {
      id: user?.id || `usr-${Date.now()}`,
      name: customData?.name || 'Aarav Sharma',
      email: customData?.email || 'aarav.sharma@gmail.com',
      avatar: customData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      provider: 'google',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    setUser(newProfile);
    localStorage.setItem('melofy_user_session', JSON.stringify(newProfile));
  };

  const handleLogoutUser = () => {
    setUser(null);
    localStorage.removeItem('melofy_user_session');
  };

  // Inquiry Submission & Automatic Order Link
  const handleSubmitInquiry = async (
    submission: Omit<InquirySubmission, 'id' | 'createdAt' | 'status'>
  ): Promise<boolean> => {
    const orderId = `MEL-${Date.now().toString().slice(-6)}`;
    const newInquiry: InquirySubmission = {
      ...submission,
      id: orderId,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: 'new'
    };

    setInquiries((prev) => [newInquiry, ...prev]);

    // Create rich tracking order for user
    const priceMap: Record<string, number> = {
      BASIC: 2500,
      STANDARD: 4500,
      PREMIUM: 8000
    };

    const newOrder: UserOrder = {
      id: orderId,
      userId: user?.id || 'guest',
      userEmail: submission.email,
      userName: submission.name,
      packageTier: submission.preferredPackage || 'STANDARD',
      amount: priceMap[submission.preferredPackage] || 4500,
      currency: 'INR',
      occasion: submission.occasion,
      genre: submission.preferredGenre || 'Romantic / Cinematic',
      language: submission.language || 'Hindi / Hinglish',
      storyBrief: submission.story,
      status: 'brief_received',
      statusProgress: 20,
      orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedDeliveryDate: '3-5 Studio Days',
      deliveredAudioTitle: `${submission.occasion} Song (In Production)`,
      invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
      revisionsRemaining: submission.preferredPackage === 'PREMIUM' ? 5 : submission.preferredPackage === 'STANDARD' ? 3 : 2,
      timelineEvents: [
        {
          title: 'Story Brief Received',
          description: 'Your memories and genre preferences submitted to lead producer.',
          date: 'Today',
          completed: true
        },
        {
          title: 'Melody Sketch & Lyric Draft',
          description: 'Writing bespoke verse & chorus lyrics based on your notes.',
          date: 'In 24 hours',
          completed: false,
          current: true
        },
        {
          title: 'Vocal Recording & Instrumentation',
          description: 'Analog instrumentation and vocal tracking in main studio.',
          date: 'Pending sketch',
          completed: false
        },
        {
          title: 'Mixing & Mastering',
          description: 'Lossless audio polishing and stem export.',
          date: 'Pending recording',
          completed: false
        },
        {
          title: 'Final Delivery & Download',
          description: 'Complete song delivered to your profile.',
          date: 'Est. 3-5 days',
          completed: false
        }
      ]
    };

    setUserOrders((prev) => [newOrder, ...prev]);

    // Forward to backend API route if available
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      });
    } catch (_) {
      // Local fallback in state & localStorage
    }

    return true;
  };

  const handleUpdateInquiryStatus = (id: string, status: InquirySubmission['status']) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const handleResetDefaults = () => {
    if (confirm('Reset entire website (all writings, typography, colors, branding, and tracks) to studio factory defaults?')) {
      setTracks(DEFAULT_TRACKS);
      setPricingTiers(DEFAULT_PRICING);
      setSiteContent(DEFAULT_SITE_CONTENT);
      setThemeConfig(DEFAULT_THEME_CONFIG);
      setBrandConfig(DEFAULT_BRAND_CONFIG);
      setUserOrders(DEFAULT_USER_ORDERS);
      localStorage.removeItem('melofy_tracks_v3');
      localStorage.removeItem('melofy_pricing_v3');
      localStorage.removeItem('melofy_content_v1');
      localStorage.removeItem('melofy_theme_v1');
      localStorage.removeItem('melofy_brand_v1');
      localStorage.removeItem('melofy_user_orders');
      idbClear().catch(() => {});
    }
  };

  const handleOpenAdminWithTab = (tab?: 'brand' | 'video' | 'theme' | 'tracks' | 'writings' | 'pricing' | 'inquiries' | 'security') => {
    if (tab) setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  return (
    <div
      style={{
        backgroundColor: themeConfig.backgroundColor,
        color: themeConfig.textColor,
        fontFamily: `"${themeConfig.fontBody}", sans-serif`
      }}
      className="min-h-screen selection:bg-[var(--accent)] selection:text-[#171A1C] relative transition-colors duration-300"
    >
      {/* 0. Global Subtle Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* 0. Full Page Interactive 3D Audio-Particle Background Layer */}
      <Page3DCanvas
        isPlaying={isPlaying}
        activeSection={activeSection}
        enableHeroVideo={siteContent.hero.enableBackgroundVideo}
        heroVideoUrl={siteContent.hero.backgroundVideoUrl}
        heroVideoPoster={siteContent.hero.backgroundVideoPoster}
        heroVideoOpacity={siteContent.hero.backgroundVideoOpacity}
        heroVideoFit={siteContent.hero.backgroundVideoFit}
        heroVideoBlur={siteContent.hero.backgroundVideoBlur}
        heroVideoBrightness={siteContent.hero.backgroundVideoBrightness}
        heroVideoContrast={siteContent.hero.backgroundVideoContrast}
        heroVideoLoop={siteContent.hero.backgroundVideoLoop}
        heroVideoMuted={siteContent.hero.backgroundVideoMuted}
        heroVideoPlaybackRate={siteContent.hero.backgroundVideoPlaybackRate}
        heroVideoOverlayTint={siteContent.hero.backgroundVideoOverlayTint}
      />

      {/* 1. Pinned Editorial Navbar with Brand Identity & User Profile Access */}
      <Navbar
        activeSection={activeSection}
        isPlaying={isPlaying}
        isMuted={isMuted}
        brandConfig={brandConfig}
        user={user}
        onToggleMute={handleToggleMute}
        onTogglePlay={handlePlayFeaturedTrack}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 2. Hero Section (#hero) */}
      <HeroSection
        isPlaying={isPlaying}
        featuredTrack={tracks.find((t) => t.isFeatured) || tracks[0]}
        content={siteContent.hero}
        brandConfig={brandConfig}
        isEditMode={isEditMode}
        isAdminMode={isAdminOpen || isEditMode}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            hero: { ...prev.hero, ...updated }
          }))
        }
        onUpdateBrandConfig={(updated) =>
          setBrandConfig((prev) => ({
            ...prev,
            ...updated
          }))
        }
        onPlayFeaturedTrack={handlePlayFeaturedTrack}
        onScrollTo={handleScrollTo}
      />

      <AcousticWaveDivider isPlaying={isPlaying} className="opacity-75" />

      {/* 3. About Section (#about) */}
      <AboutSection
        content={siteContent.about}
        isEditMode={isEditMode}
        isPlaying={isPlaying}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            about: { ...prev.about, ...updated }
          }))
        }
      />

      {/* 4. Portfolio / Work Section (#portfolio) */}
      <PortfolioSection
        tracks={tracks}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        content={siteContent.portfolio}
        isEditMode={isEditMode}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            portfolio: { ...prev.portfolio, ...updated }
          }))
        }
        onPlayTrack={handlePlayTrack}
        onPauseTrack={handlePauseTrack}
        onSeek={handleSeek}
      />

      <AcousticWaveDivider isPlaying={isPlaying} className="opacity-75" />

      {/* 5. Pricing Section (#pricing) */}
      <PricingSection
        pricingTiers={pricingTiers}
        content={siteContent.pricing}
        isEditMode={isEditMode}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            pricing: { ...prev.pricing, ...updated }
          }))
        }
        onSelectPackage={handleSelectPackage}
      />

      <AcousticWaveDivider isPlaying={isPlaying} className="opacity-75" />

      {/* 6. How It Works (#how-it-works) */}
      <HowItWorksSection
        content={siteContent.howItWorks}
        isEditMode={isEditMode}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            howItWorks: { ...prev.howItWorks, ...updated }
          }))
        }
        onStartSong={() => {
          handleScrollTo('#contact');
          setTimeout(() => {
            const input = document.getElementById('client-name');
            if (input) input.focus();
          }, 400);
        }}
      />

      <AcousticWaveDivider isPlaying={isPlaying} className="opacity-75" />

      {/* 7. Contact Section (#contact) */}
      <ContactSection
        selectedPackage={selectedPackage}
        content={siteContent.contact}
        user={user}
        isEditMode={isEditMode}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            contact: { ...prev.contact, ...updated }
          }))
        }
        onPackageChange={setSelectedPackage}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSubmitInquiry={handleSubmitInquiry}
      />

      {/* 8. Editorial Footer */}
      <Footer
        content={siteContent.footer}
        isEditMode={isEditMode}
        onUpdateContent={(updated) =>
          setSiteContent((prev) => ({
            ...prev,
            footer: { ...prev.footer, ...updated }
          }))
        }
        onScrollTo={handleScrollTo}
        onOpenAdmin={handleOpenAdminWithTab}
      />

      {/* Global Interactive Melody Player Floating Bar */}
      <GlobalMelodyPlayer
        tracks={tracks}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        isMuted={isMuted}
        currentTime={currentTime}
        duration={duration}
        onPlayTrack={handlePlayTrack}
        onPauseTrack={handlePauseTrack}
        onToggleMute={handleToggleMute}
        onSeek={handleSeek}
      />

      {/* User Profile & Order Tracking Hub Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        orders={userOrders}
        onLoginWithGoogle={handleGoogleLogin}
        onLogout={handleLogoutUser}
      />

      {/* Real Privacy Policy and Terms of Service Dialog */}
      <LegalModal
        isOpen={legalModalType !== null}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Discreet Secret Admin Trigger: Red dot at bottom-left corner with nothing written */}
      <AdminTriggerDot
        isAdminActive={isAdminActive}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Website Builder Floating Dock - ONLY visible when Admin Mode is unlocked */}
      {isAdminActive && (
        <BuilderBar
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode((prev) => !prev)}
          onOpenFullAdmin={handleOpenAdminWithTab}
          onQuickThemeChange={(patch) =>
            setThemeConfig((prev) => ({ ...prev, ...patch }))
          }
          themeConfig={themeConfig}
          onResetDefaults={handleResetDefaults}
          onExitAdmin={() => {
            setIsAdminActive(false);
            setIsEditMode(false);
            localStorage.removeItem('melofy_admin_auth');
          }}
        />
      )}

      {/* Studio Admin & Comprehensive Website Builder Portal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        tracks={tracks}
        pricingTiers={pricingTiers}
        inquiries={inquiries}
        siteContent={siteContent}
        themeConfig={themeConfig}
        brandConfig={brandConfig}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onUpdateTracks={setTracks}
        onUpdatePricing={setPricingTiers}
        onUpdateInquiryStatus={handleUpdateInquiryStatus}
        onUpdateSiteContent={setSiteContent}
        onUpdateThemeConfig={setThemeConfig}
        onUpdateBrandConfig={setBrandConfig}
        onResetDefaults={handleResetDefaults}
        onAuthChange={(auth) => setIsAdminActive(auth)}
        initialTab={adminInitialTab}
      />
    </div>
  );
}
