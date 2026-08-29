/* ═══════════════════════════════════════════
   LOGO STORAGE — Main school logo manager
   Saves to IndexedDB, caches in localStorage
   for instant sidebar/header access.
   ═══════════════════════════════════════════ */

import { saveFile, getFile, type StoredFile } from "./file-storage";

const LOGO_ID = "msw-main-logo";
const CACHE_KEY = "msw-logo-cache";

/** Save the main school logo */
export async function saveMainLogo(dataUrl: string, fileName: string): Promise<void> {
  const file: StoredFile = {
    id: LOGO_ID,
    name: fileName,
    type: "image/png",
    size: Math.round((dataUrl.length * 3) / 4), // approximate base64 size
    dataUrl,
    category: "logo",
    uploadedAt: new Date().toISOString(),
  };
  await saveFile(file);
  // Cache in localStorage for instant access
  localStorage.setItem(CACHE_KEY, dataUrl);
  // Dispatch event so sidebar/header can react
  window.dispatchEvent(new CustomEvent("logo-changed", { detail: dataUrl }));
}

/** Get the main school logo (instant from cache) */
export function getMainLogo(): string | null {
  return localStorage.getItem(CACHE_KEY);
}

/** Load logo from IndexedDB and refresh cache */
export async function loadMainLogo(): Promise<string | null> {
  try {
    const file = await getFile(LOGO_ID);
    if (file) {
      localStorage.setItem(CACHE_KEY, file.dataUrl);
      return file.dataUrl;
    }
  } catch { /* ignore */ }
  return null;
}

/** Remove the main logo */
export async function removeMainLogo(): Promise<void> {
  const { deleteFile } = await import("./file-storage");
  await deleteFile(LOGO_ID);
  localStorage.removeItem(CACHE_KEY);
  window.dispatchEvent(new CustomEvent("logo-changed", { detail: null }));
}

/** Initialize logo cache on app startup */
export function initLogoCache(): void {
  loadMainLogo(); // async, non-blocking
}
