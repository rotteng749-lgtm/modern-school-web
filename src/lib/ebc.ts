/* ═══════════════════════════════════════════
   EBC — shared helpers
   Exam Browser Client: QR payload, parsing,
   dan utilitas lockdown perangkat.
   ═══════════════════════════════════════════ */

export const EBC_CODE_RE = /^[A-Z0-9]{4,10}$/;

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * QR memuat URL join (bukan kode mentah) supaya bisa dibuka scanner
 * bawaan HP dan langsung masuk ke aplikasi.
 */
export function buildJoinUrl(origin: string, code: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/exam-client/join?code=${encodeURIComponent(normalizeCode(code))}`;
}

/**
 * Terima bentuk apa pun yang mungkin keluar dari scanner:
 * URL lengkap, path "/exam-client/join?code=XYZ123", atau kode mentah.
 */
export function parseJoinCode(raw: string): string | null {
  const text = (raw ?? "").trim();
  if (!text) return null;

  if (/^https?:\/\//i.test(text)) {
    try {
      const u = new URL(text);
      const fromQuery = u.searchParams.get("code");
      if (fromQuery) {
        const code = normalizeCode(fromQuery);
        return EBC_CODE_RE.test(code) ? code : null;
      }
      const fromPath = u.pathname.match(/\/exam-client\/(?:join\/)?([A-Za-z0-9]{4,10})/);
      if (fromPath) {
        const code = normalizeCode(fromPath[1]);
        return EBC_CODE_RE.test(code) ? code : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  const code = normalizeCode(text);
  return EBC_CODE_RE.test(code) ? code : null;
}

/* ── Lockdown perangkat ── */

export async function enterFullscreen(): Promise<boolean> {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  try {
    if (document.fullscreenElement) return true;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    // Safari iOS masih perlu prefixed API
    if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
      return true;
    }
  } catch {
    /* user atau browser menolak */
  }
  return false;
}

export function exitFullscreen(): void {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

/**
 * Screen Wake Lock — mencegah HP sleep saat ujian berjalan.
 * Butuh HTTPS + tab terlihat; kalau tidak tersedia kita diam-diam skip.
 */
export async function acquireWakeLock(): Promise<WakeLockSentinel | null> {
  try {
    if (!("wakeLock" in navigator)) return null;
    return await navigator.wakeLock.request("screen");
  } catch {
    return null;
  }
}

/* ── Tipe payload dari Convex ── */

export interface EbcQuestion {
  id: string;
  question: string;
  options: string[];
  type: string;
}

export interface EbcSessionInfo {
  localId: string;
  name: string;
  subject: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
}

export type EbcSessionPayload =
  | { status: "open"; code: string; exam: EbcSessionInfo; questions: EbcQuestion[]; totalQuestions: number; expiresAt: number }
  | { status: "closed" | "expired"; code: string };

export function isOpenSession(
  p: EbcSessionPayload | null | undefined,
): p is Extract<EbcSessionPayload, { status: "open" }> {
  return !!p && p.status === "open";
}
