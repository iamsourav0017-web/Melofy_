import {
  FullSiteContent,
  Track,
  PricingTier,
  StudioStats,
  SiteThemeConfig,
  SiteBrandConfig,
  UserOrder
} from '../types';

export const THEME_PRESETS: SiteThemeConfig[] = [
  {
    themePresetName: 'Spotify Obsidian Dark',
    fontHeading: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
    fontCode: 'JetBrains Mono',
    accentColor: '#15BCDF',
    accentHoverColor: '#3FD0EF',
    backgroundColor: '#090A0C',
    textColor: '#FFFFFF',
    cardBackgroundColor: '#121418',
    cardBorderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 'rounded-2xl',
    mode: 'dark'
  },
  {
    themePresetName: 'Apple Pro Titanium Dark',
    fontHeading: 'Outfit',
    fontBody: 'Plus Jakarta Sans',
    fontCode: 'JetBrains Mono',
    accentColor: '#2997FF',
    accentHoverColor: '#60A5FA',
    backgroundColor: '#000000',
    textColor: '#F5F5F7',
    cardBackgroundColor: '#161618',
    cardBorderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 'rounded-3xl',
    mode: 'dark'
  },
  {
    themePresetName: 'Apple Studio Silver Light',
    fontHeading: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
    fontCode: 'JetBrains Mono',
    accentColor: '#0071E3',
    accentHoverColor: '#0077ED',
    backgroundColor: '#F5F5F7',
    textColor: '#1D1D1F',
    cardBackgroundColor: '#FFFFFF',
    cardBorderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 'rounded-2xl',
    mode: 'light'
  },
  {
    themePresetName: 'Spotify Sonic Emerald',
    fontHeading: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
    fontCode: 'JetBrains Mono',
    accentColor: '#1DB954',
    accentHoverColor: '#1ED760',
    backgroundColor: '#121212',
    textColor: '#FFFFFF',
    cardBackgroundColor: '#181818',
    cardBorderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 'rounded-2xl',
    mode: 'dark'
  },
  {
    themePresetName: 'Midnight Cyan Starlight',
    fontHeading: 'Syne',
    fontBody: 'Plus Jakarta Sans',
    fontCode: 'JetBrains Mono',
    accentColor: '#38BDF8',
    accentHoverColor: '#7DD3FC',
    backgroundColor: '#0B0F17',
    textColor: '#F8FAFC',
    cardBackgroundColor: '#111827',
    cardBorderColor: 'rgba(56, 189, 248, 0.16)',
    borderRadius: 'rounded-2xl',
    mode: 'dark'
  },
  {
    themePresetName: 'Silk Platinum Minimal',
    fontHeading: 'Outfit',
    fontBody: 'Plus Jakarta Sans',
    fontCode: 'JetBrains Mono',
    accentColor: '#0284C7',
    accentHoverColor: '#0369A1',
    backgroundColor: '#FAF9F6',
    textColor: '#18181B',
    cardBackgroundColor: '#FFFFFF',
    cardBorderColor: 'rgba(24, 24, 27, 0.07)',
    borderRadius: 'rounded-2xl',
    mode: 'light'
  }
];

export const DEFAULT_THEME_CONFIG: SiteThemeConfig = THEME_PRESETS[0];

export const DEFAULT_BRAND_CONFIG: SiteBrandConfig = {
  logoText: 'melofy',
  logoTagline: 'YOUR STORY, TURNED INTO A SONG.',
  logoIcon: 'soundwave',
  heroArtworkUrl: '/couple.png',
  heroArtworkType: 'image',
  heroArtworkScale: 1,
  heroArtworkOffsetX: 0,
  heroArtworkOffsetY: 0,
  orbSize: 1,
  orbRotationSpeed: 1,
  orbParticleDensity: 500,
  orbReactiveSensitivity: 1.2
};

export const DEFAULT_SITE_CONTENT: FullSiteContent = {
  hero: {
    studioBadge: 'BESPOKE MUSIC STUDIO',
    mainHeadingLine1: 'YOUR STORY,',
    mainHeadingLine2: 'TURNED INTO A',
    mainHeadingAccent: 'SONG.',
    subtitle: 'From weddings and anniversaries to personal milestones, we craft full-production original music with custom lyrics written around your real memories and emotions.',
    primaryCtaText: 'START YOUR SONG',
    secondaryCtaText: 'LISTEN TO WORK',
    stat1Number: '1,400+',
    stat1Label: 'Songs Composed',
    stat2Number: '100%',
    stat2Label: 'Original Melodies',
    stat3Number: '3-Day',
    stat3Label: 'Studio Delivery',
    enableBackgroundVideo: false,
    backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sound-waves-moving-on-a-dark-background-42999-large.mp4',
    backgroundVideoOpacity: 0.35,
    backgroundVideoFit: 'cover',
    backgroundVideoBlur: 0,
    backgroundVideoBrightness: 95,
    backgroundVideoContrast: 105,
    backgroundVideoLoop: true,
    backgroundVideoMuted: true,
    backgroundVideoPlaybackRate: 1.0,
    backgroundVideoOverlayTint: 'vignette',
    backgroundVideoPoster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80'
  },
  about: {
    badge: 'ABOUT MELOFY',
    headingLine1: 'ABOUT OUR STUDIO,',
    headingAccent: 'MUSIC FOR YOUR STORY.',
    tagline: 'Every memory has a frequency. We craft the chords, lyrics, and arrangements that immortalize yours.',
    mainParagraph: 'Melofy is a custom music studio that transforms personal stories into original songs — any genre, any occasion. Whether it’s a wedding, a proposal, an anniversary, or a signature track for your content, every song on Melofy is composed around you.',
    pillar1: {
      title: 'Purely Story-Driven',
      description: 'No generic templates. Your personal dates, inside jokes, vows, and emotions form the core lyrics and melodic arcs.'
    },
    pillar2: {
      title: 'Any Genre & Language',
      description: 'From Hindi romantic acoustic ballads and Raag-infused Indo-fusion to synth-pop, cinematic orchestra, and RnB.'
    },
    pillar3: {
      title: 'Studio Instruments & Master Mix',
      description: 'Analog warm preamps, authentic strings, grand pianos, and nuanced acoustic guitars mixed for punchy clarity.'
    },
    pillar4: {
      title: 'Studio Turnaround in 3 Days',
      description: 'Fast, dependable delivery schedule with built-in revision cycles to ensure complete artistic satisfaction.'
    }
  },
  howItWorks: {
    badge: 'THE PROCESS',
    headingLine1: 'HOW WE TURN YOUR',
    headingAccent: 'STORY INTO MUSIC.',
    subtitle: 'From initial memory brief to radio-quality master in four transparent steps.',
    steps: [
      {
        number: '01',
        title: 'Share Your Story',
        description: 'Fill out our brief with your occasion, memories, inside jokes, and favorite musical genres or mood references.',
        detail: 'Takes less than 3 minutes. Zero musical knowledge needed.'
      },
      {
        number: '02',
        title: 'Composer Review & Sketch',
        description: 'Our lead arranger reviews your story, writes custom lyrics, and drafts the initial melodic chord progression.',
        detail: 'You receive an early lyric sheet & acoustic draft.'
      },
      {
        number: '03',
        title: 'Studio Tracking & Production',
        description: 'We record vocals, layer acoustic and analog instruments, program drums, and master the track for streaming fidelity.',
        detail: 'Tracked on high-end preamps with studio session vocalists.'
      },
      {
        number: '04',
        title: 'Delivery & Revisions',
        description: 'Receive your high-res audio master, stems, and synchronized lyric sheet with guaranteed revision support.',
        detail: 'Lossless WAV, MP3 & instrumental backing track included.'
      }
    ],
    ctaBannerTitle: 'Ready to hear your own custom melody?',
    ctaBannerSubtitle: 'Submit your story in minutes. Our producers will craft your tailored outline.',
    ctaButtonText: 'START MY SONG'
  },
  portfolio: {
    badge: 'SELECTED WORKS',
    headingLine1: 'LISTEN TO STORIES',
    headingAccent: 'WE’VE COMPOSED.',
    subtitle: 'Explore real commissioned songs spanning cinematic orchestral arrangements, indie folk, and Indian fusion.'
  },
  pricing: {
    badge: 'TRANSPARENT PACKAGES',
    headingLine1: 'CHOOSE YOUR',
    headingAccent: 'STUDIO EXPERIENCE.',
    subtitle: 'Transparent, all-inclusive pricing with zero hidden fees. Every tier includes custom composition, mixing, and revisions.',
    reassuranceText: 'Need a custom enterprise arrangement or live orchestra? We also compose full documentary soundtracks and multi-track branded anthems.',
    customScopeLinkText: 'Request Custom Scope →'
  },
  contact: {
    badge: 'START YOUR SONG',
    headingLine1: 'HAVE A',
    headingAccent: 'STORY?',
    subtitle: 'Let’s turn it into something you can hear. Share a few details about your moment, and our lead composers will get back to you within 24 hours with an initial creative outline.',
    guarantee1Title: '100% Original Studio Production',
    guarantee1Desc: 'Every chord, vocal melody and lyric is written from scratch. No cookie-cutter templates.',
    guarantee2Title: 'Fast 3-Day Turnaround',
    guarantee2Desc: 'Draft delivered quickly with full creative revision cycles before final master.',
    directEmail: 'studio@melofy.com',
    formSubmitText: 'START MY SONG'
  },
  footer: {
    tagline: 'YOUR STORY, TURNED INTO A SONG.',
    description: 'A bespoke custom music studio turning personal stories, vows, milestones, and inside jokes into original studio-mastered songs.',
    location: 'Kolkata, West Bengal, India & Worldwide Remote Studio.',
    email: 'studio@melofy.com',
    copyright: '© 2026 Melofy Studio. All rights reserved.',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com'
  }
};

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Until We Said Forever',
    genre: 'Romantic / Cinematic',
    category: 'romantic',
    description: 'A story about two people finding their way back to each other across 4 time zones with sweeping strings and intimate piano.',
    duration: 54,
    synthPreset: 'romantic_piano',
    bpm: 78,
    scaleKey: 'E Major',
    clientStory: 'Commissioned for a Lake Como destination wedding. The lyrics weave their college library meetings into their shared vows.',
    occasion: 'Wedding First Dance',
    tags: ['Grand Piano', 'Emotional', 'Cello', 'Lyrical'],
    artwork: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
    isFeatured: true,
    published: true
  },
  {
    id: 'track-2',
    title: 'Monsoon Letters',
    genre: 'Bengali / Acoustic',
    category: 'creator',
    description: 'Poetic acoustic guitar and warm harmonium capturing handwritten letters exchanged during Kolkata rainy seasons.',
    duration: 58,
    synthPreset: 'acoustic_guitar',
    bpm: 82,
    scaleKey: 'A Minor',
    clientStory: 'Commissioned as a birthday surprise celebrating ten years of companionship across Kolkata and Bangalore.',
    occasion: 'Birthday & Anniversary',
    tags: ['Acoustic Guitar', 'Warm Harmonium', 'Poetic', 'Nostalgia'],
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop',
    published: true
  },
  {
    id: 'track-3',
    title: 'Echoes of Us',
    genre: 'Retro / Classical',
    category: 'retro',
    description: 'Warm analog tube saturation and 1970s Bollywood orchestral phrasing honoring 50 years of marriage.',
    duration: 62,
    synthPreset: 'retro_classical',
    bpm: 88,
    scaleKey: 'D Major',
    clientStory: 'Three siblings organized an anniversary anthem for their parents, inspired by classic 1974 radio recordings.',
    occasion: '50th Golden Anniversary',
    tags: ['Vintage Strings', 'Warm Vinyl', 'Orchestral', 'Golden Era'],
    artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop',
    published: true
  },
  {
    id: 'track-4',
    title: 'Ganga Ghat Twilight',
    genre: 'Indo-Fusion / Electronic',
    category: 'fusion',
    description: 'Modern ambient electronic rhythms blended with classical Raag Yaman sitar swells.',
    duration: 50,
    synthPreset: 'indo_fusion',
    bpm: 110,
    scaleKey: 'C# Minor',
    clientStory: 'Composed for a couple’s sangeet entry, merging ancestral Indian heritage with contemporary club rhythms.',
    occasion: 'Sangeet Night Entry',
    tags: ['Sitar Solo', 'Indo-Bass', 'Percussion', 'Fusion'],
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    published: true
  },
  {
    id: 'track-5',
    title: 'Royal Mandap Swell',
    genre: 'Grand Bollywood Orchestra',
    category: 'wedding',
    description: 'Triumphant shehnai harmonies, brass flourishes, and soaring cinematic violins for a royal bride entry.',
    duration: 56,
    synthPreset: 'bollywood_orchestra',
    bpm: 72,
    scaleKey: 'Bb Major',
    clientStory: 'Commissioned for a Jaipur palace wedding bride walk, customized with the couple’s childhood nicknames in the chorus.',
    occasion: 'Bridal Walkdown',
    tags: ['Cinematic Swell', 'Shehnai', 'Strings Ensemble', 'Royal'],
    artwork: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
    published: true
  },
  {
    id: 'track-6',
    title: 'Midnight in Indiranagar',
    genre: 'Pop / Synth-Groove',
    category: 'pop',
    description: 'Upbeat modern synth-pop track celebrating college roommates reuniting after five years.',
    duration: 48,
    synthPreset: 'dance_pop',
    bpm: 124,
    scaleKey: 'F# Minor',
    clientStory: 'A birthday gift filled with inside jokes, late-night road trip memories, and high-energy synthesizers.',
    occasion: 'Birthday Celebration',
    tags: ['Synthwave', 'Upbeat', 'Guitar Riffs', 'Vocal Chops'],
    artwork: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    published: true
  },
  {
    id: 'track-7',
    title: 'The Founder’s North Star',
    genre: 'Brand / Sonic Anthem',
    category: 'brand',
    description: 'Crisp acoustic elements evolving into a triumphant orchestral anthem for an ethical apparel launch.',
    duration: 52,
    synthPreset: 'acoustic_guitar',
    bpm: 96,
    scaleKey: 'G Major',
    clientStory: 'Custom brand identity track conveying purpose, craftsmanship, and grounded human ambition.',
    occasion: 'Brand Launch Video',
    tags: ['Acoustic', 'Uplifting', 'Brand Anthem', 'Clean Mix'],
    artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    published: true
  }
];

export const DEFAULT_PRICING: PricingTier[] = [
  {
    id: 'pricing-basic',
    name: 'BASIC',
    price: '₹2,500',
    rawPrice: 2500,
    deliveryTime: '3-day delivery',
    revisions: '2 revisions',
    commercialRights: false,
    features: [
      '1 custom song',
      'Up to 2 minutes duration',
      '1 chosen musical genre',
      '2 rounds of creative revisions',
      '3-day studio delivery window',
      'High-resolution MP3 master'
    ],
    ctaText: 'START BASIC',
    recommended: false
  },
  {
    id: 'pricing-standard',
    name: 'STANDARD',
    price: '₹4,500',
    rawPrice: 4500,
    tag: 'MOST POPULAR',
    deliveryTime: '3-day delivery',
    revisions: '3 revisions',
    commercialRights: true,
    features: [
      'Full song up to 3.5 minutes',
      '2 style variations included',
      'Premium studio analog mix',
      '3 rounds of revisions',
      'Commercial rights included',
      'Lossless WAV + Instrumental'
    ],
    ctaText: 'START STANDARD',
    recommended: true
  },
  {
    id: 'pricing-premium',
    name: 'PREMIUM',
    price: '₹8,000',
    rawPrice: 8000,
    tag: 'COMPLETE STUDIO',
    deliveryTime: 'Priority 2–3 day delivery',
    revisions: 'Priority revisions',
    commercialRights: true,
    features: [
      'Everything in Standard package',
      'Custom synchronized lyric video',
      '2 distinct genre variations',
      'Priority 2–3 day delivery',
      'Full commercial rights',
      'Direct 1-on-1 producer brief'
    ],
    ctaText: 'GO PREMIUM',
    recommended: false
  }
];

export const DEFAULT_USER_ORDERS: UserOrder[] = [
  {
    id: 'ord-892401',
    userId: 'usr-1',
    userEmail: 'priya.sharma@gmail.com',
    userName: 'Priya Sharma',
    packageTier: 'STANDARD',
    amount: 4500,
    currency: 'INR',
    occasion: 'Wedding First Dance',
    genre: 'Romantic / Cinematic Piano',
    language: 'Hindi / Hinglish',
    recipientName: 'Arjun',
    storyBrief: 'We met during a rainy semester in Pune. Memories of shared chai and long walks.',
    status: 'composition',
    statusProgress: 55,
    orderDate: 'Oct 14, 2026',
    estimatedDeliveryDate: 'Oct 21, 2026',
    deliveredAudioTitle: 'Until We Said Forever (Studio Master)',
    invoiceNumber: 'INV-2026-0891',
    billingAddress: {
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India'
    },
    revisionsRemaining: 3,
    timelineEvents: [
      {
        title: 'Story Brief Submitted & Validated',
        description: 'Story details and reference vibes checked by studio producer.',
        date: 'Oct 14, 2026',
        completed: true
      },
      {
        title: 'Melody Sketch & Lyric Draft',
        description: 'Lead songwriter drafted custom verse & chorus rhymes.',
        date: 'Oct 16, 2026',
        completed: true
      },
      {
        title: 'Vocal Recording & Strings Arrangement',
        description: 'In active recording session in main tracking room.',
        date: 'Oct 18, 2026',
        completed: false,
        current: true
      },
      {
        title: 'Mixing, Analog Mastering & Stems',
        description: 'Final polishing for high-fidelity playback.',
        date: 'Oct 20, 2026',
        completed: false
      },
      {
        title: 'Studio Delivery & Lossless Download',
        description: 'WAV, MP3 and instrumental delivered to user profile.',
        date: 'Oct 21, 2026',
        completed: false
      }
    ]
  }
];

export const DEFAULT_STATS: StudioStats = {
  songsCreated: 1420,
  happyCouples: 980,
  averageRating: 4.98,
  genresMastered: 32
};
