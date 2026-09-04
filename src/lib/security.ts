/* ═══════════════════════════════════════════
   SECURITY HELPERS
   This app has no server/SQL database — all
   data lives in localStorage/IndexedDB. The
   equivalent hardening here is:
   1) strict input validation (usernames,
      passwords, lengths) so junk / duplicate /
      malicious values never enter the store;
   2) client-side brute-force throttling;
   3) safe text trimming helpers.
   React already escapes rendered text, so the
   main remaining risk is invalid credentials
   or oversized payloads, handled below.
   ═══════════════════════════════════════════ */

const LOGIN_ATTEMPT_KEY = "msw-login-attempts";
export const MAX_USERNAME_LEN = 32;
export const MAX_PASSWORD_LEN = 64;
export const MIN_PASSWORD_LEN = 6;
/** Allowed: letters, digits, . _ - (lowercased before check) */
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const TEXT_MAX = 500;

/** Normalize a raw username: trim + lowercase. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Returns an error message (Indonesian) or null when valid. */
export function validateUsername(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (!u) return "Username wajib diisi.";
  if (u.length < 3) return "Username minimal 3 karakter.";
  if (u.length > MAX_USERNAME_LEN) return `Username maksimal ${MAX_USERNAME_LEN} karakter.`;
  if (!USERNAME_RE.test(u)) {
    return "Username hanya boleh huruf, angka, titik, garis bawah ( _ ), atau strip ( - ).";
  }
  return null;
}

/** Returns an error message or null when valid. */
export function validatePassword(pw: string): string | null {
  if (!pw) return "Password wajib diisi.";
  if (pw.length < MIN_PASSWORD_LEN) return `Password minimal ${MIN_PASSWORD_LEN} karakter.`;
  if (pw.length > MAX_PASSWORD_LEN) return `Password maksimal ${MAX_PASSWORD_LEN} karakter.`;
  if (/[\u0000-\u001f\u007f]/.test(pw)) return "Password mengandung karakter yang tidak diizinkan.";
  return null;
}

export function validateCredentials(rawUsername: string, password: string): { username: string; error: string | null } {
  const username = normalizeUsername(rawUsername);
  const uErr = validateUsername(username);
  if (uErr) return { username, error: uErr };
  return { username, error: validatePassword(password) };
}

/** Trim + strip control chars + cap length (plain text fields). */
export function sanitizeText(raw: string, maxLen = TEXT_MAX): string {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLen);
}

/** Trim phone/NISN-ish numeric input to digits/dashes/space. */
export function sanitizeNumeric(raw: string, maxLen = 24): string {
  return raw.replace(/[^0-9\- ]/g, "").trim().slice(0, maxLen);
}

/* ── Brute-force throttle (per browser) ──
   After 5 failed attempts, block for 30s. */
const MAX_FAILS = 5;
const LOCK_MS = 30_000;

export function getLoginLock(): { locked: boolean; remainingMs: number } {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPT_KEY);
    if (!raw) return { locked: false, remainingMs: 0 };
    const data = JSON.parse(raw) as { fails: number; firstAt: number };
    const windowMs = Date.now() - data.firstAt;
    if (data.fails >= MAX_FAILS && windowMs < LOCK_MS) {
      return { locked: true, remainingMs: LOCK_MS - windowMs };
    }
    // Window passed → reset
    if (windowMs >= LOCK_MS) {
      localStorage.removeItem(LOGIN_ATTEMPT_KEY);
    }
    return { locked: false, remainingMs: 0 };
  } catch {
    return { locked: false, remainingMs: 0 };
  }
}

export function recordLoginFail(): { locked: boolean; remainingMs: number } {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPT_KEY);
    const now = Date.now();
    let data = { fails: 1, firstAt: now };
    if (raw) {
      const prev = JSON.parse(raw) as { fails: number; firstAt: number };
      data = now - prev.firstAt < LOCK_MS ? { fails: prev.fails + 1, firstAt: prev.firstAt } : data;
    }
    localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(data));
    if (data.fails >= MAX_FAILS) {
      return { locked: true, remainingMs: LOCK_MS - (now - data.firstAt) };
    }
    return { locked: false, remainingMs: 0 };
  } catch {
    return { locked: false, remainingMs: 0 };
  }
}

export function resetLoginFails(): void {
  try {
    localStorage.removeItem(LOGIN_ATTEMPT_KEY);
  } catch { /* ignore */ }
}

/* ── Username availability across every credential source ── */
export function usernameTaken(username: string, ignoreUsernames: string[] = []): boolean {
  const ignore = new Set(ignoreUsernames.map((u) => u.toLowerCase()));
  if (ignore.has(username.toLowerCase())) return false;
  try {
    const usersRaw = localStorage.getItem("msw-users");
    if (usersRaw) {
      const users = JSON.parse(usersRaw) as Record<string, unknown>;
      if (Object.keys(users).some((k) => k.toLowerCase() === username)) return true;
    }
  } catch { /* ignore */ }
  for (const key of ["msw-murid", "msw-guru"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const list = JSON.parse(raw) as Array<{ username?: string }>;
      if (list.some((m) => m.username && m.username.toLowerCase() === username)) return true;
    } catch { /* ignore */ }
  }
  return false;
}
