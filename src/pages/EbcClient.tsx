import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useConvex, useMutation, useQuery } from "convex/react";
import jsQR from "jsqr";
import {
  ScanLine,
  Keyboard,
  ShieldCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Lock,
  Maximize,
  Download,
  User,
  Flag,
  ShieldAlert,
  LayoutGrid,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { YmhLogo } from "@/components/YmhLogo";
import { toast } from "sonner";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { useProctoring } from "@/hooks/use-proctoring";
import {
  acquireWakeLock,
  enterFullscreen,
  exitFullscreen,
  isOpenSession,
  parseJoinCode,
  type EbcSessionPayload,
} from "@/lib/ebc";
import { getLoginLock, resetLoginFails, MAX_USERNAME_LEN, MAX_PASSWORD_LEN } from "@/lib/security";

/* ═══════════════════════════════════════════
   EBC — Exam Browser Client (murid)
   Scan QR → login akun murid → kunci layar
   → ujian langsung jalan.
   ═══════════════════════════════════════════ */

type Step = "home" | "scanner" | "login" | "ready" | "exam" | "result";

interface SubmitSummary {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  violationCount: number;
  alreadySubmitted?: boolean;
}

const SCAN_INTERVAL_MS = 140; // ~7 fps — cukup untuk QR, hemat baterai
const SCAN_MAX_WIDTH = 520; // perkecil sebelum decode, jauh lebih cepat di HP kelas bawah
const HEARTBEAT_MS = 5000;

export default function EbcClient() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: authLoading, signIn, signOut } = useLocalAuth();

  const [step, setStep] = useState<Step>("home");
  const [code, setCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);

  const session = useQuery(
    api.ebc.sessionForClient,
    code ? { code } : "skip",
  );

  // QR dari deep link: /exam-client/join?code=ABC123
  useEffect(() => {
    const fromUrl = parseJoinCode(searchParams.get("code") ?? "");
    if (fromUrl) {
      setCode(fromUrl);
      // cukup akun siswa yang boleh lanjut; selain itu minta login dulu
      if (user?.role === "siswa") setStep("ready");
      else if (!authLoading && !user) setStep("login");
    }
  }, [searchParams, user, authLoading]);

  const payload: EbcSessionPayload | null = session ?? null;

  // Sudah login sebagai siswa → lewati form login
  useEffect(() => {
    if (step === "login" && user?.role === "siswa") setStep("ready");
  }, [step, user]);

  // Sesi ditutup / kedaluwarsa → jangan biarkan siswa lanjut
  useEffect(() => {
    if (!payload) return;
    if (payload.status === "closed") {
      setFatal("Sesi ujian sudah ditutup oleh guru.");
      setStep("home");
    } else if (payload.status === "expired") {
      setFatal("Kode sesi sudah kedaluwarsa. Minta guru membuat sesi baru.");
      setStep("home");
    }
  }, [payload]);

  const handleDetected = useCallback((detected: string) => {
    setCode(detected);
    setSearchParams({ code: detected }, { replace: true });
    setStep("login");
  }, [setSearchParams]);

  const handleManual = () => {
    const parsed = parseJoinCode(manualCode);
    if (!parsed) {
      toast.error("Kode tidak valid. Gunakan 4-10 huruf/angka.");
      return;
    }
    handleDetected(parsed);
  };

  const signOutAndReset = () => {
    signOut();
    setCode(null);
    setSearchParams({}, { replace: true });
    setStep("home");
  };

  /* ── Layar utama ── */
  if (step === "home") {
    return (
      <Shell>
        {fatal && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{fatal}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <YmhLogo size={64} />
          <h1 className="text-xl font-bold">Exam Browser Client</h1>
          <p className="text-sm text-muted-foreground">
            Yayasan Mambaul Hasan · Batur Gading, Probolinggo
          </p>
        </div>

        <InstallPrompt />

        <div className="space-y-3">
          <Button
            size="lg"
            className="h-14 w-full text-base"
            onClick={() => setStep("scanner")}
          >
            <ScanLine className="size-5" /> Scan QR Ujian
          </Button>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau masukkan kode manual
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="KODE SESI"
              className="h-12 text-center font-mono text-lg tracking-[0.3em]"
              maxLength={10}
              autoCapitalize="characters"
              spellCheck={false}
            />
            <Button size="lg" variant="outline" className="h-12" onClick={handleManual}>
              <Keyboard className="size-4" /> Masuk
            </Button>
          </div>

          {user && (
            <div className="flex items-center justify-between rounded-lg border p-3 text-xs">
              <span className="min-w-0 truncate">
                Masuk sebagai <strong>{user.name}</strong> ({user.role})
              </span>
              <Button variant="ghost" size="sm" onClick={signOutAndReset}>
                Ganti akun
              </Button>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  /* ── Kamera scanner ── */
  if (step === "scanner") {
    return (
      <Shell hideBack>
        <QrScanner onDetected={handleDetected} onClose={() => setStep("home")} />
      </Shell>
    );
  }

  /* ── Login akun murid ── */
  if (step === "login") {
    return (
      <Shell onBack={() => setStep("home")}>
        <EbcLogin
          onSuccess={() => setStep("ready")}
          initialUsername={user?.role === "siswa" ? user.username : ""}
        />
        {user && user.role !== "siswa" && (
          <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={signOutAndReset}>
            Ganti akun ({user.role})
          </Button>
        )}
      </Shell>
    );
  }

  /* ── Layar 준비 / lockdown ── */
  if (step === "ready") {
    if (!isOpenSession(payload)) {
      return (
        <Shell onBack={() => setStep("home")}>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat sesi ujian…</p>
          </div>
        </Shell>
      );
    }
    return (
      <ReadyScreen
        payload={payload}
        onBack={() => setStep("home")}
        onStart={() => setStep("exam")}
        currentUser={user}
      />
    );
  }

  /* ── Ujian berjalan ── */
  if (step === "exam" && isOpenSession(payload)) {
    return <ExamRunner payload={payload} currentUser={user} onExit={() => setStep("result")} />;
  }

  /* ── Hasil ── */
  if (step === "result") {
    return <ResultScreen code={code!} onDone={signOutAndReset} />;
  }

  return (
    <Shell onBack={() => setStep("home")}>
      <div className="py-16 text-center text-sm text-muted-foreground">Memuat…</div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════
   Shell
   ═══════════════════════════════════════════ */
function Shell({
  children,
  onBack,
  hideBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
  hideBack?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-md px-4 py-5">
        {!hideBack && onBack && (
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={onBack}>
            <ChevronLeft className="size-4" /> Kembali
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Install PWA (Android "Add to Home screen")
   ═══════════════════════════════════════════ */
interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const sync = () => setStandalone(mq.matches || (window.navigator as { standalone?: boolean }).standalone === true);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
        <CheckCircle2 className="size-4 shrink-0" /> Aplikasi terpasang. Bagus.
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <button
      onClick={async () => {
        try {
          await deferred.prompt();
          const choice = await deferred.userChoice;
          if (choice.outcome === "accepted") toast.success("EBC terpasang di home screen.");
        } catch {
          /* diabaikan */
        }
        setDeferred(null);
      }}
      className="mb-4 flex w-full items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-left text-xs text-primary"
    >
      <Download className="size-4 shrink-0" />
      <span>Pasang EBC ke home screen agar bisa dibuka layar penuh seperti aplikasi.</span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   QR Scanner (kamera + jsQR)
   ═══════════════════════════════════════════ */
function QrScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    async function start() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Browser ini tidak mendukung akses kamera. Gunakan kode manual.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch {
        setError("Kamera tidak bisa dibuka. Izinkan akses kamera, atau pakai kode manual.");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;
      try {
        await video.play();
      } catch {
        /* beberapa HP butuh interaksi user dulu; scan tetap jalan */
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const scan = () => {
        if (cancelled || doneRef.current) return;
        timer = setTimeout(() => {
          if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
            // Perkecil — decode jauh lebih cepat di HP kelas bawah
            const scale = Math.min(1, SCAN_MAX_WIDTH / video.videoWidth);
            const w = Math.round(video.videoWidth * scale);
            const h = Math.round(video.videoHeight * scale);
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            try {
              const img = ctx.getImageData(0, 0, w, h);
              const found = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
              const parsed = found?.data ? parseJoinCode(found.data) : null;
              if (parsed) {
                doneRef.current = true;
                onDetected(parsed);
                return;
              }
            } catch {
              /* abaikan frame ini */
            }
          }
          scan();
        }, SCAN_INTERVAL_MS);
      };
      scan();
    }

    start();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-lg font-bold">Scan QR Ujian</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Arahkan kamera ke layar yang menampilkan QR dari guru.
        </p>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-emerald-500/70" />
        <div className="absolute inset-x-0 bottom-3 text-center">
          <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] text-white">
            {error ? "Kamera tidak aktif" : "Mencari QR…"}
          </span>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-400">
          <Camera className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <Button variant="outline" className="w-full" onClick={onClose}>
        Batal
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Login akun murid
   ═══════════════════════════════════════════ */
function EbcLogin({ onSuccess, initialUsername }: { onSuccess: () => void; initialUsername: string }) {
  const { signIn, adoptVerifiedUser } = useLocalAuth();
  const convex = useConvex();
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockSecs, setLockSecs] = useState(0);

  useEffect(() => {
    const check = () => {
      const { locked, remainingMs } = getLoginLock();
      setLockSecs(locked ? Math.ceil(remainingMs / 1000) : 0);
    };
    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockSecs > 0) return;
    setBusy(true);
    setError(null);

    const uname = username.trim().toLowerCase().slice(0, MAX_USERNAME_LEN);
    const pw = password.slice(0, MAX_PASSWORD_LEN);
    const res = await signIn(uname, pw);

    if (res.success) {
      resetLoginFails();
      onSuccess();
      return;
    }

    // HP siswa biasanya punya localStorage kosong — akun dibuat di laptop guru.
    // Coba verifikasi langsung ke server.
    try {
      const remote = await convex.query(api.ebc.verifyStudent, { username: uname, password: pw });
      if (remote) {
        resetLoginFails();
        adoptVerifiedUser(remote.username, remote.name);
        onSuccess();
        return;
      }
    } catch {
      /* offline atau server tidak terjangkau — pesan di bawah */
    }

    setError(
      res.error === "Username atau password salah."
        ? "Username atau password salah. Pastikan guru sudah publish akun (langkah 1)."
        : (res.error ?? "Login gagal."),
    );
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-lg font-bold">Masuk sebagai Murid</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Gunakan akun yang diberikan sekolah. Ujian akan langsung terkunci layar.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ebc-username" className="text-xs">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            id="ebc-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 pl-9"
            placeholder="username murid"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={MAX_USERNAME_LEN}
            autoComplete="username"
            disabled={busy || lockSecs > 0}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ebc-password" className="text-xs">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            id="ebc-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pl-9"
            placeholder="password"
            autoComplete="current-password"
            maxLength={MAX_PASSWORD_LEN}
            disabled={busy || lockSecs > 0}
            required
          />
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {error}
          {lockSecs > 0 ? ` Coba lagi dalam ${lockSecs} detik.` : ""}
        </p>
      )}

      <Button type="submit" size="lg" className="h-12 w-full" disabled={busy || lockSecs > 0}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Masuk & Lanjut
      </Button>
    </form>
  );
}

/* ═══════════════════════════════════════════
   Layar siap — fullscreen + wake lock
   ═══════════════════════════════════════════ */
function ReadyScreen({
  payload,
  onBack,
  onStart,
  currentUser,
}: {
  payload: Extract<EbcSessionPayload, { status: "open" }>;
  onBack: () => void;
  onStart: () => void;
  currentUser: { username: string; name: string } | null;
}) {
  const join = useMutation(api.ebc.joinSession);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    acquireWakeLock();
  }, []);

  const start = async () => {
    if (!currentUser) return;
    setBusy(true);
    const ok = await enterFullscreen();
    if (!ok) {
      toast.warning("Gagal masuk fullscreen. Ujian tetap jalan, tapi lebih mudah dikeluarin.");
    }
    try {
      await join({
        code: payload.code,
        username: currentUser.username,
        name: currentUser.name,
      });
      onStart();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal join sesi.");
      exitFullscreen();
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 self-start" onClick={onBack}>
          <ChevronLeft className="size-4" /> Kembali
        </Button>

        <div className="flex flex-1 flex-col justify-center gap-5">
          <div className="text-center">
            <Badge className="mb-3 bg-emerald-500/15 text-[10px] text-emerald-500">
              <Lock className="size-3" /> Mode Ujian Terkunci
            </Badge>
            <h1 className="text-xl font-bold leading-tight">{payload.exam.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {payload.exam.subject} · {payload.exam.className}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCell label="Jumlah soal" value={`${payload.totalQuestions}`} />
            <InfoCell
              label="Waktu"
              value={`${payload.exam.startTime} – ${payload.exam.endTime}`}
            />
            <InfoCell label="Tanggal" value={payload.exam.date} />
            <InfoCell label="Kode sesi" value={payload.code} mono />
          </div>

          <ul className="space-y-2 rounded-lg border bg-card/50 p-4 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <Maximize className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              Layar akan dikunci penuh. Jangan minimized atau pindah aplikasi.
            </li>
            <li className="flex gap-2">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              Pindah tab, jendela kedua, dan keluar fullscreen otomatis dicatat guru.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              Nilai dihitung server setelah kamu mengirim.
            </li>
          </ul>

          <Button size="lg" className="h-14 text-base" onClick={start} disabled={busy}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Maximize className="size-5" />}
            Mulai Ujian
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${mono ? "font-mono tracking-widest" : ""}`}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Exam runner
   ═══════════════════════════════════════════ */
function ExamRunner({
  payload,
  currentUser,
  onExit,
}: {
  payload: Extract<EbcSessionPayload, { status: "open" }>;
  currentUser: { username: string; name: string } | null;
  onExit: () => void;
}) {
  const questions = payload.questions;
  const heartbeat = useMutation(api.ebc.heartbeat);
  const reportViolation = useMutation(api.ebc.reportViolation);
  const submitExam = useMutation(api.ebc.submitExam);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(() => computeTimeLeft(payload.exam));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const proctorActive = !submitting;
  const { violations, liveWarning, record } = useProctoring({
    examId: `ebc-${payload.code}`,
    active: proctorActive,
    username: currentUser?.username ?? "",
  });

  const current = questions[idx];
  const answeredCount = Object.keys(answers).length;

  /* Wake lock — layar tidak boleh mati */
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    const grab = async () => {
      sentinel = await acquireWakeLock();
    };
    grab();
    const onVisible = () => {
      if (document.visibilityState === "visible") grab();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release?.().catch(() => {});
      void cancelled;
    };
  }, []);

  /* Timer */
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  /* Heartbeat ke server */
  useEffect(() => {
    if (!currentUser) return;
    const t = setInterval(() => {
      heartbeat({
        code: payload.code,
        username: currentUser.username,
        currentQuestion: idx,
        answered: Object.keys(answers).length,
        totalQuestions: questions.length,
      }).catch(() => {});
    }, HEARTBEAT_MS);
    return () => clearInterval(t);
  }, [heartbeat, payload.code, currentUser, idx, answers, questions.length]);

  /* Dorong pelanggaran ke server (hanya yang baru) */
  const pushedRef = useRef(0);
  useEffect(() => {
    if (!currentUser) return;
    if (violations.length <= pushedRef.current) return;
    const fresh = violations.slice(pushedRef.current);
    pushedRef.current = violations.length;
    fresh.forEach((v) => {
      reportViolation({
        code: payload.code,
        username: currentUser.username,
        name: currentUser.name,
        type: v.type,
        detail: v.detail,
        durationMs: v.durationMs,
        at: new Date(v.at).getTime(),
      }).catch(() => {});
    });
  }, [violations, reportViolation, payload.code, currentUser]);

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    if (!currentUser) return;
    setSubmitting(true);
    setConfirmSubmit(false);      try {
        const res = await submitExam({
          code: payload.code,
          username: currentUser.username,
          name: currentUser.name,
          answers,
        });
        // Simpan hasil di perangkat agar layar RESULT bisa menampilkannya
        try {
          localStorage.setItem("msw-ebc-last-result-" + payload.code, JSON.stringify(res));
        } catch {
          /* storage penuh — layar hasil akan menampilkan pesan */
        }
      } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim hasil.");
      setSubmitting(false);
      return;
    }
    exitFullscreen();
    onExit();
  }, [submitting, currentUser, submitExam, payload.code, answers, onExit]);

  // Waktu habis → submit otomatis
  useEffect(() => {
    if (timeLeft === 0 && !submitting) doSubmit();
  }, [timeLeft, submitting, doSubmit]);

  const answer = (qid: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [qid]: value }));

  const toggleFlag = (qid: string) =>
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });

  const urgent = timeLeft < 300;
  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Peringatan proctoring */}
      {liveWarning && (
        <div className="sticky top-0 z-50 flex items-center gap-2 bg-amber-600 px-3 py-2 text-xs font-medium text-white">
          <ShieldAlert className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{liveWarning.detail}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{payload.exam.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {idx + 1}/{questions.length} · terjawab {answeredCount}
              {violations.length > 0 ? ` · ⚠ ${violations.length}` : ""}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-sm font-bold ${
              urgent ? "border-red-500/50 text-red-500" : "text-emerald-500"
            }`}
          >
            {hh}:{mm}:{ss}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setPaletteOpen(true)} aria-label="Daftar soal">
            <LayoutGrid className="size-4" />
          </Button>
        </div>
        <div className="mx-auto mt-2 h-1 w-full max-w-md overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${questions.length ? ((idx + 1) / questions.length) * 100 : 0}%` }}
          />
        </div>
      </header>

      {/* Soal */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        {!current ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Tidak ada soal.</p>
        ) : current.type === "Pilihan Ganda" ? (
          <>
            <div className="mb-4 flex items-start gap-2">
              <span className="text-base font-bold text-primary">{idx + 1}.</span>
              <p className="flex-1 text-[15px] leading-relaxed">{current.question}</p>
              <button
                onClick={() => toggleFlag(current.id)}
                className="shrink-0 rounded-md p-1.5"
                aria-label="Tandai soal"
              >
                <Flag
                  className={`size-4 ${flagged.has(current.id) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                />
              </button>
            </div>

            <div className="space-y-2.5">
              {current.options.map((opt, oi) => {
                const letter = String.fromCharCode(65 + oi);
                const selected = answers[current.id] === letter;
                return (
                  <button
                    key={oi}
                    onClick={() => answer(current.id, letter)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card active:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-start gap-2">
              <span className="text-base font-bold text-primary">{idx + 1}.</span>
              <p className="flex-1 text-[15px] leading-relaxed">{current.question}</p>
            </div>
            <Textarea
              value={answers[current.id] ?? ""}
              onChange={(e) => answer(current.id, e.target.value)}
              rows={8}
              className="text-sm"
              placeholder="Tulis jawabanmu di sini…"
            />
          </>
        )}
      </main>

      {/* Nav */}
      <footer className="sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={idx === 0}
            onClick={() => setIdx((i) => i - 1)}
          >
            <ChevronLeft className="size-4" /> Prev
          </Button>
          {idx === questions.length - 1 ? (
            <Button size="lg" className="flex-1" onClick={() => setConfirmSubmit(true)}>
              Kirim <CheckCircle2 className="size-4" />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={() => setIdx((i) => i + 1)}>
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mx-auto mt-2 flex max-w-md text-xs"
          onClick={() => setConfirmSubmit(true)}
        >
          Selesai & kirim sekarang
        </Button>
      </footer>

      {/* Palet soal */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Daftar Soal</h2>
            <Button variant="ghost" size="sm" onClick={() => setPaletteOpen(false)}>
              Tutup
            </Button>
          </div>
          <div className="grid flex-1 auto-rows-min grid-cols-5 gap-2 overflow-y-auto p-4">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setIdx(i);
                    setPaletteOpen(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold ${
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isAnswered
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-500"
                        : "border-border bg-card"
                  } ${flagged.has(q.id) ? "ring-1 ring-amber-500" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="border-t p-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                setPaletteOpen(false);
                setConfirmSubmit(true);
              }}
            >
              Selesai & kirim
            </Button>
          </div>
        </div>
      )}

      {/* Konfirmasi submit */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xs rounded-xl border bg-card p-5 text-center">
            <AlertTriangle className="mx-auto mb-3 size-8 text-amber-500" />
            <h3 className="text-sm font-semibold">Kirim jawaban sekarang?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Terjawab {answeredCount}/{questions.length}. Setelah dikirim tidak bisa diubah.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmSubmit(false)}>
                Batal
              </Button>
              <Button className="flex-1" onClick={doSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : "Kirim"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Log pelanggaran (untuk siswa, biar sadari tercatat) */}
      {violations.length > 0 && (
        <button
          onClick={() =>
            toast.message(
              violations
                .slice(-5)
                .map((v, i) => `${i + 1}. ${v.detail}`)
                .join("\n"),
              { duration: 8000 },
            )
          }
          className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-500"
        >
          {violations.length} pelanggaran tercatat
        </button>
      )}

      {/* Kunci lagi fullscreen + wake lock kalau student kabur */}
      <KeepLocked active={proctorActive} onLost={record} />
    </div>
  );
}

/* Re-enter fullscreen + wake lock terus-menerus selama ujian */
function KeepLocked({
  active,
  onLost,
}: {
  active: boolean;
  onLost: (type: "keluar-fullscreen", detail: string) => void;
}) {
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      if (!document.fullscreenElement) {
        onLost("keluar-fullscreen", "Layar penuh keluar dengan sendirinya saat ujian berjalan.");
        enterFullscreen();
      }
    }, 4000);
    return () => clearInterval(t);
  }, [active, onLost]);
  return null;
}

/* ═══════════════════════════════════════════
   Hasil
   ═══════════════════════════════════════════ */
function ResultScreen({ code, onDone }: { code: string; onDone: () => void }) {
  const [summary, setSummary] = useState<SubmitSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = "msw-ebc-last-result-" + code;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setSummary(JSON.parse(raw));
        return;
      }
    } catch {
      /* abaikan */
    }
    setError("Hasil ujian tidak ditemukan di perangkat ini.");
  }, [code]);

  return (
    <Shell>
      {summary ? (
        <div className="space-y-5 py-6 text-center">
          <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
          <h1 className="text-xl font-bold">Ujian Selesai</h1>

          <div className="text-6xl font-bold text-primary">
            {summary.score}
            <span className="text-2xl text-muted-foreground">%</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Cell label="Benar" value={summary.correct} tone="text-emerald-500" />
            <Cell label="Salah" value={summary.wrong} tone="text-red-500" />
            <Cell label="Kosong" value={summary.unanswered} />
          </div>

          {summary.violationCount > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-400">
              Kamu tercatat {summary.violationCount} kali keluar dari halaman ujian.
              Guru sudah bisa melihat detailnya.
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            Nilai dihitung oleh server dari kunci jawaban. Sesi kode {code}.
          </p>

          <Button size="lg" className="w-full" onClick={onDone}>
            Selesai
          </Button>
        </div>
      ) : (
        <div className="py-16 text-center">
          {error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : (
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
          )}
          <Button variant="outline" className="mt-5 w-full" onClick={onDone}>
            Kembali
          </Button>
        </div>
      )}
    </Shell>
  );
}

function Cell({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className={`text-2xl font-bold ${tone ?? ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* Hitung sisa waktu dari jadwal ujian (format 24 jam) */
function computeTimeLeft(exam: { date: string; startTime: string; endTime: string }): number {
  const [sh, sm] = (exam.startTime || "08:00").split(":").map(Number);
  const [eh, em] = (exam.endTime || "10:00").split(":").map(Number);
  const startMs = new Date(exam.date);
  startMs.setHours(sh || 0, sm || 0, 0, 0);
  const endMs = new Date(exam.date);
  endMs.setHours(eh || 0, em || 0, 0, 0);
  const now = Date.now();
  if (now >= endMs.getTime()) return 0;
  if (now <= startMs.getTime()) return Math.floor((endMs.getTime() - startMs.getTime()) / 1000);
  return Math.floor((endMs.getTime() - now) / 1000);
}
