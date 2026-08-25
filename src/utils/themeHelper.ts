import { SiteThemeConfig } from '../types';

/**
 * Calculates the relative luminance of a HEX color (0 to 1)
 */
export function getLuminance(hexColor: string): number {
  if (!hexColor || typeof hexColor !== 'string') return 0;
  
  // Clean hex string
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return 0;

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Resolves a normalized SiteThemeConfig ensuring high-contrast readable text
 */
export function normalizeThemeConfig(theme: SiteThemeConfig): SiteThemeConfig {
  const lum = getLuminance(theme.backgroundColor);
  const isLight = theme.mode === 'light' || (theme.mode !== 'dark' && lum > 0.45);

  return {
    ...theme,
    mode: isLight ? 'light' : 'dark',
    textColor: isLight ? '#121417' : '#FFFFFF',
    cardBackgroundColor: theme.cardBackgroundColor || (isLight ? '#FFFFFF' : '#121418'),
    cardBorderColor: theme.cardBorderColor || (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'),
  };
}

/**
 * Applies CSS variables and dark class to document.documentElement
 */
export function applyThemeToDOM(theme: SiteThemeConfig): void {
  const root = document.documentElement;
  const normalized = normalizeThemeConfig(theme);
  const isLight = normalized.mode === 'light';

  // Core colors
  root.style.setProperty('--accent', normalized.accentColor);
  root.style.setProperty('--accent-hover', normalized.accentHoverColor);
  root.style.setProperty('--bg-main', normalized.backgroundColor);
  root.style.setProperty('--text-main', normalized.textColor);
  root.style.setProperty('--text-muted', isLight ? '#4B5563' : '#9CA3AF');
  root.style.setProperty('--card-bg', normalized.cardBackgroundColor || (isLight ? '#FFFFFF' : '#121418'));
  root.style.setProperty('--card-border', normalized.cardBorderColor || (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'));
  root.style.setProperty('--glass-bg', isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(18, 20, 24, 0.8)');
  root.style.setProperty('--glass-border', isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)');

  // Fonts
  const fontHeading = normalized.fontHeading || 'Space Grotesk';
  const fontBody = normalized.fontBody || 'Plus Jakarta Sans';
  const fontCode = normalized.fontCode || 'JetBrains Mono';

  root.style.setProperty('--font-display', `"${fontHeading}", -apple-system, BlinkMacSystemFont, sans-serif`);
  root.style.setProperty('--font-body', `"${fontBody}", -apple-system, BlinkMacSystemFont, sans-serif`);
  root.style.setProperty('--font-code', `"${fontCode}", monospace`);

  // Document class
  if (isLight) {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}
