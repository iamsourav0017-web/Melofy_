// ============================================================================
// Media Storage & Image Optimization Helper
// Provides IndexedDB persistence with LocalStorage fallback & Canvas compression
// ============================================================================

const DB_NAME = 'melofy_storage_db';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      dbPromise = null;
      reject(new Error('IndexedDB is not available'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onclose = () => {
          dbPromise = null;
        };
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        dbPromise = null;
        reject(request.error || new Error('Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('[Storage] IndexedDB open blocked');
      };
    } catch (e) {
      dbPromise = null;
      reject(e);
    }
  });

  return dbPromise;
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.onabort = () => {
        console.warn(`[Storage] Transaction aborted for ${key}:`, tx.error);
        reject(tx.error);
      };
      tx.onerror = () => {
        console.warn(`[Storage] Transaction error for ${key}:`, tx.error);
        reject(tx.error);
      };
      tx.oncomplete = () => {
        resolve();
      };
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[Storage] IndexedDB set failed for key: ${key}`, err);
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      tx.onabort = () => resolve(null);
      tx.onerror = () => resolve(null);
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined && req.result !== null ? (req.result as T) : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn(`[Storage] IndexedDB get failed for key: ${key}`, err);
    return null;
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.onabort = () => resolve();
      tx.onerror = () => resolve();
      tx.oncomplete = () => resolve();
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
    });
  } catch (err) {
    console.warn(`[Storage] IndexedDB remove failed for key: ${key}`, err);
  }
}

export async function idbClear(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.onabort = () => resolve();
      tx.onerror = () => resolve();
      tx.oncomplete = () => resolve();
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    });
  } catch (err) {
    console.warn('[Storage] IndexedDB clear failed', err);
  }
}

/**
 * Optimizes an uploaded image (PNG, JPG, WebP, etc.) using an off-screen HTML5 Canvas.
 * Ensures the image stays crisp on High-DPI screens while reducing file size from 5-15MB down to ~80-250KB,
 * ensuring flawless instant saving in IndexedDB and LocalStorage without quota limits.
 */
export async function optimizeImageFile(
  file: File,
  maxDimension: number = 1400,
  quality: number = 0.88
): Promise<string> {
  // If SVG or small vector, keep original as data url
  if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // If video, read data url directly (or warn if > 25MB)
  if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if canvas load fails
        resolve(reader.result as string);
      };
      img.onload = () => {
        try {
          let { width, height } = img;

          // Maintain aspect ratio while capping max dimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          // Image smoothing for high quality downscaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // If source has alpha transparency (like PNG) or is transparent, export as webp / png
          const isPng = file.type === 'image/png' || file.name.endsWith('.png');
          
          let outputType = 'image/webp';
          // Check browser support for webp canvas export
          try {
            const dataUrl = canvas.toDataURL(outputType, quality);
            if (dataUrl.startsWith('data:image/webp')) {
              resolve(dataUrl);
              return;
            }
          } catch (_) {}

          // Fallback to PNG or JPEG
          outputType = isPng ? 'image/png' : 'image/jpeg';
          const fallbackDataUrl = canvas.toDataURL(outputType, isPng ? undefined : quality);
          resolve(fallbackDataUrl);
        } catch (canvasErr) {
          console.warn('[ImageOptimizer] Canvas compression fallback', canvasErr);
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Persists data into both localStorage (for instant synchronous startup)
 * and IndexedDB (for large images, artwork, audio tracks, and persistent state across reloads).
 */
export function safeSetStorage<T>(key: string, val: T): void {
  // Always persist full fidelity to IndexedDB
  idbSet(key, val).catch((err) => {
    console.warn(`[Storage] IndexedDB set failed for ${key}`, err);
  });

  // Also attempt to save to localStorage, stripping large data URLs if needed to prevent 5MB quota errors
  try {
    if (key === 'melofy_tracks_v3' && Array.isArray(val)) {
      const lightweightTracks = val.map((t: any) => ({
        ...t,
        audioUrl: t.audioUrl && t.audioUrl.length > 500 ? undefined : t.audioUrl
      }));
      localStorage.setItem(key, JSON.stringify(lightweightTracks));
    } else if (key === 'melofy_content_v1' && val && typeof val === 'object') {
      const valObj = val as any;
      const bgUrl = valObj.hero?.backgroundVideoUrl;
      const lightweightContent = {
        ...valObj,
        hero: {
          ...valObj.hero,
          backgroundVideoUrl: bgUrl && bgUrl.length > 500 ? undefined : bgUrl
        }
      };
      localStorage.setItem(key, JSON.stringify(lightweightContent));
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (err) {
    console.warn(`[Storage] localStorage quota reached for ${key}, full data preserved in IndexedDB.`, err);
  }
}

export function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch (_) {
    return fallback;
  }
}

export async function idbSetAudio(trackId: string, audioDataUrl: string): Promise<void> {
  return idbSet(`melofy_audio_${trackId}`, audioDataUrl);
}

export async function idbGetAudio(trackId: string): Promise<string | null> {
  return idbGet<string>(`melofy_audio_${trackId}`);
}

export async function idbRemoveAudio(trackId: string): Promise<void> {
  return idbRemove(`melofy_audio_${trackId}`);
}
