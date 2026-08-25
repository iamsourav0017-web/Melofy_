import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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

