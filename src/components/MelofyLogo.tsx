import React from 'react';
import { SiteBrandConfig } from '../types';

interface MelofyLogoProps {
  brandConfig?: SiteBrandConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  layout?: 'horizontal' | 'vertical' | 'icon-only' | 'wordmark-only';
  className?: string;
  isDark?: boolean;
}

export const MelofyLogo: React.FC<MelofyLogoProps> = ({
  brandConfig,
  size = 'md',
  showTagline = true,
  layout = 'horizontal',
  className = '',
  isDark
}) => {
  const logoText = brandConfig?.logoText || 'melofy';
  const logoTagline = brandConfig?.logoTagline || 'YOUR STORY, TURNED INTO A SONG.';
  const customImage = brandConfig?.logoImageUrl;

  // Sizing maps
  const iconDimensions = {
    sm: { w: 32, h: 32, font: 'text-lg', subFont: 'text-[7px]' },
    md: { w: 42, h: 42, font: 'text-2xl', subFont: 'text-[9px]' },
    lg: { w: 56, h: 56, font: 'text-3xl', subFont: 'text-[11px]' },
    xl: { w: 84, h: 84, font: 'text-5xl', subFont: 'text-[14px]' }
  }[size];

  // If user uploaded a custom logo image
  if (customImage) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={customImage}
          alt={logoText}
          referrerPolicy="no-referrer"
          className="object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
          style={{
            width: layout === 'icon-only' ? iconDimensions.w : Math.max(36, iconDimensions.w),
            height: layout === 'icon-only' ? iconDimensions.h : Math.max(36, iconDimensions.h),
            maxHeight: '80px'
          }}
        />
        {layout !== 'icon-only' && (
          <div className="flex flex-col">
            <span className={`font-display font-extrabold tracking-tight leading-none text-[var(--text-main)] ${iconDimensions.font}`}>
              {logoText}
            </span>
            {showTagline && logoTagline && (
              <span className={`font-code tracking-widest text-[#6B7280] dark:text-[#9CA3AF] uppercase mt-1 ${iconDimensions.subFont}`}>
                {logoTagline}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Master Melofy Vector SVG Logo (Stylized Cursive Ribbon M + Equalizer + Soundwave)
  const renderMasterEmblem = (width = 44, height = 44) => (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      style={{ width, height }}
      aria-label="Melofy Emblem"
    >
      <defs>
        {/* Obsidian Glass Gradient */}
        <linearGradient id="melofyObsidianGrad" x1="10" y1="130" x2="80" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B0F19" />
          <stop offset="40%" stopColor="#1E293B" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Electric Cyan Neon Ribbon Gradient */}
        <linearGradient id="melofyElectricCyan" x1="80" y1="20" x2="150" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#15BCDF" />
          <stop offset="75%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="melofyNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <radialGradient id="stardustGlow" cx="126" cy="88" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#15BCDF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#15BCDF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main Stylized Flowing Ribbon 'M' */}
      {/* 1. Left stem sweeping up */}
      <path
        d="M20 120 C45 115 65 80 72 40 C76 18 88 12 95 24 C104 38 98 75 88 102 C82 118 86 126 98 120 C114 112 135 70 142 45"
        stroke="url(#melofyObsidianGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Front Specular Highlight on Ribbon */}
      <path
        d="M26 114 C48 108 68 76 74 38 C77 22 86 17 92 26 C98 38 93 72 84 98"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeOpacity="0.55"
        strokeLinecap="round"
      />

      {/* 3. Sweeping Right Loop in Electric Cyan */}
      <path
        d="M86 28 C100 16 122 24 134 50 C144 72 142 98 126 104 C112 110 102 96 112 82 C116 76 124 78 126 88"
        stroke="url(#melofyElectricCyan)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#melofyNeonGlow)"
      />

      {/* 4. Fine Musical Soundwave Thread inside loop */}
      <path
        d="M96 76 H108 M111 76 H114"
        stroke="var(--accent, #15BCDF)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Equalizer Frequency Bars inside the loop */}
      <g stroke="var(--accent, #15BCDF)" strokeWidth="2.2" strokeLinecap="round" opacity="0.95">
        <line x1="112" y1="72" x2="112" y2="80" />
        <line x1="116" y1="67" x2="116" y2="85" />
        <line x1="120" y1="62" x2="120" y2="90" />
        <line x1="124" y1="56" x2="124" y2="96" strokeWidth="2.6" stroke="#38BDF8" />
        <line x1="128" y1="64" x2="128" y2="88" />
        <line x1="132" y1="70" x2="132" y2="82" />
        <line x1="136" y1="74" x2="136" y2="78" />
      </g>

      {/* Trailing Stardust Sparkle & Glowing Core */}
      <circle cx="124" cy="94" r="12" fill="url(#stardustGlow)" />
      <circle cx="125" cy="95" r="2.5" fill="#FFFFFF" />
      <circle cx="132" cy="88" r="1.5" fill="#38BDF8" />
      <circle cx="136" cy="94" r="1" fill="#FFFFFF" opacity="0.8" />
      <circle cx="140" cy="84" r="1.2" fill="#38BDF8" opacity="0.7" />
    </svg>
  );

  // Icon Only Mode
  if (layout === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderMasterEmblem(iconDimensions.w, iconDimensions.h)}
      </div>
    );
  }

  // Wordmark Only Mode
  if (layout === 'wordmark-only') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`font-display font-extrabold tracking-tight text-[var(--text-main)] ${iconDimensions.font} lowercase`}>
          {logoText}
        </span>
        {showTagline && logoTagline && (
          <span className={`font-code tracking-widest text-[#6B7280] dark:text-[#9CA3AF] uppercase mt-0.5 ${iconDimensions.subFont}`}>
            {logoTagline}
          </span>
        )}
      </div>
    );
  }

  // Vertical Stacked Mode (For Hero Showcase / Big Splash)
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center space-y-3 ${className}`}>
        {renderMasterEmblem(iconDimensions.w * 1.5, iconDimensions.h * 1.5)}
        
        <div className="flex flex-col items-center">
          <span className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-[var(--text-main)] lowercase">
            {logoText}
          </span>
          
          {showTagline && (
            <div className="flex items-center gap-3 mt-2">
              <span className="h-px w-8 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
              <span className="font-code text-[9px] sm:text-[10px] tracking-[0.25em] text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                YOUR STORY, TURNED INTO <span className="text-[var(--accent)] font-bold">A SONG.</span>
              </span>
              <span className="h-px w-8 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Clean Lockup for Navbar & Headers
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {renderMasterEmblem(iconDimensions.w, iconDimensions.h)}
      
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={`font-display font-extrabold tracking-tight leading-none text-[var(--text-main)] ${iconDimensions.font} lowercase`}>
            {logoText}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mb-0.5 animate-pulse" />
        </div>
        
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`font-code tracking-widest text-[#6B7280] dark:text-[#9CA3AF] uppercase ${iconDimensions.subFont}`}>
              {logoTagline === 'YOUR STORY, TURNED INTO A SONG.' ? (
                <>
                  YOUR STORY, TURNED INTO <span className="text-[var(--accent)] font-bold">A SONG</span>
                </>
              ) : (
                logoTagline
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
