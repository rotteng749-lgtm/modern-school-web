import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Maximize,
  Monitor,
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { UjianData } from "./Ujian";
import type { SoalItem } from "./BankSoal";
import { useLocalAuth } from "@/hooks/use-local-auth";

/* ═══════════════════════════════════════════
   CBT EXAM — Fullscreen + Anti-cheat
   Yayasan Mambaul Hasan
   ═══════════════════════════════════════════ */

const UJIAN_KEY = "msw-ujian";
const SOAL_KEY = "msw-bank-soal";
const ANSWER_KEY_PREFIX = "msw-cbt-answers-";
const RESULT_KEY_PREFIX = "msw-cbt-result-";

interface ExamResult {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  answers: Record<string, string>;
  submittedAt: string;
}

export default function UjianDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ujian, setUjian] = useState<UjianData | null>(null);
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const { user: currentUser } = useLocalAuth();

  /* ── Anti-cheat state ── */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [backWarning, setBackWarning] = useState(false);
  const backWarningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [started, setStarted] = useState(false);

  // Load exam data + soal
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UJIAN_KEY);
      if (raw) {
        const list: UjianData[] = JSON.parse(raw);
        const found = list.find((u) => String(u.id) === String(id));
        if (found) {
          setUjian(found);

          // Load soal from bank soal
          const soalRaw = localStorage.getItem(SOAL_KEY);
          if (soalRaw) {
            const allSoal: SoalItem[] = JSON.parse(soalRaw);
            let selected: SoalItem[];
            if (found.questionIds && found.questionIds.length > 0) {
              selected = allSoal.filter((s) => found.questionIds!.includes(s.id));
            } else {
              selected = allSoal.filter((s) => {
                const matchSubject = s.subject === found.subject;
                const matchKelas = !found.className || !s.className || s.className === found.className;
                return matchSubject && matchKelas;
              });
            }
            setSoalList(selected);
          }

          // Calculate time remaining
          const now = new Date();
          const startTime = found.startTime || "08:00";
          const endTime = found.endTime || "10:00";
          const [sh, sm] = startTime.split(":").map(Number);
          const [eh, em] = endTime.split(":").map(Number);
          const startMs = new Date(found.date);
          startMs.setHours(sh, sm, 0, 0);
          const endMs = new Date(found.date);
          endMs.setHours(eh, em, 0, 0);

          if (now >= endMs) {
            setTimeLeft(0);
          } else if (now <= startMs) {
            setTimeLeft(Math.floor((endMs.getTime() - startMs.getTime()) / 1000));
          } else {
            setTimeLeft(Math.floor((endMs.getTime() - now.getTime()) / 1000));
          }

          // Load saved answers
          const savedAnswers = localStorage.getItem(ANSWER_KEY_PREFIX + id);
          if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

          const savedFlagged = localStorage.getItem("msw-cbt-flagged-" + id);
          if (savedFlagged) setFlagged(new Set(JSON.parse(savedFlagged)));

          // Load existing result
          const savedResult = localStorage.getItem(RESULT_KEY_PREFIX + id);
          if (savedResult) {
            setResult(JSON.parse(savedResult));
            setSubmitted(true);
          }
        }
      }
    } catch { /* ignore */ }
  }, [id]);

  /* ── Fullscreen API ── */
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setShowFullscreenPrompt(false);
        setStarted(true);
      }).catch(() => {
        // User denied fullscreen — still allow exam but warn
        setShowFullscreenPrompt(false);
        setStarted(true);
      });
    } else {
      setShowFullscreenPrompt(false);
      setStarted(true);
    }
  }, []);

  const skipFullscreen = useCallback(() => {
    setShowFullscreenPrompt(false);
    setStarted(true);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && started && !submitted) {
        // Exited fullscreen — try to re-enter
        try {
          document.documentElement.requestFullscreen?.();
        } catch { /* ignore */ }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [started, submitted]);

  /* ── Anti-cheat: back button detection ── */
  useEffect(() => {
    if (!started || submitted) return;

    // Push extra history entry so "back" triggers popstate
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      // Push again to prevent actual navigation
      window.history.pushState(null, "", window.location.href);

      if (backWarningTimeout.current) clearTimeout(backWarningTimeout.current);
      setBackWarning(true);
      backWarningTimeout.current = setTimeout(() => setBackWarning(false), 3000);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [started, submitted]);

  /* ── Anti-cheat: block copy/paste/context menu ── */
  useEffect(() => {
    if (!started || submitted) return;

    const prevent = (e: Event) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+S, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey && ["c", "v", "x", "u", "s"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j")
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("keydown", blockKey);

    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", blockKey);
    };
  }, [started, submitted]);

  /* ── Keyboard shortcut: A-E to select answer ── */
  useEffect(() => {
    if (!started || submitted || !currentSoal) return;
    if (currentSoal.type !== "Pilihan Ganda") return;

    const onKey = (e: KeyboardEvent) => {
      // Only respond if not typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (idx < currentSoal.options.length) {
          handleAnswer(currentSoal.id, key);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, currentIdx, submitted, soalList]);

  /* ── Disable text selection on the exam body ── */
  useEffect(() => {
    if (!started || submitted) return;
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [started, submitted]);

  // Timer countdown — only runs after the student actually starts the exam
  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, submitted, timeLeft]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(ANSWER_KEY_PREFIX + id, JSON.stringify(answers));
    }
  }, [answers, id]);

  useEffect(() => {
    if (flagged.size > 0) {
      localStorage.setItem("msw-cbt-flagged-" + id, JSON.stringify(Array.from(flagged)));
    }
  }, [flagged, id]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const currentSoal = soalList[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  const handleAnswer = (soalId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [soalId]: value }));
  };

  const toggleFlag = (soalId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(soalId)) next.delete(soalId);
      else next.add(soalId);
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    // Only the student taking the exam may submit — guards against
    // stray calls (e.g. timer) while the prompt/monitor view is open.
    if (!started || submitted || !soalList.length || !ujian) return;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    soalList.forEach((s) => {
      const userAnswer = answers[s.id];
      if (!userAnswer || userAnswer.trim() === "") {
        unanswered++;
      } else if (s.type === "Pilihan Ganda") {
        if (userAnswer.trim().toLowerCase() === s.answer.trim().toLowerCase()) {
          correct++;
        } else {
          wrong++;
        }
      } else {
        correct++;
      }
    });

    const score = soalList.length > 0 ? Math.round((correct / soalList.length) * 100) : 0;

    const examResult: ExamResult = {
      score,
      total: soalList.length,
      correct,
      wrong,
      unanswered,
      answers: { ...answers },
      submittedAt: new Date().toISOString(),
    };

    setResult(examResult);
    setSubmitted(true);
    localStorage.setItem(RESULT_KEY_PREFIX + id, JSON.stringify(examResult));
    localStorage.removeItem(ANSWER_KEY_PREFIX + id);
    localStorage.removeItem("msw-cbt-flagged-" + id);
    setConfirmSubmit(false);
    setStarted(false);

    // Auto-post exam result to Pengumuman so student can see it
    try {
      const pengumumanKey = "msw-pengumuman";
      const existing: unknown[] = JSON.parse(localStorage.getItem(pengumumanKey) || "[]");
      const scoreEmoji = score >= 80 ? "🏆" : score >= 60 ? "✅" : "📝";
      const newPengumuman = {
        id: `ujian-${id}-${Date.now()}`,
        title: `${scoreEmoji} Hasil Ujian: ${ujian.name}`,
        category: "Akademik",
        excerpt: `Nilai: ${score}% — ${correct} benar, ${wrong} salah, ${unanswered} kosong dari ${soalList.length} soal`,
        content: `Hasil Ujian: ${ujian.name}\nMata Pelajaran: ${ujian.subject}\nKelas: ${ujian.className || "-"}\n\nNilai: ${score}%\nBenar: ${correct}\nSalah: ${wrong}\nKosong: ${unanswered}\nTotal: ${soalList.length} soal\n\nDikerjakan: ${new Date().toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}`,
        views: 0,
        publishedAt: new Date().toISOString().split("T")[0],
        isPublished: true,
        // Attach student info for filtering
        studentUsername: currentUser?.username || "",
        studentName: currentUser?.name || "",
        examId: id,
        examScore: score,
      };
      localStorage.setItem(pengumumanKey, JSON.stringify([newPengumuman, ...existing]));
    } catch { /* ignore */ }

    // Exit fullscreen on submit
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [soalList, answers, ujian, id, started, submitted]);

  const handleRetry = () => {
    setAnswers({});
    setFlagged(new Set());
    setCurrentIdx(0);
    setSubmitted(false);
    setResult(null);
    setShowFullscreenPrompt(true);
    setStarted(false);
    localStorage.removeItem(RESULT_KEY_PREFIX + id);
    localStorage.removeItem(ANSWER_KEY_PREFIX + id);
    localStorage.removeItem("msw-cbt-flagged-" + id);
  };

  // Role gating: only siswa take the exam; admin/guru/orangtua monitor
  const role = currentUser?.role ?? "siswa";
  const canTake = role === "siswa";
  const isMonitor = !canTake;
  const staffView = role === "admin" || role === "guru";

  // Loading / not found
  if (!ujian) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">Ujian tidak ditemukan.</p>
          <Link to="/ujian">
            <Button variant="outline">
              <ArrowLeft className="size-4" /> Kembali
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // ── MONITOR MODE — guru/admin/orangtua cannot take the exam ──
  if (isMonitor) {
    const dateLabel = (() => {
      try {
        return new Date(`${ujian.date}T00:00:00`).toLocaleDateString("id-ID", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
      } catch {
        return ujian.date;
      }
    })();
    const durasi = ujian.startTime && ujian.endTime ? `${ujian.startTime} – ${ujian.endTime} WIB` : "—";
    const isActive = ujian.status === "active";

    return (
      <DashboardShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/ujian">
                <Button variant="outline" size="icon-sm" aria-label="Kembali ke daftar ujian">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">{ujian.name}</h1>
                  <Badge className="text-[10px] bg-sky-500/15 text-sky-500">
                    <Monitor className="size-3" /> Mode Monitoring
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Anda hanya bisa memantau — ujian dikerjakan oleh siswa.
                </p>
              </div>
            </div>
          </div>

          {/* Info summary */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <BookOpen className="size-4 text-primary" /> Mata Pelajaran
              </div>
              <p className="mt-1.5 text-sm font-bold">{ujian.subject}</p>
              <p className="text-xs text-muted-foreground">{ujian.className}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Calendar className="size-4 text-primary" /> Jadwal
              </div>
              <p className="mt-1.5 text-sm font-bold">{dateLabel}</p>
              <p className="text-xs text-muted-foreground">{durasi} (24 jam)</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ClipboardCheck className="size-4 text-primary" /> Status
              </div>
              <p className="mt-1.5 text-sm font-bold">
                {isActive ? "Berlangsung" : ujian.status === "upcoming" ? "Mendatang" : "Selesai"}
              </p>
              <p className="text-xs text-muted-foreground">Waktu berjalan otomatis</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Users className="size-4 text-primary" /> Peserta & Soal
              </div>
              <p className="mt-1.5 text-sm font-bold">{soalList.length} soal</p>
              <p className="text-xs text-muted-foreground">{ujian.totalStudents} siswa terdaftar</p>
            </div>
          </div>

          {/* Soal list (read-only) */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daftar Soal Ujian ({soalList.length})
            </h2>
            {soalList.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 text-center shadow-xs">
                <AlertTriangle className="mx-auto size-8 text-amber-500" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada soal yang dilampirkan ke ujian ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {soalList.map((s, i) => (
                  <div key={s.id} className="rounded-xl border bg-card p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1 text-sm font-medium leading-snug whitespace-pre-wrap">
                        <span className="mr-1.5 font-bold text-primary">{i + 1}.</span>
                        {s.question}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {s.type}
                      </Badge>
                    </div>
                    {s.type === "Pilihan Ganda" && s.options.length > 0 && (
                      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                        {s.options.map((opt, oi) => {
                          const letter = String.fromCharCode(65 + oi);
                          const isKey = staffView && letter === s.answer.trim().toUpperCase();
                          return (
                            <div
                              key={oi}
                              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px] ${
                                isKey ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" : "border-border bg-muted/30"
                              }`}
                            >
                              <span className="font-semibold">{letter}.</span>
                              <span className="flex-1">{opt}</span>
                              {isKey && <CheckCircle className="mt-0.5 size-3.5 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {staffView && s.answer && (
                      <p className="mt-2 text-[11px] text-emerald-600">
                        <CheckCircle className="inline size-3 mr-1" />
                        Kunci jawaban: <b>{s.answer}</b>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Result screen
  if (submitted && result) {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          <Card3D intensity={3} className="p-8 text-center obsidian-sheen">
            <CheckCircle className="size-12 mx-auto text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold">Ujian Selesai!</h2>
            <p className="text-muted-foreground mt-1">{ujian.name}</p>

            <div className="mt-6 text-6xl font-bold text-primary">
              {result.score}
              <span className="text-2xl text-muted-foreground">%</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <p className="text-2xl font-bold text-emerald-500">{result.correct}</p>
                <p className="text-[11px] text-muted-foreground">Benar</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-500">{result.wrong}</p>
                <p className="text-[11px] text-muted-foreground">Salah</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{result.unanswered}</p>
                <p className="text-[11px] text-muted-foreground">Kosong</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Dikerjakan: {new Date(result.submittedAt).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
            </p>
          </Card3D>

          {/* Review answers */}
          <Card3D intensity={2} className="p-6 obsidian-sheen">
            <h3 className="font-semibold text-sm mb-4">Review Jawaban</h3>
            <div className="space-y-4">
              {soalList.map((s, i) => {
                const userAns = result.answers[s.id];
                const isCorrect = s.type === "Pilihan Ganda"
                  ? userAns?.trim().toLowerCase() === s.answer.trim().toLowerCase()
                  : !!userAns;
                const isBlank = !userAns || userAns.trim() === "";

                return (
                  <div key={s.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-muted-foreground shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{s.question}</p>
                        {s.type === "Pilihan Ganda" && (
                          <div className="mt-2 space-y-1">
                            {s.options.map((opt, oi) => {
                              const letter = String.fromCharCode(65 + oi);
                              const isSelected = userAns === letter;
                              const isAnswer = s.answer === letter;
                              return (
                                <div
                                  key={oi}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isAnswer ? "bg-emerald-500/10 text-emerald-600 font-medium" :
                                    isSelected && !isAnswer ? "bg-red-500/10 text-red-500 line-through" :
                                    "text-muted-foreground"
                                  }`}
                                >
                                  {letter}. {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {s.type === "Uraian" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Jawaban: <span className="font-mono">{userAns || "—"}</span>
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {isBlank ? (
                          <XCircle className="size-4 text-muted-foreground" />
                        ) : isCorrect ? (
                          <CheckCircle className="size-4 text-emerald-500" />
                        ) : (
                          <XCircle className="size-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card3D>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="size-4" /> Ulangi
            </Button>
            <Link to="/ujian">
              <Button>
                <ArrowLeft className="size-4" /> Kembali ke Daftar Ujian
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // No questions
  if (soalList.length === 0) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">Tidak ada soal untuk ujian ini. Admin belum menambahkan soal dari Bank Soal.</p>
          <Link to="/ujian">
            <Button variant="outline">
              <ArrowLeft className="size-4" /> Kembali
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Fullscreen prompt overlay
  if (showFullscreenPrompt) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="text-center max-w-md">
            <Maximize className="size-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Siap Mulai Ujian?</h2>
            <p className="text-sm text-muted-foreground mb-1">{ujian.name}</p>
            <p className="text-sm text-muted-foreground">
              {soalList.length} soal · {ujian.className} · {ujian.subject}
            </p>
            <p className="text-xs text-amber-500 mt-3">
              Layar akan fullscreen untuk mencegah kecurangan. Copy/paste dan tombol developer akan dinonaktifkan.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/ujian")}>
              <ArrowLeft className="size-4" /> Batal
            </Button>
            <Button onClick={enterFullscreen} className="px-8">
              <Maximize className="size-4 mr-2" /> Mulai Fullscreen
            </Button>
            <Button variant="ghost" onClick={skipFullscreen} className="text-xs text-muted-foreground">
              Lewati Fullscreen
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const currentSoalItem = soalList[currentIdx];
  const timerColor = timeLeft < 300 ? "text-red-500" : timeLeft < 900 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="min-h-screen bg-background" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
      {/* Back navigation warning */}
      {backWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="size-4" />
          Navigasi kembali terdeteksi! Ujian tidak boleh ditinggal.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Link to="/ujian" onClick={(e) => e.preventDefault()}>
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.preventDefault(); setBackWarning(true); setTimeout(() => setBackWarning(false), 3000); }}>
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[300px]">{ujian.name}</h1>
              <p className="text-[11px] text-muted-foreground">{ujian.className} · {ujian.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {currentIdx + 1} / {soalList.length}
            </Badge>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${timerColor}`}>
              <Clock className="size-3.5" />
              <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Main question area */}
          <div className="flex-1 min-w-0">
            <Card3D intensity={2} className="p-6 obsidian-sheen">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-lg font-bold text-primary shrink-0">
                  {currentIdx + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px]">{currentSoalItem.type}</Badge>
                    <Badge variant="outline" className="text-[10px]">{currentSoalItem.difficulty}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      Tekan A-E untuk menjawab
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentSoalItem.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggleFlag(currentSoalItem.id)}
                  className={flagged.has(currentSoalItem.id) ? "text-amber-500" : ""}
                >
                  <Flag className="size-3.5" />
                </Button>
              </div>

              {/* Answer options */}
              {currentSoalItem.type === "Pilihan Ganda" ? (
                <div className="space-y-2 ml-8">
                  {currentSoalItem.options.map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    const isSelected = answers[currentSoalItem.id] === letter;
                    return (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`soal-${currentSoalItem.id}`}
                          value={letter}
                          checked={isSelected}
                          onChange={() => handleAnswer(currentSoalItem.id, letter)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium shrink-0">{letter}.</span>
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="ml-8">
                  <Textarea
                    placeholder="Tulis jawaban uraian di sini..."
                    value={answers[currentSoalItem.id] || ""}
                    onChange={(e) => handleAnswer(currentSoalItem.id, e.target.value)}
                    rows={5}
                    className="text-sm"
                  />
                </div>
              )}
            </Card3D>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                <ChevronLeft className="size-3.5" /> Sebelumnya
              </Button>
              {currentIdx === soalList.length - 1 ? (
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setConfirmSubmit(true)}
                >
                  <Send className="size-3.5" /> Selesai & Submit
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setCurrentIdx((i) => Math.min(soalList.length - 1, i + 1))}
                >
                  Selanjutnya <ChevronRight className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-64 shrink-0 space-y-3">
            <Card3D intensity={1} className="p-4 obsidian-sheen">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Dijawab</span>
                <span className="font-bold">{answeredCount}/{soalList.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-150"
                  style={{ width: `${(answeredCount / soalList.length) * 100}%` }}
                />
              </div>
              {flaggedCount > 0 && (
                <p className="mt-2 text-[10px] text-amber-500">
                  <Flag className="size-3 inline mr-1" />
                  {flaggedCount} soal ditandai
                </p>
              )}
            </Card3D>

            <Card3D intensity={1} className="p-4 obsidian-sheen">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Navigasi Soal
              </p>
              <div className="grid grid-cols-6 gap-1">
                {soalList.map((s, i) => {
                  const isAnswered = !!answers[s.id];
                  const isFlaggedItem = flagged.has(s.id);
                  const isCurrent = i === currentIdx;

                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`aspect-square rounded text-[10px] font-medium transition-colors relative ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-1 ring-primary/50"
                          : isAnswered
                          ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {i + 1}
                      {isFlaggedItem && (
                        <span className="absolute -top-0.5 -right-0.5 size-1 bg-amber-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card3D>

            <Button
              className="w-full"
              onClick={() => setConfirmSubmit(true)}
            >
              <Send className="size-3.5" /> Submit Jawaban
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm submit dialog */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card3D intensity={2} className="w-full max-w-sm p-6 m-4">
            <h3 className="font-bold text-lg">Konfirmasi Submit</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Kamu sudah menjawab <strong>{answeredCount}</strong> dari <strong>{soalList.length}</strong> soal.
              {soalList.length - answeredCount > 0 && (
                <span className="text-amber-500"> Masih ada {soalList.length - answeredCount} soal yang belum dijawab.</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Setelah submit, kamu tidak bisa mengubah jawaban lagi.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmSubmit(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                <Send className="size-3.5" /> Ya, Submit!
              </Button>
            </div>
          </Card3D>
        </div>
      )}
    </div>
  );
}
