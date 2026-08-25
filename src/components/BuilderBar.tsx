import React from 'react';
import {
  Type, Palette, Disc, DollarSign,
  Inbox, Save, RotateCcw, X, Eye, Edit3, Check, Sliders, LogOut
} from 'lucide-react';
import { SiteThemeConfig } from '../types';

interface BuilderBarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenFullAdmin: (defaultTab?: 'brand' | 'video' | 'writings' | 'theme' | 'tracks' | 'pricing' | 'inquiries' | 'security') => void;
  onQuickThemeChange: (theme: Partial<SiteThemeConfig>) => void;
  themeConfig: SiteThemeConfig;
  onResetDefaults: () => void;
  onExitAdmin: () => void;
}

export const BuilderBar: React.FC<BuilderBarProps> = ({
  isEditMode,
  onToggleEditMode,
  onOpenFullAdmin,
  onQuickThemeChange,
  themeConfig,
  onResetDefaults,
  onExitAdmin,
}) => {
  const fontOptions: Array<SiteThemeConfig['fontHeading']> = [
    'Space Grotesk',
    'Playfair Display',
    'Syne',
    'Outfit',
    'Cinzel',
    'Cormorant Garamond',
    'DM Sans'
  ];

  const colorPalettes = [
    { name: 'Spotify Obsidian Dark', accent: '#15BCDF', hover: '#3FD0EF', bg: '#090A0C', text: '#FFFFFF', mode: 'dark' as const },
    { name: 'Apple Pro Titanium Dark', accent: '#2997FF', hover: '#60A5FA', bg: '#000000', text: '#F5F5F7', mode: 'dark' as const },
    { name: 'Apple Studio Silver Light', accent: '#0071E3', hover: '#0077ED', bg: '#F5F5F7', text: '#1D1D1F', mode: 'light' as const },
    { name: 'Spotify Sonic Emerald', accent: '#1DB954', hover: '#1ED760', bg: '#121212', text: '#FFFFFF', mode: 'dark' as const },
    { name: 'Silk Platinum Minimal Light', accent: '#0284C7', hover: '#0369A1', bg: '#FAF9F6', text: '#18181B', mode: 'light' as const },
  ];

  return (
    <div
      id="website-builder-dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] w-auto bg-[#171A1C]/95 text-white backdrop-blur-xl border border-white/20 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-3 sm:gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ring-1 ring-white/10"
    >
      {/* Studio Brand Indicator */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/15 hidden sm:flex">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="font-display font-bold text-xs tracking-wider uppercase text-white/90">
          BUILDER ACTIVE
        </span>
      </div>

      {/* Live In-Place Edit Mode Toggle */}
      <button
        type="button"
        onClick={onToggleEditMode}
        className={`font-body text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
          isEditMode
            ? 'bg-[#15BCDF] text-[#171A1C] ring-2 ring-[#15BCDF]/50 font-bold'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title="Toggle Click-to-Edit mode for all on-screen text and writings"
      >
        {isEditMode ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>EDITING ON (CLICK ANY TEXT)</span>
          </>
        ) : (
          <>
            <Edit3 className="w-3.5 h-3.5 text-[#15BCDF]" />
            <span>CLICK TO EDIT TEXT</span>
          </>
        )}
      </button>

      {/* Quick Font Selector */}
      <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-1 border border-white/10">
        <Type className="w-3.5 h-3.5 text-[#15BCDF] shrink-0 ml-1 hidden xs:block" />
        <select
          value={themeConfig.fontHeading}
          onChange={(e) => onQuickThemeChange({ fontHeading: e.target.value as SiteThemeConfig['fontHeading'] })}
          className="bg-transparent text-white font-body text-xs focus:outline-none cursor-pointer pr-1"
          title="Change Heading Typography font family"
        >
          {fontOptions.map((f) => (
            <option key={f} value={f} className="bg-[#171A1C] text-white">
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Palette Swatches */}
      <div className="hidden md:flex items-center gap-1.5">
        {colorPalettes.slice(0, 5).map((p) => {
          const isSelected = themeConfig.accentColor === p.accent;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => onQuickThemeChange({
                accentColor: p.accent,
                accentHoverColor: p.hover,
                backgroundColor: p.bg,
                textColor: p.text,
                mode: p.mode
              })}
              aria-label={`Select palette: ${p.name}`}
              className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                isSelected ? 'scale-125 border-white ring-2 ring-[#15BCDF]' : 'border-white/20 hover:scale-110'
              }`}
              style={{ backgroundColor: p.accent }}
            />
          );
        })}
      </div>

      {/* Open Comprehensive Studio Customizer */}
      <button
        type="button"
        onClick={() => onOpenFullAdmin('writings')}
        className="font-body text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#15BCDF] hover:text-[#171A1C] text-white transition-all flex items-center gap-1.5 cursor-pointer"
        title="Open Full Website Editor (Typography, Writings, Pricing, Tracks, Briefs, Backups)"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Studio Controls</span>
      </button>

      {/* Exit Admin Mode */}
      <button
        type="button"
        onClick={onExitAdmin}
        className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/80 text-white/80 hover:text-white transition-colors cursor-pointer"
        title="Exit Admin Mode (Return to visitor view)"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
