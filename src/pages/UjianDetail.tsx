import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
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
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { UjianData } from "./Ujian";
import type { SoalItem } from "./BankSoal";

/* ═══════════════════════════════════════════
   CBT EXAM — Take exam, answer, submit
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
  const [ujian, setUjian] = useState<UjianData | null>(null);
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Load exam data + soal
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UJIAN_KEY);
      if (raw) {
        const list: UjianData[] = JSON.parse(raw);
        const found = list.find((u) => u.id === id);
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
              selected = allSoal.filter((s) => s.subject === found.subject);
            }
            setSoalList(selected);
          }

          // Calculate time remaining
          const now = new Date();
          const [sh, sm] = found.startTime.split(":").map(Number);
          const [eh, em] = found.endTime.split(":").map(Number);
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

  // Timer countdown
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
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
  }, [submitted, timeLeft]);

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
    if (!soalList.length || !ujian) return;

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
  }, [soalList, answers, ujian, id]);

  const handleRetry = () => {
    setAnswers({});
    setFlagged(new Set());
    setCurrentIdx(0);
    setSubmitted(false);
    setResult(null);
    localStorage.removeItem(RESULT_KEY_PREFIX + id);
    localStorage.removeItem(ANSWER_KEY_PREFIX + id);
    localStorage.removeItem("msw-cbt-flagged-" + id);
  };

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
              Dikerjakan: {new Date(result.submittedAt).toLocaleString("id-ID")}
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

  const currentSoalItem = soalList[currentIdx];
  const timerColor = timeLeft < 300 ? "text-red-500" : timeLeft < 900 ? "text-amber-500" : "text-emerald-500";

  return (
    <DashboardShell>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Link to="/ujian">
              <Button variant="ghost" size="icon-sm">
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
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                  className="h-full rounded-full bg-primary transition-all"
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
              <div className="grid grid-cols-5 gap-1.5">
                {soalList.map((s, i) => {
                  const isAnswered = !!answers[s.id];
                  const isFlaggedItem = flagged.has(s.id);
                  const isCurrent = i === currentIdx;

                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`aspect-square rounded-md text-[11px] font-medium transition-all relative ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                          : isAnswered
                          ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {i + 1}
                      {isFlaggedItem && (
                        <span className="absolute -top-1 -right-1 size-1.5 bg-amber-500 rounded-full" />
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
    </DashboardShell>
  );
}
