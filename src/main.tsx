import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyThemeToDOM, normalizeThemeConfig } from './utils/themeHelper';
import { DEFAULT_THEME_CONFIG } from './data/defaultData';
import { safeGetStorage } from './utils/mediaStorage';

// Synchronously apply theme before React renders to prevent any theme flicker or layout shift
try {
  const initialTheme = safeGetStorage('melofy_theme_v1', DEFAULT_THEME_CONFIG);
  applyThemeToDOM(normalizeThemeConfig(initialTheme));
} catch (_) {}

// Safeguard against browser / framework Performance.measure memory errors (DataCloneError)
if (typeof window !== 'undefined' && window.performance) {
  const origMeasure = window.performance.measure?.bind(window.performance);
  if (origMeasure) {
    window.performance.measure = function (
      name: string,
      startOrMeasureOptions?: any,
      endMark?: any
    ) {
      try {
        return origMeasure(name, startOrMeasureOptions, endMark);
      } catch {
        try {
          window.performance.clearMarks();
          window.performance.clearMeasures();
        } catch {
          // Ignore
        }
        return undefined as any;
      }
    };
  }

  const origMark = window.performance.mark?.bind(window.performance);
  if (origMark) {
    window.performance.mark = function (name: string, markOptions?: any) {
      try {
        return origMark(name, markOptions);
      } catch {
        return undefined as any;
      }
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

