export type GenreCategory = 
  | 'all' 
  | 'romantic' 
  | 'wedding' 
  | 'fusion' 
  | 'retro' 
  | 'pop' 
  | 'cinematic' 
  | 'brand' 
  | 'creator';

export interface Track {
  id: string;
  title: string;
  genre: string;
  category: GenreCategory;
  description: string;
  duration: number; // in seconds
  audioUrl?: string;
  synthPreset: 'romantic_piano' | 'indo_fusion' | 'retro_classical' | 'dance_pop' | 'bollywood_orchestra' | 'acoustic_guitar';
  bpm: number;
  scaleKey: string;
  clientStory: string;
  occasion: string;
  tags: string[];
  artwork?: string;
  isFeatured?: boolean;
  published?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  rawPrice: number;
  tag?: string;
  deliveryTime: string;
  revisions: string;
  commercialRights: boolean;
  features: string[];
  recommended?: boolean;
  ctaText: string;
}

export interface InquirySubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occasion: string;
  preferredPackage: string;
  preferredGenre?: string;
  language?: string;
  story: string;
  createdAt: string;
  status: 'new' | 'in_review' | 'in_composition' | 'delivered';
}

export interface StudioStats {
  songsCreated: number;
  happyCouples: number;
  averageRating: number;
  genresMastered: number;
}

// User Profile & Authentication Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google';
  createdAt: string;
  phone?: string;
}

export interface OrderTimelineEvent {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current?: boolean;
}

export interface UserOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  packageTier: string;
  amount: number;
  currency: string;
  occasion: string;
  genre: string;
  language?: string;
  recipientName?: string;
  storyBrief: string;
  status: 'brief_received' | 'composition' | 'tracking_vocals' | 'mixing_mastering' | 'delivered';
  statusProgress: number; // 0 to 100
  orderDate: string;
  estimatedDeliveryDate: string;
  deliveredAudioUrl?: string;
  deliveredAudioTitle?: string;
  demoSnippetUrl?: string;
  invoiceNumber: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  revisionsRemaining: number;
  timelineEvents: OrderTimelineEvent[];
}

// Site Branding & Media Configuration
export interface SiteBrandConfig {
  logoText: string;
  logoTagline: string;
  logoImageUrl?: string;
  logoIcon: 'soundwave' | 'disc' | 'music' | 'sparkle';
  heroArtworkUrl?: string;
  heroArtworkType?: 'image' | 'video';
  heroArtworkScale?: number; // e.g. 1.0 (range 0.4 to 2.5)
  heroArtworkOffsetX?: number; // px offset
  heroArtworkOffsetY?: number; // px offset
  orbSize?: number; // scale multiplier e.g. 1.0
  orbRotationSpeed?: number;
  orbParticleDensity?: number;
  orbReactiveSensitivity?: number;
}

// Full Website Builder Configuration
export interface SiteThemeConfig {
  fontHeading: 'Space Grotesk' | 'Playfair Display' | 'Syne' | 'Outfit' | 'Cinzel' | 'Cormorant Garamond' | 'DM Sans';
  fontBody: 'Inter' | 'Plus Jakarta Sans' | 'DM Sans';
  fontCode: 'JetBrains Mono';
  accentColor: string; // e.g. #15BCDF
  accentHoverColor: string; // e.g. #3FD0EF
  backgroundColor: string; // e.g. #F2F1F0 or #0B0E11
  textColor: string; // e.g. #171A1C or #F2F1F0
  cardBackgroundColor?: string; // e.g. #FFFFFF or #15191E
  cardBorderColor?: string; // e.g. rgba(23,26,28,0.08) or rgba(255,255,255,0.1)
  borderRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-none';
  themePresetName?: string;
  mode: 'light' | 'dark' | 'aesthetic';
}

export interface HeroContent {
  studioBadge: string;
  mainHeadingLine1: string;
  mainHeadingLine2: string;
  mainHeadingAccent: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  stat1Number: string;
  stat1Label: string;
  stat2Number: string;
  stat2Label: string;
  stat3Number: string;
  stat3Label: string;
  enableBackgroundVideo?: boolean;
  backgroundVideoUrl?: string;
  backgroundVideoOpacity?: number; // 0 to 1
  backgroundVideoFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  backgroundVideoBlur?: number; // 0 to 20 px
  backgroundVideoBrightness?: number; // 20 to 150 %
  backgroundVideoContrast?: number; // 50 to 150 %
  backgroundVideoLoop?: boolean; // true / false
  backgroundVideoMuted?: boolean; // true / false
  backgroundVideoPlaybackRate?: number; // 0.5 to 2.0
  backgroundVideoOverlayTint?: 'none' | 'subtle' | 'vignette' | 'gradient' | 'dark';
  backgroundVideoPoster?: string; // Poster image URL placeholder for instant initial render
}

export interface AboutValuePillar {
  title: string;
  description: string;
}

export interface AboutContent {
  badge: string;
  headingLine1: string;
  headingAccent: string;
  tagline: string;
  mainParagraph: string;
  pillar1: AboutValuePillar;
  pillar2: AboutValuePillar;
  pillar3: AboutValuePillar;
  pillar4: AboutValuePillar;
}

export interface PipelineStep {
  number: string;
  title: string;
  description: string;
  detail: string;
}

export interface HowItWorksContent {
  badge: string;
  headingLine1: string;
  headingAccent: string;
  subtitle: string;
  steps: PipelineStep[];
  ctaBannerTitle: string;
  ctaBannerSubtitle: string;
  ctaButtonText: string;
}

export interface PortfolioContent {
  badge: string;
  headingLine1: string;
  headingAccent: string;
  subtitle: string;
}

export interface PricingContent {
  badge: string;
  headingLine1: string;
  headingAccent: string;
  subtitle: string;
  reassuranceText: string;
  customScopeLinkText: string;
}

export interface ContactContent {
  badge: string;
  headingLine1: string;
  headingAccent: string;
  subtitle: string;
  guarantee1Title: string;
  guarantee1Desc: string;
  guarantee2Title: string;
  guarantee2Desc: string;
  directEmail: string;
  formSubmitText: string;
}

export interface FooterContent {
  tagline: string;
  description: string;
  location: string;
  email: string;
  copyright: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export interface FullSiteContent {
  hero: HeroContent;
  about: AboutContent;
  howItWorks: HowItWorksContent;
  portfolio: PortfolioContent;
  pricing: PricingContent;
  contact: ContactContent;
  footer: FooterContent;
}
