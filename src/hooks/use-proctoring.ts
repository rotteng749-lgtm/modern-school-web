import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════
   CBT PROCTORING — auto-deteksi kecurangan
   Mendeteksi:
     • pindah tab / minimized / alt-tab ke
       aplikasi lain (Chrome, floating app, dsb)
     • membuka jendela/tab kedua untuk ujian
       yang sama (multi-window)
     • membuka DevTools / jendela inspektur
     • menutup / me-refresh halaman ujian
     • keluar fullscreen di tengah ujian
     • mencoba navigasi "back"
   Semua kejadian dicatat beserta durasinya
   dan disimpan ke localStorage agar bisa
   dilihat guru/admin di mode Monitor.
   ═══════════════════════════════════════════ */

export type ViolationType =
  | "keluar-aplikasi"
  | "multi-jendela"
  | "devtools"
  | "keluar-halaman"
  | "keluar-fullscreen"
  | "kembali";

export interface Violation {
  id: string;
  type: ViolationType;
  at: string;
  detail: string;
  durationMs?: number;
}

export const VIOLATION_KEY_PREFIX = "msw-cbt-violations-";
const SESSION_KEY_PREFIX = "msw-cbt-sessions-";

export const VIOLATION_LABELS: Record<ViolationType, string> = {
  "keluar-aplikasi": "Keluar dari aplikasi",
  "multi-jendela": "Multi jendela/tab",
  devtools: "Alat pengembang",
  "keluar-halaman": "Tutup / refresh halaman",
  "keluar-fullscreen": "Keluar fullscreen",
  kembali: "Navigasi kembali",
};

/** Debounce so blur + visibilitychange (which fire together) count as one event. */
const COOLDOWN_MS = 1500;
/** Don't flag focus flicker shorter than this (permission prompts, alt-tab taps). */
const MIN_AWAY_MS = 900;
/** How often to re-check the multi-window session registry. */
const SESSION_POLL_MS = 3000;
const DEVTOOLS_POLL_MS = 4000;
const DEVTOOLS_COOLDOWN_MS = 20_000;
const WARN_VISIBLE_MS = 5000;

/* ── storage helpers ── */
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / diblokir — abaikan, deteksi tetap berjalan di memori */
  }
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} detik`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs ? `${m} menit ${rs} detik` : `${m} menit`;
  return `${Math.floor(m / 60)} jam ${m % 60} menit`;
}

export function loadViolations(examId: string | undefined): Violation[] {
  if (!examId) return [];
  return readJson<Violation[]>(VIOLATION_KEY_PREFIX + examId, []);
}

export function clearViolations(examId: string | undefined): void {
  if (!examId) return;
  try {
    localStorage.removeItem(VIOLATION_KEY_PREFIX + examId);
    localStorage.removeItem(SESSION_KEY_PREFIX + examId);
  } catch {
    /* ignore */
  }
}

/* ── session registry: satu entri per tab/jendela yang menjalankan ujian ── */
interface SessionEntry {
  startedAt: number;
  username: string;
}
type SessionRegistry = Record<string, SessionEntry>;

function newSessionId(): string {
  return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface ProctoringOptions {
  examId: string | undefined;
  /** Hanya aktif selama ujian benar-benar berjalan. */
  active: boolean;
  username: string;
}

/** cooldownMs opsional: untuk event yang dipoll (devtools, multi jendela). */
type RecordFn = (
  type: ViolationType,
  detail: string,
  durationMs?: number,
  cooldownMs?: number,
) => void;

export function useProctoring({ examId, active, username }: ProctoringOptions) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [liveWarning, setLiveWarning] = useState<Violation | null>(null);

  const listRef = useRef<Violation[]>([]);
  const lastAtRef = useRef<Record<string, number>>({});
  const sessionIdRef = useRef(newSessionId());
  const othersSigRef = useRef<{ examId: string; sig: string }>({ examId: "", sig: "" });
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Dipakai komponen & efek internal untuk mencatat kejadian. */
  const recordRef = useRef<RecordFn>(() => {});

  const record = useCallback<RecordFn>(
    (type: ViolationType, detail: string, durationMs?: number, cooldownMs: number = COOLDOWN_MS) => {
      const now = Date.now();
      if (now - (lastAtRef.current[type] ?? 0) < cooldownMs) return;
      lastAtRef.current[type] = now;

      const v: Violation = {
        id: `${now}-${type}`,
        type,
        at: new Date(now).toISOString(),
        detail,
        durationMs,
      };
      listRef.current = [...listRef.current, v];
      writeJson(VIOLATION_KEY_PREFIX + examId, listRef.current);
      setViolations(listRef.current);

      setLiveWarning(v);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      warnTimer.current = setTimeout(() => setLiveWarning(null), WARN_VISIBLE_MS);
    },
    [examId],
  );
  recordRef.current = record;

  // Muat riwayat yg sudah tersimpan (mis. setelah reload)
  useEffect(() => {
    if (!examId) return;
    listRef.current = loadViolations(examId);
    setViolations(listRef.current);
  }, [examId]);

  useEffect(() => () => { if (warnTimer.current) clearTimeout(warnTimer.current); }, []);

  /* ── 1. Keluar aplikasi: ganti tab / minimize / alt-tab ke app lain ──
     Event blur + visibilitychange menandai satu "pergi" dan satu "kembali",
     jadi cukup satu penanda agar tidak terhitung ganda. */
  useEffect(() => {
    if (!active) return;
    let awaySince = 0;

    const markAway = () => { if (!awaySince) awaySince = Date.now(); };
    const markBack = () => {
      if (!awaySince) return;
      const dur = Date.now() - awaySince;
      awaySince = 0;
      if (dur < MIN_AWAY_MS) return;
      recordRef.current(
        "keluar-aplikasi",
        `Pindah ke tab/jendela/aplikasi lain selama ${formatDuration(dur)}.`,
        dur,
      );
    };

    const onVisibility = () => (document.hidden ? markAway() : markBack());
    const onBlur = () => markAway();
    const onFocus = () => markBack();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      // Kalau ditutup/refresh saat masih "di luar", tetap catat waktunya.
      if (awaySince) {
        const dur = Date.now() - awaySince;
        if (dur >= MIN_AWAY_MS) {
          recordRef.current(
            "keluar-aplikasi",
            `Pindah ke tab/jendela/aplikasi lain selama ${formatDuration(dur)}.`,
            dur,
          );
        }
      }
    };
  }, [active]);

  /* ── 2. Multi jendela: jendela/tab lain membuka ujian yang sama ── */
  useEffect(() => {
    if (!active || !examId) return;
    const key = SESSION_KEY_PREFIX + examId;
    const myId = sessionIdRef.current;

    const sync = () => {
      const reg = readJson<SessionRegistry>(key, {});
      reg[myId] = { startedAt: Date.now(), username };
      const others = Object.keys(reg).filter((k) => k !== myId);
      writeJson(key, reg);

      const sig = others.slice().sort().join(",");
      if (others.length > 0 && (othersSigRef.current.examId !== examId || othersSigRef.current.sig !== sig)) {
        othersSigRef.current = { examId, sig };
        recordRef.current(
          "multi-jendela",
          `Ujian ini dibuka di ${others.length + 1} jendela/tab browser sekaligus.`,
        );
      } else if (others.length === 0) {
        othersSigRef.current = { examId, sig: "" };
      }
    };

    sync();
    const poll = setInterval(sync, SESSION_POLL_MS);
    const onStorage = (e: StorageEvent) => { if (e.key === key) sync(); };
    window.addEventListener("storage", onStorage);

    // Cegah halaman yang membuka jendela/tab baru
    const originalOpen = window.open;
    window.open = ((..._args: unknown[]) => {
      recordRef.current("multi-jendela", "Percobaan membuka jendela baru dari halaman ujian.");
      return null;
    }) as typeof window.open;

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const link = el?.closest?.("a");
      if (link?.getAttribute("target") === "_blank") {
        e.preventDefault();
        recordRef.current("multi-jendela", "Percobaan membuka tautan di jendela/tab baru.");
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      clearInterval(poll);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("click", onClick, true);
      window.open = originalOpen;
      const reg = readJson<SessionRegistry>(key, {});
      delete reg[myId];
      writeJson(key, reg);
    };
  }, [active, examId, username]);

  /* ── 3. DevTools / jendela inspektur (heuristik ukuran window) ── */
  useEffect(() => {
    if (!active) return;
    // Tidak andal di layar kecil / mobile
    if (window.innerWidth < 768) return;

    const check = () => {
      const dw = window.outerWidth - window.innerWidth;
      const dh = window.outerHeight - window.innerHeight;
      // Ambang konservatif: DevTools di dock kanan menambah lebar, di dock
      // bawah menambah tinggi. Chrome browser biasa hanya ~90-140px.
      if (dw > 250 || dh > 300) {
        recordRef.current(
          "devtools",
          "Jendela inspektur (DevTools) terdeteksi terbuka.",
          undefined,
          DEVTOOLS_COOLDOWN_MS,
        );
      }
    };
    check();
    const poll = setInterval(check, DEVTOOLS_POLL_MS);
    return () => clearInterval(poll);
  }, [active]);

  /* ── 4. Tutup / refresh halaman ujian ── */
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      recordRef.current("keluar-halaman", "Mencoba menutup atau me-refresh halaman ujian.");
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  const clear = useCallback(() => {
    clearViolations(examId);
    listRef.current = [];
    lastAtRef.current = {};
    othersSigRef.current = { examId: examId ?? "", sig: "" };
    setViolations([]);
    setLiveWarning(null);
  }, [examId]);

  return {
    violations,
    liveWarning,
    record,
    clear,
  };
}
