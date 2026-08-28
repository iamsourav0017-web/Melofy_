import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  CheckCircle,
  Save,
  RotateCcw,
  Palette,
  Music,
  FileText,
  DollarSign,
  Inbox,
  Lock,
  Key,
  Play,
  Pause,
  Image as ImageIcon,
  Film,
  UploadCloud,
  FileAudio,
  Volume2,
  Sparkles,
  Move,
  ZoomIn,
  Video
} from 'lucide-react';
import {
  Track,
  PricingTier,
  InquirySubmission,
  FullSiteContent,
  SiteThemeConfig,
  SiteBrandConfig,
  GenreCategory
} from '../types';
import { THEME_PRESETS } from '../data/defaultData';
import { studioAudio } from '../utils/audioEngine';
import { optimizeImageFile, idbSet, idbSetAudio, idbRemoveAudio } from '../utils/mediaStorage';
import { MelofyLogo } from './MelofyLogo';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  pricingTiers: PricingTier[];
  inquiries: InquirySubmission[];
  siteContent: FullSiteContent;
  themeConfig: SiteThemeConfig;
  brandConfig: SiteBrandConfig;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onUpdateTracks: (tracks: Track[]) => void;
  onUpdatePricing: (pricing: PricingTier[]) => void;
  onUpdateInquiryStatus: (id: string, status: InquirySubmission['status']) => void;
  onUpdateSiteContent: (content: FullSiteContent) => void;
  onUpdateThemeConfig: (theme: SiteThemeConfig) => void;
  onUpdateBrandConfig: (brand: Partial<SiteBrandConfig>) => void;
  onResetDefaults: () => void;
  onAuthChange?: (isAuthed: boolean) => void;
  initialTab?: 'brand' | 'video' | 'theme' | 'tracks' | 'writings' | 'pricing' | 'inquiries' | 'security';
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  tracks,
  pricingTiers,
  inquiries,
  siteContent,
  themeConfig,
  brandConfig,
  onUpdateTracks,
  onUpdatePricing,
  onUpdateInquiryStatus,
  onUpdateSiteContent,
  onUpdateThemeConfig,
  onUpdateBrandConfig,
  onResetDefaults,
  onAuthChange,
  initialTab = 'brand'
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('melofy_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'brand' | 'video' | 'theme' | 'tracks' | 'writings' | 'pricing' | 'inquiries' | 'security'>(
    initialTab
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Track Form state
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackCategory, setTrackCategory] = useState<GenreCategory>('wedding');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackDuration, setTrackDuration] = useState(60);
  const [trackAudioUrl, setTrackAudioUrl] = useState('');
  const [trackSynthPreset, setTrackSynthPreset] = useState<Track['synthPreset']>('romantic_piano');
  const [trackBpm, setTrackBpm] = useState(90);
  const [trackKey, setTrackKey] = useState('Db Major');
  const [trackOccasion, setTrackOccasion] = useState('Wedding First Dance');
  const [trackStory, setTrackStory] = useState('');
  const [trackArtwork, setTrackArtwork] = useState('');
  const [trackIsFeatured, setTrackIsFeatured] = useState(false);
  const [trackUploadedFileName, setTrackUploadedFileName] = useState<string | null>(null);
  const [trackUploadedFileSize, setTrackUploadedFileSize] = useState<string | null>(null);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);

  // Audio File Input Ref
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Brand Form State
  const [logoText, setLogoText] = useState(brandConfig.logoText || 'melofy');
  const [logoTagline, setLogoTagline] = useState(brandConfig.logoTagline || 'YOUR STORY, TURNED INTO A SONG.');
  const [logoIcon, setLogoIcon] = useState(brandConfig.logoIcon || 'soundwave');
  const [logoImageUrl, setLogoImageUrl] = useState(brandConfig.logoImageUrl || '');
  const [heroArtworkUrl, setHeroArtworkUrl] = useState(brandConfig.heroArtworkUrl || '/couple.png');
  const [heroArtworkType, setHeroArtworkType] = useState<'image' | 'video'>(brandConfig.heroArtworkType || 'image');
  const [heroArtworkScale, setHeroArtworkScale] = useState<number>(brandConfig.heroArtworkScale ?? 1.0);
  const [heroArtworkOffsetX, setHeroArtworkOffsetX] = useState<number>(brandConfig.heroArtworkOffsetX ?? 0);
  const [heroArtworkOffsetY, setHeroArtworkOffsetY] = useState<number>(brandConfig.heroArtworkOffsetY ?? 0);
  const [orbRotationSpeed, setOrbRotationSpeed] = useState(brandConfig.orbRotationSpeed || 1);
  const [orbParticleDensity, setOrbParticleDensity] = useState(brandConfig.orbParticleDensity || 500);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [mediaUploadedFileName, setMediaUploadedFileName] = useState<string | null>(null);

  // Media & Logo File Input Refs
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgVideoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingBgVideo, setIsDraggingBgVideo] = useState(false);

  // Sync state when modal opens or brandConfig updates
  useEffect(() => {
    if (isOpen) {
      setLogoText(brandConfig.logoText || 'melofy');
      setLogoTagline(brandConfig.logoTagline || 'YOUR STORY, TURNED INTO A SONG.');
      setLogoIcon(brandConfig.logoIcon || 'soundwave');
      setLogoImageUrl(brandConfig.logoImageUrl || '');
      setHeroArtworkUrl(brandConfig.heroArtworkUrl || '/couple.png');
      setHeroArtworkType(brandConfig.heroArtworkType || 'image');
      setHeroArtworkScale(brandConfig.heroArtworkScale ?? 1.0);
      setHeroArtworkOffsetX(brandConfig.heroArtworkOffsetX ?? 0);
      setHeroArtworkOffsetY(brandConfig.heroArtworkOffsetY ?? 0);
      setOrbRotationSpeed(brandConfig.orbRotationSpeed || 1);
      setOrbParticleDensity(brandConfig.orbParticleDensity || 500);
    }
  }, [isOpen, brandConfig]);

  // Security / Passcode State
  const [currentPasscodeInput, setCurrentPasscodeInput] = useState('');
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Audio Testing in Admin
  const [playingTestTrackId, setPlayingTestTrackId] = useState<string | null>(null);

  // Flash Feedback
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const showFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 3500);
  };

  const getStoredPasscode = () => {
    return localStorage.getItem('melofy_admin_passcode') || 'melofy###2026';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPasscode = getStoredPasscode();
    if (passwordInput === storedPasscode) {
      setIsAuthenticated(true);
      localStorage.setItem('melofy_admin_auth', 'true');
      onAuthChange?.(true);
      setAuthError('');
      showFlash('Admin mode unlocked successfully!');
    } else {
      setAuthError('Incorrect passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('melofy_admin_auth');
    onAuthChange?.(false);
    onClose();
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    const storedPasscode = getStoredPasscode();
    if (currentPasscodeInput !== storedPasscode) {
      setPasscodeError('Current passcode does not match.');
      return;
    }

    if (newPasscodeInput.length < 6) {
      setPasscodeError('New passcode must be at least 6 characters long.');
      return;
    }

    if (newPasscodeInput !== confirmPasscodeInput) {
      setPasscodeError('New passcodes do not match.');
      return;
    }

    localStorage.setItem('melofy_admin_passcode', newPasscodeInput);
    setPasscodeSuccess('Passcode updated securely.');
    setCurrentPasscodeInput('');
    setNewPasscodeInput('');
    setConfirmPasscodeInput('');
    showFlash('Admin passcode updated!');
  };

  // --------------------------------------------------------------------------
  // AUDIO FILE UPLOADER (.mp3, .wav, .ogg, .m4a)
  // --------------------------------------------------------------------------
  const processAudioFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      showFlash('Please upload a valid audio file (.wav, .mp3, .ogg, .m4a)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setTrackAudioUrl(dataUrl);
        setTrackUploadedFileName(file.name);
        setTrackUploadedFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

        // Auto-fill track title if empty
        if (!trackTitle.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTrackTitle(cleanName);
        }

        // Try reading duration from audio element
        const tempAudio = new Audio();
        tempAudio.src = dataUrl;
        tempAudio.onloadedmetadata = () => {
          if (tempAudio.duration && isFinite(tempAudio.duration)) {
            setTrackDuration(Math.round(tempAudio.duration));
          }
        };

        showFlash(`Audio file "${file.name}" uploaded successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
    // Reset file input target value so re-selecting the same file name triggers onChange
    e.target.value = '';
  };

  const handleAudioDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingAudio(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  // --------------------------------------------------------------------------
  // MEDIA FILE UPLOADER (Picture / Video for Hero Orb & Centerpiece)
  // --------------------------------------------------------------------------
  const processMediaFile = async (file: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|mov|ogg)$/i);
    const isImage = file.type.startsWith('image/') || !!file.name.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i);

    if (!isVideo && !isImage) {
      showFlash('Please upload an image (PNG/JPG/SVG/WebP) or video (MP4/WebM)');
      return;
    }

    try {
      showFlash(`Optimizing and saving ${isVideo ? 'video' : 'picture'} for 3D Orb...`);
      const optimizedDataUrl = await optimizeImageFile(file);
      
      setHeroArtworkUrl(optimizedDataUrl);
      setHeroArtworkType(isVideo ? 'video' : 'image');
      setMediaUploadedFileName(file.name);
      
      // Auto-persist immediately so user never loses their uploaded artwork
      onUpdateBrandConfig({
        heroArtworkUrl: optimizedDataUrl,
        heroArtworkType: isVideo ? 'video' : 'image'
      });
      
      showFlash(`${isVideo ? 'Video' : 'Picture'} "${file.name}" saved & applied to 3D Orb!`);
    } catch (err) {
      console.error('Failed to process image file:', err);
      showFlash('Failed to process image file. Please try a different format.');
    }
  };

  const handleMediaFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processMediaFile(file);
    }
  };

  const handleMediaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingMedia(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processMediaFile(file);
    }
  };

  // --------------------------------------------------------------------------
  // LOGO IMAGE UPLOADER
  // --------------------------------------------------------------------------
  const handleLogoFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        showFlash('Optimizing logo image...');
        const optimizedLogoUrl = await optimizeImageFile(file, 600, 0.9);
        setLogoImageUrl(optimizedLogoUrl);
        onUpdateBrandConfig({
          logoImageUrl: optimizedLogoUrl
        });
        showFlash(`Brand logo image saved and updated!`);
      } catch (err) {
        console.error('Logo upload error:', err);
      }
    }
  };

  // --------------------------------------------------------------------------
  // SAVE HANDLERS
  // --------------------------------------------------------------------------
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrandConfig({
      logoText,
      logoTagline,
      logoIcon,
      logoImageUrl: logoImageUrl.trim() || undefined,
      heroArtworkUrl: heroArtworkUrl.trim() || '/couple.png',
      heroArtworkType,
      heroArtworkScale,
      heroArtworkOffsetX,
      heroArtworkOffsetY,
      orbRotationSpeed,
      orbParticleDensity
    });
    showFlash('Brand & Hero 3D Orb settings updated successfully!');
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim()) return;

    const trackId = editingTrackId || `track_${Date.now()}`;
    const cleanAudioUrl = trackAudioUrl.trim() || undefined;

    const newTrack: Track = {
      id: trackId,
      title: trackTitle.trim(),
      genre: trackGenre.trim() || 'Romantic / Cinematic',
      category: trackCategory,
      description: trackDesc.trim() || 'Custom composed studio track.',
      duration: Number(trackDuration) || 60,
      audioUrl: cleanAudioUrl,
      synthPreset: trackSynthPreset,
      bpm: Number(trackBpm) || 90,
      scaleKey: trackKey.trim() || 'C Major',
      occasion: trackOccasion.trim() || 'Custom Story',
      clientStory: trackStory.trim() || 'Studio commissioned track.',
      artwork: trackArtwork.trim() || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
      isFeatured: trackIsFeatured,
      published: true,
      tags: [trackGenre.trim(), trackOccasion.trim(), trackKey.trim()]
    };

    let updated: Track[];
    if (editingTrackId) {
      updated = tracks.map((t) => (t.id === editingTrackId ? newTrack : t));
    } else {
      updated = [newTrack, ...tracks];
    }

    if (trackIsFeatured) {
      updated = updated.map((t) => (t.id === newTrack.id ? t : { ...t, isFeatured: false }));
    }

    // Persist audio and tracks directly to IndexedDB immediately for 100% durable persistence
    if (cleanAudioUrl && (cleanAudioUrl.startsWith('data:') || cleanAudioUrl.startsWith('blob:'))) {
      idbSetAudio(trackId, cleanAudioUrl).catch(console.error);
    }
    idbSet('melofy_tracks_v3', updated).catch(console.error);

    onUpdateTracks(updated);
    resetTrackForm();
    showFlash(editingTrackId ? 'Track updated & saved to studio storage!' : 'New sample track added to studio catalogue!');
  };

  const handleEditTrack = (t: Track) => {
    setEditingTrackId(t.id);
    setTrackTitle(t.title);
    setTrackGenre(t.genre);
    setTrackCategory(t.category);
    setTrackDesc(t.description);
    setTrackDuration(t.duration);
    setTrackAudioUrl(t.audioUrl || '');
    setTrackSynthPreset(t.synthPreset);
    setTrackBpm(t.bpm);
    setTrackKey(t.scaleKey);
    setTrackOccasion(t.occasion);
    setTrackStory(t.clientStory);
    setTrackArtwork(t.artwork || '');
    setTrackIsFeatured(t.isFeatured || false);
    setTrackUploadedFileName(t.audioUrl?.startsWith('data:') ? 'Custom Uploaded Audio' : null);
    setTrackUploadedFileSize(null);
  };

  const handleDeleteTrack = (id: string) => {
    if (confirm('Are you sure you want to remove this track from catalogue?')) {
      const updated = tracks.filter((t) => t.id !== id);
      idbRemoveAudio(id).catch(() => {});
      idbSet('melofy_tracks_v3', updated).catch(console.error);
      onUpdateTracks(updated);
      showFlash('Track removed from studio catalogue.');
    }
  };

  const resetTrackForm = () => {
    setEditingTrackId(null);
    setTrackTitle('');
    setTrackGenre('');
    setTrackCategory('wedding');
    setTrackDesc('');
    setTrackDuration(60);
    setTrackAudioUrl('');
    setTrackSynthPreset('romantic_piano');
    setTrackBpm(90);
    setTrackKey('Db Major');
    setTrackOccasion('Wedding First Dance');
    setTrackStory('');
    setTrackArtwork('');
    setTrackIsFeatured(false);
    setTrackUploadedFileName(null);
    setTrackUploadedFileSize(null);
  };

  const handleTogglePlayTest = (track: Track) => {
    if (playingTestTrackId === track.id) {
      studioAudio.pause();
      setPlayingTestTrackId(null);
    } else {
      studioAudio.playTrack({
        id: track.id,
        audioUrl: track.audioUrl,
        synthPreset: track.synthPreset,
        duration: track.duration
      });
      setPlayingTestTrackId(track.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#13181F] text-white border border-white/10 rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flash Message Banner */}
        {flashMessage && (
          <div className="bg-[var(--accent)] text-[#171A1C] px-4 py-2 font-display font-semibold text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{flashMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-[#171D25] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[#171A1C] flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">
                  Melofy Studio Admin Portal
                </h2>
                <span className="font-code text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
                  Active
                </span>
              </div>
              <p className="font-body text-xs text-[#9CA3AF]">
                Manage branding, uploaded audio tracks, media visualizers, themes, and client orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="font-body text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Lock Admin
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#9CA3AF] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Admin Authentication Required
              </h3>
              <p className="font-body text-xs text-[#9CA3AF] mt-1">
                Enter your studio master passcode to access track catalog, uploads, and site configuration.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#171D25] border border-white/15 text-white font-mono text-sm text-center tracking-widest focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
                {authError && (
                  <p className="font-body text-xs text-rose-400 mt-2">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[var(--accent)] text-[#171A1C] font-body font-bold text-xs tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-md"
              >
                Unlock Studio Admin
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 p-3 bg-[#171D25]/70 border-b md:border-b-0 md:border-r border-white/10 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-x-visible">
              <button
                type="button"
                onClick={() => setActiveTab('brand')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'brand'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Brand & Orb Media</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'video'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Background Video Player</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'theme'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Themes & Styling</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tracks')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'tracks'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Tracks & Audio Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('writings')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'writings'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Site Content & Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'pricing'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pricing Packages</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'inquiries'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Inquiries ({inquiries.length})</span>
              </button>

              <div className="hidden md:block my-2 border-t border-white/10" />

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'security'
                    ? 'bg-[var(--accent)] text-[#171A1C]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Passcode & Security</span>
              </button>
            </div>

            {/* Scrollable Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB: BRAND & ORB MEDIA */}
              {activeTab === 'brand' && (
                <form onSubmit={handleSaveBrand} className="space-y-6">
                  {/* Studio Logo & Navbar Identity */}
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                        <span>Studio Logo & Navbar Identity</span>
                      </h3>
                      {logoImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoImageUrl('');
                            showFlash('Reverted to Master Vector Emblem');
                          }}
                          className="font-body text-xs text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Master Vector Emblem</span>
                        </button>
                      )}
                    </div>

                    {/* Live Interactive Logo Preview Box */}
                    <div className="p-4 rounded-xl bg-[#0F1318] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="font-code text-[10px] text-[#9CA3AF] uppercase block mb-1">
                          Live Logo Preview (Navbar Layout)
                        </span>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/5 inline-flex items-center">
                          <MelofyLogo
                            brandConfig={{
                              logoText: logoText || 'melofy',
                              logoTagline: logoTagline || 'YOUR STORY, TURNED INTO A SONG.',
                              logoIcon,
                              logoImageUrl: logoImageUrl || undefined
                            }}
                            size="md"
                            showTagline={true}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-code text-[10px] text-[#9CA3AF] uppercase block mb-1">
                          Active Representation
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-code font-bold">
                          <Sparkles className="w-3 h-3" />
                          {logoImageUrl ? 'Custom Image Asset' : 'Master Vector Emblem'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Brand / Logo Wordmark
                        </label>
                        <input
                          type="text"
                          value={logoText}
                          onChange={(e) => setLogoText(e.target.value)}
                          placeholder="e.g. melofy"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Subtitle / Tagline
                        </label>
                        <input
                          type="text"
                          value={logoTagline}
                          onChange={(e) => setLogoTagline(e.target.value)}
                          placeholder="e.g. YOUR STORY, TURNED INTO A SONG."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Vector Icon Style (When Not Using Image)
                        </label>
                        <select
                          value={logoIcon}
                          onChange={(e) => setLogoIcon(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                        >
                          <option value="soundwave">Dynamic Soundwave Bars (Master)</option>
                          <option value="disc">Revolving Vinyl Disc</option>
                          <option value="music">Studio Eighth Note</option>
                          <option value="sparkle">Minimalist Sparkle</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Custom Logo Graphic (Upload PNG/SVG/JPG)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={logoFileInputRef}
                            accept="image/*"
                            onChange={handleLogoFileInputChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-[#1B2129] border border-white/15 text-white hover:border-[var(--accent)] font-body text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>Browse File</span>
                          </button>
                          {logoImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoImageUrl('');
                                showFlash('Logo image removed');
                              }}
                              className="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                              title="Clear logo image (revert to vector)"
                            >
                              Remove Image
                            </button>
                          )}
                          <span className="font-body text-[11px] text-[#9CA3AF] truncate max-w-[140px]">
                            {logoImageUrl ? 'Image active' : 'Vector icon active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Media & 3D Orb Controls with Direct Picture/Video Uploader & Drag/Resize Options */}
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-[var(--accent)]" />
                        <span>Hero Centerpiece Media & 3D Orb Settings</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setHeroArtworkUrl('/couple.png');
                          setHeroArtworkType('image');
                          setHeroArtworkScale(1.0);
                          setHeroArtworkOffsetX(0);
                          setHeroArtworkOffsetY(0);
                          setMediaUploadedFileName(null);
                          showFlash('Reverted centerpiece to default studio couple artwork.');
                        }}
                        className="font-body text-xs text-[#9CA3AF] hover:text-white flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Default Artwork</span>
                      </button>
                    </div>

                    {/* Drag-and-Drop Media Upload Dropzone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingMedia(true);
                      }}
                      onDragLeave={() => setIsDraggingMedia(false)}
                      onDrop={handleMediaDrop}
                      onClick={() => mediaFileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 select-none ${
                        isDraggingMedia
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-[0.99]'
                          : 'border-white/20 bg-[#1B2129]/80 hover:border-[var(--accent)] hover:bg-white/[0.03]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={mediaFileInputRef}
                        accept="image/*,video/*"
                        onChange={handleMediaFileInputChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-xs text-white">
                          Drop custom image (PNG/JPG/SVG/WebP) or video (MP4/WebM) here
                        </p>
                        <p className="font-body text-[11px] text-[#9CA3AF] mt-0.5">
                          Or click to browse from device (auto-scales inside the 3D revolving orb)
                        </p>
                      </div>

                      {mediaUploadedFileName && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-xs font-code font-bold mt-2">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Uploaded: {mediaUploadedFileName}</span>
                        </div>
                      )}
                    </div>

                    {/* Media Preview & URL Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Media Type
                        </label>
                        <select
                          value={heroArtworkType}
                          onChange={(e) => setHeroArtworkType(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                        >
                          <option value="image">Still Image / Illustration</option>
                          <option value="video">Ambient Video Loop (MP4/WebM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Media URL or Path (Manual Override)
                        </label>
                        <input
                          type="text"
                          value={heroArtworkUrl}
                          onChange={(e) => setHeroArtworkUrl(e.target.value)}
                          placeholder="/couple.png or https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    {/* Drag & Resize Sizing Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 p-4 rounded-xl bg-[#1B2129]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-[var(--accent)]" />
                            <span>Artwork Scale ({Math.round(heroArtworkScale * 100)}%)</span>
                          </label>
                        </div>
                        <input
                          type="range"
                          min="0.4"
                          max="2.2"
                          step="0.05"
                          value={heroArtworkScale}
                          onChange={(e) => setHeroArtworkScale(Number(e.target.value))}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Horizontal Offset ({heroArtworkOffsetX}px)
                        </label>
                        <input
                          type="range"
                          min="-120"
                          max="120"
                          step="2"
                          value={heroArtworkOffsetX}
                          onChange={(e) => setHeroArtworkOffsetX(Number(e.target.value))}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Vertical Offset ({heroArtworkOffsetY}px)
                        </label>
                        <input
                          type="range"
                          min="-120"
                          max="120"
                          step="2"
                          value={heroArtworkOffsetY}
                          onChange={(e) => setHeroArtworkOffsetY(Number(e.target.value))}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          3D Orb Rotation Speed Multiplier ({orbRotationSpeed}x)
                        </label>
                        <input
                          type="range"
                          min="0.2"
                          max="3"
                          step="0.1"
                          value={orbRotationSpeed}
                          onChange={(e) => setOrbRotationSpeed(Number(e.target.value))}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Particle Density ({orbParticleDensity} nodes)
                        </label>
                        <input
                          type="range"
                          min="200"
                          max="1000"
                          step="50"
                          value={orbParticleDensity}
                          onChange={(e) => setOrbParticleDensity(Number(e.target.value))}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-bold text-xs tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Brand & Media Settings</span>
                  </button>
                </form>
              )}

              {/* TAB: THEMES & COLORS */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[var(--accent)]" />
                      <span>Studio Theme Presets</span>
                    </h3>
                    <p className="font-body text-xs text-[#9CA3AF]">
                      Select from curated light, dark, and aesthetic themes. Selecting a preset applies it in real time.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      {THEME_PRESETS.map((preset) => {
                        const isCurrent = themeConfig.themePresetName === preset.themePresetName;
                        return (
                          <div
                            key={preset.themePresetName}
                            onClick={() => {
                              onUpdateThemeConfig(preset);
                              showFlash(`Switched theme to ${preset.themePresetName}!`);
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                              isCurrent
                                ? 'border-[var(--accent)] bg-white/10 shadow-md ring-1 ring-[var(--accent)]'
                                : 'border-white/10 bg-[#1B2129] hover:border-white/25 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-xs text-white">
                                {preset.themePresetName}
                              </span>
                              {isCurrent && (
                                <span className="font-code text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[#171A1C] font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </div>

                            {/* Color preview chips */}
                            <div className="flex items-center gap-2 pt-1">
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: preset.backgroundColor }}
                                title="Background"
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: preset.accentColor }}
                                title="Accent Color"
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: preset.textColor }}
                                title="Typography Color"
                              />
                              <span className="font-code text-[10px] text-[#9CA3AF] uppercase ml-auto">
                                {preset.mode}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Fine-Tuning */}
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <h3 className="font-display font-bold text-base text-white">
                      Custom Color & Font Palette
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Signature Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={themeConfig.accentColor}
                            onChange={(e) => onUpdateThemeConfig({ ...themeConfig, accentColor: e.target.value })}
                            className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeConfig.accentColor}
                            onChange={(e) => onUpdateThemeConfig({ ...themeConfig, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={themeConfig.backgroundColor}
                            onChange={(e) => onUpdateThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                            className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeConfig.backgroundColor}
                            onChange={(e) => onUpdateThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Typography Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={themeConfig.textColor}
                            onChange={(e) => onUpdateThemeConfig({ ...themeConfig, textColor: e.target.value })}
                            className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeConfig.textColor}
                            onChange={(e) => onUpdateThemeConfig({ ...themeConfig, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TRACKS & AUDIO UPLOAD */}
              {activeTab === 'tracks' && (
                <div className="space-y-6">
                  {/* Track Add/Edit Form */}
                  <form onSubmit={handleSaveTrack} className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <Music className="w-4 h-4 text-[var(--accent)]" />
                        <span>{editingTrackId ? 'Edit Catalogue Track' : 'Add New Sample Track or Audio'}</span>
                      </h3>
                      {editingTrackId && (
                        <button
                          type="button"
                          onClick={resetTrackForm}
                          className="font-body text-xs font-semibold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Dedicated Drag-and-Drop Audio File Uploader (.wav, .mp3, .ogg, .m4a) */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingAudio(true);
                      }}
                      onDragLeave={() => setIsDraggingAudio(false)}
                      onDrop={handleAudioDrop}
                      onClick={() => audioFileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 select-none ${
                        isDraggingAudio
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-[0.99]'
                          : 'border-white/20 bg-[#1B2129]/80 hover:border-[var(--accent)] hover:bg-white/[0.03]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={audioFileInputRef}
                        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac,audio/*"
                        onChange={handleAudioFileInputChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-xs text-white">
                          Drop Audio File (.wav, .mp3, .ogg, .m4a) here
                        </p>
                        <p className="font-body text-[11px] text-[#9CA3AF] mt-0.5">
                          Or click to browse from device. Automatically analyzes duration & integrates with studio player!
                        </p>
                      </div>

                      {trackAudioUrl && (
                        <div className="flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-xs font-code font-semibold mt-2" onClick={(e) => e.stopPropagation()}>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{trackUploadedFileName || 'Custom Audio Loaded'}</span>
                          {trackUploadedFileSize && <span>({trackUploadedFileSize})</span>}
                          
                          {/* Live preview button for uploaded audio */}
                          <button
                            type="button"
                            onClick={() => {
                              if (playingTestTrackId === 'preview_upload') {
                                studioAudio.pause();
                                setPlayingTestTrackId(null);
                              } else {
                                studioAudio.playTrack({
                                  id: 'preview_upload',
                                  audioUrl: trackAudioUrl,
                                  synthPreset: trackSynthPreset,
                                  duration: Number(trackDuration) || 60
                                });
                                setPlayingTestTrackId('preview_upload');
                              }
                            }}
                            className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-[#171A1C] hover:bg-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {playingTestTrackId === 'preview_upload' ? (
                              <>
                                <Pause className="w-2.5 h-2.5 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Test Audio</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (playingTestTrackId === 'preview_upload') {
                                studioAudio.pause();
                                setPlayingTestTrackId(null);
                              }
                              setTrackAudioUrl('');
                              setTrackUploadedFileName(null);
                              setTrackUploadedFileSize(null);
                            }}
                            className="ml-2 hover:text-white transition-colors"
                            title="Remove audio file"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Track Title
                        </label>
                        <input
                          type="text"
                          required
                          value={trackTitle}
                          onChange={(e) => setTrackTitle(e.target.value)}
                          placeholder="e.g. Until We Said Forever"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Genre / Style
                        </label>
                        <input
                          type="text"
                          required
                          value={trackGenre}
                          onChange={(e) => setTrackGenre(e.target.value)}
                          placeholder="e.g. Romantic / Cinematic"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Synthesizer Preset (Fallback / Acoustic Mode)
                        </label>
                        <select
                          value={trackSynthPreset}
                          onChange={(e) => setTrackSynthPreset(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs cursor-pointer"
                        >
                          <option value="romantic_piano">Romantic Grand Piano</option>
                          <option value="indo_fusion">Raag Yaman Sitar & Beats</option>
                          <option value="retro_classical">70s Retro Classical Orchestral</option>
                          <option value="dance_pop">Modern Synth-Pop Groove</option>
                          <option value="bollywood_orchestra">Grand Bollywood Strings Swell</option>
                          <option value="acoustic_guitar">Warm Folk Acoustic Guitar</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Occasion Tag
                        </label>
                        <input
                          type="text"
                          value={trackOccasion}
                          onChange={(e) => setTrackOccasion(e.target.value)}
                          placeholder="e.g. Wedding First Dance"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Duration (seconds)
                        </label>
                        <input
                          type="number"
                          value={trackDuration}
                          onChange={(e) => setTrackDuration(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          External Audio URL (Optional fallback)
                        </label>
                        <input
                          type="text"
                          value={trackAudioUrl}
                          onChange={(e) => setTrackAudioUrl(e.target.value)}
                          placeholder="https://... or uploaded above"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                        Client Story & Inspiration Brief
                      </label>
                      <textarea
                        rows={2}
                        value={trackStory}
                        onChange={(e) => setTrackStory(e.target.value)}
                        placeholder="Commissioned for a Lake Como wedding, weaving college memories..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={trackIsFeatured}
                          onChange={(e) => setTrackIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded-md accent-[var(--accent)] cursor-pointer"
                        />
                        <span className="font-body text-xs text-white">
                          Mark as Featured Track (Auto-plays on website arrival)
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-bold text-xs tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all cursor-pointer flex items-center gap-2 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingTrackId ? 'Update Track' : 'Add Track to Catalogue'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Existing Track List */}
                  <div className="bg-[#171D25] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 font-display font-bold text-sm text-white flex items-center justify-between">
                      <span>Published Studio Tracks ({tracks.length})</span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {tracks.map((t) => (
                        <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePlayTest(t)}
                              className="w-8 h-8 rounded-full bg-[var(--accent)] text-[#171A1C] flex items-center justify-center cursor-pointer hover:scale-105 transition-all shrink-0"
                            >
                              {playingTestTrackId === t.id ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-sm text-white">
                                  {t.title}
                                </span>
                                {t.isFeatured && (
                                  <span className="font-code text-[9px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[#171A1C] font-bold">
                                    FEATURED
                                  </span>
                                )}
                                {t.audioUrl && (
                                  <span className="font-code text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                    AUDIO ATTACHED
                                  </span>
                                )}
                              </div>
                              <span className="font-body text-xs text-[#9CA3AF]">
                                {t.genre} • {t.duration}s • {t.synthPreset}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleEditTrack(t)}
                              className="p-2 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Edit Track"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrack(t.id)}
                              className="p-2 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Track"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: INQUIRIES & ORDERS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="bg-[#171D25] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 font-display font-bold text-sm text-white flex items-center justify-between">
                      <span>Submitted Client Inquiries ({inquiries.length})</span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {inquiries.length === 0 ? (
                        <div className="p-8 text-center text-[#9CA3AF] font-body text-xs">
                          No inquiries received yet.
                        </div>
                      ) : (
                        inquiries.map((inq) => (
                          <div key={inq.id} className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-display font-bold text-sm text-white">
                                  {inq.name}
                                </span>
                                <span className="text-[#9CA3AF] text-xs ml-2">
                                  ({inq.email} {inq.phone ? `• ${inq.phone}` : ''})
                                </span>
                              </div>
                              <select
                                value={inq.status}
                                onChange={(e) => onUpdateInquiryStatus(inq.id, e.target.value as any)}
                                className="px-2.5 py-1 rounded-lg bg-[#1B2129] border border-white/10 text-white font-code text-[11px] cursor-pointer"
                              >
                                <option value="new">New</option>
                                <option value="in_review">In Review</option>
                                <option value="in_composition">In Composition</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>
                            <p className="font-body text-xs text-[#D1D5DB] italic bg-[#1B2129] p-3 rounded-xl">
                              "{inq.story}"
                            </p>
                            <div className="font-code text-[10px] text-[#9CA3AF] flex gap-3">
                              <span>Occasion: {inq.occasion}</span>
                              <span>Package: {inq.preferredPackage}</span>
                              <span>Created: {new Date(inq.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PRICING PACKAGES */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <h3 className="font-display font-bold text-base text-white">
                      Custom Studio Pricing Packages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pricingTiers.map((tier, idx) => (
                        <div key={tier.id} className="p-4 rounded-xl bg-[#1B2129] border border-white/10 space-y-3">
                          <div>
                            <span className="font-display font-bold text-sm text-white">{tier.name}</span>
                            <input
                              type="text"
                              value={tier.price}
                              onChange={(e) => {
                                const next = [...pricingTiers];
                                next[idx] = { ...tier, price: e.target.value };
                                onUpdatePricing(next);
                              }}
                              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-[#13181F] border border-white/10 text-white font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-code text-[10px] text-[#9CA3AF] uppercase block mb-1">
                              Delivery Timeline
                            </label>
                            <input
                              type="text"
                              value={tier.deliveryTime}
                              onChange={(e) => {
                                const next = [...pricingTiers];
                                next[idx] = { ...tier, deliveryTime: e.target.value };
                                onUpdatePricing(next);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#13181F] border border-white/10 text-white font-body text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: WRITINGS / CONTENT */}
              {activeTab === 'writings' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <h3 className="font-display font-bold text-base text-white">
                      Hero Section Headlines & Taglines
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Studio Badge
                        </label>
                        <input
                          type="text"
                          value={siteContent.hero.studioBadge}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, studioBadge: e.target.value }
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Heading Line 1
                          </label>
                          <input
                            type="text"
                            value={siteContent.hero.mainHeadingLine1}
                            onChange={(e) =>
                              onUpdateSiteContent({
                                ...siteContent,
                                hero: { ...siteContent.hero, mainHeadingLine1: e.target.value }
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Heading Line 2
                          </label>
                          <input
                            type="text"
                            value={siteContent.hero.mainHeadingLine2}
                            onChange={(e) =>
                              onUpdateSiteContent({
                                ...siteContent,
                                hero: { ...siteContent.hero, mainHeadingLine2: e.target.value }
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* About Section Writings */}
                    <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                      <h3 className="font-display font-bold text-sm text-white">About Section Writings</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Section Badge
                          </label>
                          <input
                            type="text"
                            value={siteContent.about.badge}
                            onChange={(e) =>
                              onUpdateSiteContent({
                                ...siteContent,
                                about: { ...siteContent.about, badge: e.target.value }
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Heading Line 1
                          </label>
                          <input
                            type="text"
                            value={siteContent.about.headingLine1}
                            onChange={(e) =>
                              onUpdateSiteContent({
                                ...siteContent,
                                about: { ...siteContent.about, headingLine1: e.target.value }
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Heading Accent
                          </label>
                          <input
                            type="text"
                            value={siteContent.about.headingAccent}
                            onChange={(e) =>
                              onUpdateSiteContent({
                                ...siteContent,
                                about: { ...siteContent.about, headingAccent: e.target.value }
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Tagline / Subtext
                        </label>
                        <input
                          type="text"
                          value={siteContent.about.tagline}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              about: { ...siteContent.about, tagline: e.target.value }
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                          Main Story Paragraph
                        </label>
                        <textarea
                          rows={3}
                          value={siteContent.about.mainParagraph}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              about: { ...siteContent.about, mainParagraph: e.target.value }
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#1B2129] border border-white/10 text-white font-body text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BACKGROUND VIDEO PLAYER */}
              {activeTab === 'video' && (
                <div className="space-y-6">
                  {/* Master Background Video Switch & Info */}
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-[var(--accent)]" />
                          <span>Landing Area Background Video Player</span>
                        </h3>
                        <p className="font-body text-xs text-[#9CA3AF] mt-0.5">
                          Stream a cinematic video loop directly in the background canvas behind the hero and landing sections.
                        </p>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer select-none self-start sm:self-auto">
                        <input
                          type="checkbox"
                          checked={siteContent.hero.enableBackgroundVideo !== false}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, enableBackgroundVideo: enabled }
                            });
                            showFlash(enabled ? 'Background video enabled!' : 'Background video disabled');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]" />
                        <span className="ml-3 font-code text-xs font-semibold text-white">
                          {siteContent.hero.enableBackgroundVideo !== false ? 'VIDEO ENABLED' : 'VIDEO DISABLED'}
                        </span>
                      </label>
                    </div>

                    {/* Quick Preset Video Selection */}
                    <div className="pt-2">
                      <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-2">
                        Curated Studio Video Presets
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          {
                            name: 'Soundwaves Flow',
                            url: 'https://assets.mixkit.co/videos/preview/mixkit-sound-waves-moving-on-a-dark-background-42999-large.mp4',
                            desc: 'Kinetic acoustic sine waves'
                          },
                          {
                            name: 'Concert Lights & Bokeh',
                            url: 'https://assets.mixkit.co/videos/preview/mixkit-concert-lights-flashing-with-smoke-41584-large.mp4',
                            desc: 'Warm analog stage bokeh'
                          },
                          {
                            name: 'Vinyl Turntable Studio',
                            url: 'https://assets.mixkit.co/videos/preview/mixkit-playing-a-vinyl-record-on-a-turntable-41804-large.mp4',
                            desc: 'Vintage analog disc motion'
                          }
                        ].map((preset) => {
                          const isCurrent = siteContent.hero.backgroundVideoUrl === preset.url;
                          return (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => {
                                onUpdateSiteContent({
                                  ...siteContent,
                                  hero: {
                                    ...siteContent.hero,
                                    enableBackgroundVideo: true,
                                    backgroundVideoUrl: preset.url
                                  }
                                });
                                showFlash(`Applied ${preset.name} video!`);
                              }}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-white ring-1 ring-[var(--accent)]'
                                  : 'bg-[#1B2129] border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20'
                              }`}
                            >
                              <div className="font-display font-bold text-xs text-white flex items-center justify-between">
                                <span>{preset.name}</span>
                                {isCurrent && (
                                  <span className="font-code text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[#171A1C] font-bold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="font-body text-[11px] mt-0.5 text-[#9CA3AF] truncate">
                                {preset.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upload / Custom URL Input */}
                    <div className="space-y-3 pt-2">
                      <label className="font-code text-[11px] text-[#9CA3AF] uppercase block">
                        Video Source (Direct URL or Local Video File)
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          value={siteContent.hero.backgroundVideoUrl || ''}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, backgroundVideoUrl: e.target.value }
                            })
                          }
                          placeholder="https://.../video.mp4 or data:video/mp4;..."
                          className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                        
                        {/* Hidden Video File Input */}
                        <input
                          ref={bgVideoFileInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              showFlash(`Loading video "${file.name}"...`);
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const dataUrl = event.target?.result as string;
                                if (dataUrl) {
                                  onUpdateSiteContent({
                                    ...siteContent,
                                    hero: {
                                      ...siteContent.hero,
                                      enableBackgroundVideo: true,
                                      backgroundVideoUrl: dataUrl
                                    }
                                  });
                                  showFlash(`Video "${file.name}" loaded successfully!`);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => bgVideoFileInputRef.current?.click()}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1B2129] border border-white/15 text-white hover:border-[var(--accent)] hover:text-[var(--accent)] font-body text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                        >
                          <UploadCloud className="w-4 h-4 text-[var(--accent)]" />
                          <span>Upload Video File</span>
                        </button>
                      </div>

                      {/* Drag and Drop Zone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingBgVideo(true);
                        }}
                        onDragLeave={() => setIsDraggingBgVideo(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingBgVideo(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file && (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i))) {
                            showFlash(`Loading dropped video "${file.name}"...`);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              if (dataUrl) {
                                onUpdateSiteContent({
                                  ...siteContent,
                                  hero: {
                                    ...siteContent.hero,
                                    enableBackgroundVideo: true,
                                    backgroundVideoUrl: dataUrl
                                  }
                                });
                                showFlash(`Video "${file.name}" applied as background!`);
                              }
                            };
                            reader.readAsDataURL(file);
                          } else {
                            showFlash('Please drop a valid video file (.mp4, .webm, .mov)');
                          }
                        }}
                        onClick={() => bgVideoFileInputRef.current?.click()}
                        className={`p-4 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                          isDraggingBgVideo
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-[0.99]'
                            : 'border-white/10 bg-[#1B2129]/60 hover:border-white/20'
                        }`}
                      >
                        <Film className="w-5 h-5 text-[var(--accent)] mx-auto mb-1.5 opacity-80" />
                        <p className="font-body text-xs text-white">
                          Drag & drop any video file here, or <span className="text-[var(--accent)] underline">browse files</span>
                        </p>
                        <p className="font-code text-[10px] text-[#9CA3AF] mt-0.5">
                          Supports MP4, WebM, QuickTime MOV (Instant client-side playback)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Adjustments & Transparency Controls */}
                  <div className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-5">
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[var(--accent)]" />
                      <span>Transparency, Sizing & Visual Controls</span>
                    </h3>

                    {/* Row 1: Transparency / Opacity & Fit Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Opacity / Transparency Slider */}
                      <div className="p-4 rounded-xl bg-[#1B2129] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase">
                            Video Opacity / Transparency
                          </label>
                          <span className="font-mono text-xs font-bold text-[var(--accent)]">
                            {Math.round((siteContent.hero.backgroundVideoOpacity ?? 0.35) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={siteContent.hero.backgroundVideoOpacity ?? 0.35}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, backgroundVideoOpacity: Number(e.target.value) }
                            })
                          }
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                        <div className="flex justify-between font-code text-[10px] text-[#6B7280]">
                          <span>0% (Transparent)</span>
                          <span>50% (Balanced)</span>
                          <span>100% (Solid)</span>
                        </div>
                      </div>

                      {/* Video Object Fit Mode */}
                      <div className="p-4 rounded-xl bg-[#1B2129] space-y-2">
                        <label className="font-code text-[11px] text-[#9CA3AF] uppercase block">
                          Video Fit & Scaling Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'cover', label: 'Cover (Fill & Crop)' },
                            { value: 'contain', label: 'Contain (Letterbox)' },
                            { value: 'fill', label: 'Fill (Stretch exact)' },
                            { value: 'scale-down', label: 'Scale Down' }
                          ].map((fitOption) => {
                            const isCurrent = (siteContent.hero.backgroundVideoFit || 'cover') === fitOption.value;
                            return (
                              <button
                                key={fitOption.value}
                                type="button"
                                onClick={() => {
                                  onUpdateSiteContent({
                                    ...siteContent,
                                    hero: {
                                      ...siteContent.hero,
                                      backgroundVideoFit: fitOption.value as any
                                    }
                                  });
                                }}
                                className={`px-2.5 py-2 rounded-lg font-body text-xs text-center border transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[var(--accent)] text-[#171A1C] font-bold border-[var(--accent)]'
                                    : 'bg-[#171D25] text-[#9CA3AF] hover:text-white border-white/10'
                                }`}
                              >
                                {fitOption.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Loop Mode, Audio Mute, Playback Speed */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Loop Mode Switch */}
                      <div className="p-4 rounded-xl bg-[#1B2129] flex flex-col justify-between">
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Loop Playback Mode
                          </label>
                          <p className="font-body text-[11px] text-[#9CA3AF]">
                            Continuously cycle video seamlessly.
                          </p>
                        </div>
                        <div className="pt-3">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={siteContent.hero.backgroundVideoLoop !== false}
                              onChange={(e) =>
                                onUpdateSiteContent({
                                  ...siteContent,
                                  hero: { ...siteContent.hero, backgroundVideoLoop: e.target.checked }
                                })
                              }
                              className="w-4 h-4 accent-[var(--accent)] rounded"
                            />
                            <span className="font-body text-xs font-semibold text-white">
                              {siteContent.hero.backgroundVideoLoop !== false ? 'Loop Enabled' : 'Play Once'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Video Audio Muted Switch */}
                      <div className="p-4 rounded-xl bg-[#1B2129] flex flex-col justify-between">
                        <div>
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                            Video Audio Channel
                          </label>
                          <p className="font-body text-[11px] text-[#9CA3AF]">
                            Mute video sound to allow studio tracks to play.
                          </p>
                        </div>
                        <div className="pt-3">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={siteContent.hero.backgroundVideoMuted !== false}
                              onChange={(e) =>
                                onUpdateSiteContent({
                                  ...siteContent,
                                  hero: { ...siteContent.hero, backgroundVideoMuted: e.target.checked }
                                })
                              }
                              className="w-4 h-4 accent-[var(--accent)] rounded"
                            />
                            <span className="font-body text-xs font-semibold text-white">
                              {siteContent.hero.backgroundVideoMuted !== false ? 'Muted (Recommended)' : 'Video Audio Active'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Playback Speed Rate */}
                      <div className="p-4 rounded-xl bg-[#1B2129] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-code text-[11px] text-[#9CA3AF] uppercase">
                            Playback Speed
                          </label>
                          <span className="font-mono text-xs font-bold text-[var(--accent)]">
                            {siteContent.hero.backgroundVideoPlaybackRate || 1.0}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.25"
                          max="2.0"
                          step="0.25"
                          value={siteContent.hero.backgroundVideoPlaybackRate || 1.0}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, backgroundVideoPlaybackRate: Number(e.target.value) }
                            })
                          }
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                        <div className="flex justify-between font-code text-[10px] text-[#6B7280]">
                          <span>0.25x (Slow-Mo)</span>
                          <span>1.0x</span>
                          <span>2.0x (Fast)</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Visual Filters (Blur, Brightness, Contrast, Overlay Tint) */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                      {/* Blur */}
                      <div className="p-3.5 rounded-xl bg-[#1B2129] space-y-1.5">
                        <div className="flex justify-between">
                          <label className="font-code text-[10px] text-[#9CA3AF] uppercase">
                            Blur Filter
                          </label>
                          <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
                            {siteContent.hero.backgroundVideoBlur ?? 0}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="1"
                          value={siteContent.hero.backgroundVideoBlur ?? 0}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, backgroundVideoBlur: Number(e.target.value) }
                            })
                          }
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="p-3.5 rounded-xl bg-[#1B2129] space-y-1.5">
                        <div className="flex justify-between">
                          <label className="font-code text-[10px] text-[#9CA3AF] uppercase">
                            Brightness
                          </label>
                          <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
                            {siteContent.hero.backgroundVideoBrightness ?? 95}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="150"
                          step="5"
                          value={siteContent.hero.backgroundVideoBrightness ?? 95}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, backgroundVideoBrightness: Number(e.target.value) }
                            })
                          }
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="p-3.5 rounded-xl bg-[#1B2129] space-y-1.5">
                        <div className="flex justify-between">
                          <label className="font-code text-[10px] text-[#9CA3AF] uppercase">
                            Contrast
                          </label>
                          <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
                            {siteContent.hero.backgroundVideoContrast ?? 105}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="160"
                          step="5"
                          value={siteContent.hero.backgroundVideoContrast ?? 105}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: { ...siteContent.hero, backgroundVideoContrast: Number(e.target.value) }
                            })
                          }
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      {/* Overlay Tint Style */}
                      <div className="p-3.5 rounded-xl bg-[#1B2129] space-y-1.5">
                        <label className="font-code text-[10px] text-[#9CA3AF] uppercase block">
                          Overlay Tint
                        </label>
                        <select
                          value={siteContent.hero.backgroundVideoOverlayTint || 'vignette'}
                          onChange={(e) =>
                            onUpdateSiteContent({
                              ...siteContent,
                              hero: {
                                ...siteContent.hero,
                                backgroundVideoOverlayTint: e.target.value as any
                              }
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#171D25] border border-white/10 text-white font-body text-xs"
                        >
                          <option value="none">None (Raw Video)</option>
                          <option value="vignette">Studio Vignette</option>
                          <option value="gradient">Vertical Fade</option>
                          <option value="dark">Cinematic Dark Tint</option>
                          <option value="subtle">Subtle Blend</option>
                        </select>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSiteContent({
                            ...siteContent,
                            hero: {
                              ...siteContent.hero,
                              enableBackgroundVideo: true,
                              backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sound-waves-moving-on-a-dark-background-42999-large.mp4',
                              backgroundVideoOpacity: 0.35,
                              backgroundVideoFit: 'cover',
                              backgroundVideoBlur: 0,
                              backgroundVideoBrightness: 95,
                              backgroundVideoContrast: 105,
                              backgroundVideoLoop: true,
                              backgroundVideoMuted: true,
                              backgroundVideoPlaybackRate: 1.0,
                              backgroundVideoOverlayTint: 'vignette'
                            }
                          });
                          showFlash('Background video settings reset to default studio presets.');
                        }}
                        className="font-body text-xs text-[#9CA3AF] hover:text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Video Settings to Default</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => showFlash('Video settings updated and applied live!')}
                        className="py-2 px-5 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-bold text-xs tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Apply & Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SECURITY / PASSCODE */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-lg">
                  <form onSubmit={handleChangePasscode} className="p-5 rounded-2xl bg-[#171D25] border border-white/10 space-y-4">
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-[var(--accent)]" />
                      <span>Change Master Admin Passcode</span>
                    </h3>

                    {passcodeSuccess && (
                      <p className="font-body text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl">
                        {passcodeSuccess}
                      </p>
                    )}
                    {passcodeError && (
                      <p className="font-body text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl">
                        {passcodeError}
                      </p>
                    )}

                    <div>
                      <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                        Current Passcode
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPasscodeInput}
                        onChange={(e) => setCurrentPasscodeInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                        New Passcode (min. 6 characters)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasscodeInput}
                        onChange={(e) => setNewPasscodeInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="font-code text-[11px] text-[#9CA3AF] uppercase block mb-1">
                        Confirm New Passcode
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPasscodeInput}
                        onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B2129] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-bold text-xs tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
                    >
                      Update Passcode
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
