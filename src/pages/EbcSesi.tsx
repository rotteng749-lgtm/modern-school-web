import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CloudUpload,
  QrCode,
  Radio,
  RefreshCw,
  ShieldAlert,
  Users,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Ban,
  MonitorSmartphone,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card3D } from "@/components/Card3D";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { buildJoinUrl } from "@/lib/ebc";
import type { UjianData } from "./Ujian";
import type { SoalItem } from "./BankSoal";

/* ═══════════════════════════════════════════
   EBC — Halaman guru/pengawas
   Publish ujian ke server, buat sesi QR,
   lalu pantau peserta secara live.
   ═══════════════════════════════════════════ */

const UJIAN_KEY = "msw-ujian";
const SOAL_KEY = "msw-bank-soal";
const MURID_KEY = "msw-murid";

const fmtTime = (ms: number) =>
  new Date(ms).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function EbcSesi() {
  const { id } = useParams<{ id: string }>();
  const { user } = useLocalAuth();
  const [ujian, setUjian] = useState<UjianData | null>(null);
  const [soal, setSoal] = useState<SoalItem[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const publish = useMutation(api.ebc.publishExam);
  const publishRoster = useMutation(api.ebc.publishRoster);
  const createSession = useMutation(api.ebc.createSession);
  const closeSession = useMutation(api.ebc.closeSession);

  const monitor = useQuery(
    api.ebc.sessionMonitor,
    code ? { code } : "skip",
  );

  // Muat ujian + soal dari localStorage
  useEffect(() => {
    try {
      const examRaw = localStorage.getItem(UJIAN_KEY);
      const examList: UjianData[] = examRaw ? JSON.parse(examRaw) : [];
      const found = examList.find((u) => String(u.id) === String(id));
      if (!found) {
        setLoadError("Ujian tidak ditemukan di perangkat ini.");
        return;
      }
      setUjian(found);

      const soalRaw = localStorage.getItem(SOAL_KEY);
      const allSoal: SoalItem[] = soalRaw ? JSON.parse(soalRaw) : [];
      const selected =
        found.questionIds && found.questionIds.length > 0
          ? allSoal.filter((s) => found.questionIds!.includes(s.id))
          : allSoal.filter(
              (s) =>
                s.subject === found.subject &&
                (!found.className || !s.className || s.className === found.className),
            );
      setSoal(selected);
    } catch {
      setLoadError("Gagal membaca data ujian.");
    }
  }, [id]);

  const joinUrl = useMemo(
    () => (code ? buildJoinUrl(window.location.origin, code) : null),
    [code],
  );

  // Render QR saat kode sesi tersedia
  useEffect(() => {
    if (!joinUrl) {
      setQrDataUrl(null);
      return;
    }
    let alive = true;
    QRCode.toDataURL(joinUrl, {
      width: 420,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#060a12", light: "#ffffff" },
    })
      .then((url) => {
        if (alive) setQrDataUrl(url);
      })
      .catch(() => {
        if (alive) setQrDataUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [joinUrl]);

  const handlePublish = async () => {
    if (!ujian || !user) return;
    if (soal.length === 0) {
      toast.error("Ujian ini belum punya soal. Tambahkan soal di Bank Soal dulu.");
      return;
    }
    try {
      // 1. Akun murid — tanpa ini login di HP siswa akan selalu gagal,
      //    karena akun dibuat di perangkat guru (localStorage terpisah).
      const roster: { username: string; name: string; password: string; className: string }[] = [];
      try {
        const muridRaw = localStorage.getItem(MURID_KEY);
        const muridList: Array<{
          username?: string; name: string; password?: string; className?: string; status?: string;
        }> = muridRaw ? JSON.parse(muridRaw) : [];
        for (const m of muridList) {
          if (!m.username || !m.password) continue;
          if (m.status && m.status !== "aktif") continue;
          roster.push({
            username: m.username,
            name: m.name,
            password: m.password,
            className: m.className ?? "",
          });
        }
      } catch { /* abaikan */ }

      const rosterRes = await publishRoster({ students: roster });

      // 2. Ujian + soal
      const res = await publish({
        exam: {
          localId: String(ujian.id),
          name: ujian.name,
          className: ujian.className,
          subject: ujian.subject,
          date: ujian.date,
          startTime: ujian.startTime,
          endTime: ujian.endTime,
          totalStudents: ujian.totalStudents,
          questionIds: soal.map((s) => s.id),
        },
        questions: soal.map((s) => ({
          localId: s.id,
          question: s.question,
          options: s.options,
          answer: s.answer,
          subject: s.subject,
          className: s.className,
          type: s.type,
          difficulty: s.difficulty,
          createdAt: s.createdAt,
        })),
        publishedBy: user.username,
      });
      toast.success(
        `Ujian dipublish (${res.questions} soal, ${rosterRes.students} akun murid).`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal publish ujian.");
    }
  };

  const handleCreateSession = async () => {
    if (!ujian || !user) return;
    try {
      const res = await createSession({ examLocalId: String(ujian.id), createdBy: user.username });
      setCode(res.code);
      toast.success(res.reused ? `Sesi aktif dipakai: ${res.code}` : `Sesi baru dibuat: ${res.code}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat sesi.");
    }
  };

  const handleClose = async () => {
    if (!code) return;
    if (!confirm("Tutup sesi ujian? Siswa yang belum selesai akan loseksi.")) return;
    try {
      await closeSession({ code });
      toast.success("Sesi ditutup.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menutup sesi.");
    }
  };

  const handleCopy = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin. Salin manual dari layar.");
    }
  };

  if (loadError) {
    return (
      <DashboardShell>
        <EmptyState
          title="Ujian tidak ditemukan"
          description={loadError}
          action={
            <Link to="/ujian">
              <Button variant="outline">
                <ArrowLeft className="size-4" /> Kembali
              </Button>
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  if (!ujian) {
    return (
      <DashboardShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  const candidates = monitor?.candidates ?? [];
  const results = monitor?.results ?? [];
  const violations = monitor?.violations ?? [];
  const onlineCount = candidates.filter((c) => c.online).length;
  const sessionActive = monitor?.session?.active ?? false;

  return (
    <DashboardShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/ujian">
              <Button variant="outline" size="icon-sm" aria-label="Kembali ke daftar ujian">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{ujian.name}</h1>
                <Badge className="bg-emerald-500/15 text-[10px] text-emerald-500">
                  <MonitorSmartphone className="size-3" /> Exam Browser Client
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {ujian.className} · {ujian.subject} · {soal.length} soal
              </p>
            </div>
          </div>
          {code && (
            <Button variant="outline" size="sm" onClick={handleClose} disabled={!sessionActive}>
              <Ban className="size-4" /> Tutup Sesi
            </Button>
          )}
        </div>

        {/* Langkah 1 — publish */}
        <Card3D intensity={2} className="p-5 obsidian-sheen">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CloudUpload className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">1. Publish ujian ke server</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mengirim {soal.length} soal, detail ujian, dan seluruh akun murid ke Convex
                  supaya HP siswa bisa mengambilnya. Kunci jawaban tidak pernah dikirim ke HP.
                </p>
              </div>
            </div>
            <Button onClick={handlePublish} disabled={soal.length === 0}>
              <CloudUpload className="size-4" /> Publish
            </Button>
          </div>
        </Card3D>

        {/* Langkah 2 — sesi + QR */}
        {!code ? (
          <Card3D intensity={2} className="p-5 obsidian-sheen">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <QrCode className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">2. Buat sesi ujian</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Menghasilkan kode QR. Tampilkan di proyektor / layar depan kelas.
                  </p>
                </div>
              </div>
              <Button onClick={handleCreateSession} disabled={soal.length === 0}>
                <QrCode className="size-4" /> Buat Sesi QR
              </Button>
            </div>
          </Card3D>
        ) : (
          <Card3D intensity={3} className="p-5 obsidian-sheen">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex flex-col items-center gap-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR kode sesi ujian"
                    className="h-56 w-56 rounded-xl border-4 border-white bg-white p-2"
                  />
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center rounded-xl border bg-muted">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                <p className="text-2xl font-mono font-bold tracking-[0.4em]">{code}</p>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={sessionActive ? "default" : "secondary"}>
                    {sessionActive ? "Sesi Aktif" : "Sesi Ditutup"}
                  </Badge>
                  {monitor?.session?.expiresAt && (
                    <span className="text-xs text-muted-foreground">
                      Berlaku sampai {fmtTime(monitor.session.expiresAt)}
                    </span>
                  )}
                </div>
                <ol className="space-y-1.5 text-xs text-muted-foreground">
                  <li>1. Siswa buka aplikasi <strong>EBC YMH</strong> di HP.</li>
                  <li>2. Tekan <strong>Scan QR</strong>, arahkan ke layar ini.</li>
                  <li>3. Masuk memakai akun murid, lalu ujian langsung terkunci penuh layar.</li>
                </ol>
                {joinUrl && (
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-2 py-1.5 text-[11px]">
                      {joinUrl}
                    </code>
                    <Button variant="outline" size="icon-sm" onClick={handleCopy} aria-label="Salin tautan">
                      {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card3D>
        )}

        {/* Langkah 3 — monitor live */}
        {code && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={<Users className="size-4 text-primary" />} label="Peserta" value={candidates.length} />
              <StatCard
                icon={<Radio className="size-4 text-emerald-500" />}
                label="Sedang Dikerjakan"
                value={onlineCount}
              />
              <StatCard
                icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                label="Selesai"
                value={results.length}
              />
              <StatCard
                icon={<ShieldAlert className="size-4 text-amber-500" />}
                label="Pelanggaran"
                value={violations.length}
                tone={violations.length > 0 ? "amber" : undefined}
              />
            </div>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Peserta (live)
              </h2>
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada siswa yang join. Data muncul otomatis begitu mereka scan QR.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="p-2 font-medium">Siswa</th>
                        <th className="p-2 font-medium">Status</th>
                        <th className="p-2 font-medium">Progres</th>
                        <th className="p-2 font-medium">Soal</th>
                        <th className="p-2 font-medium">Pelanggaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((c) => {
                        const pct = c.totalQuestions > 0 ? Math.round((c.answered / c.totalQuestions) * 100) : 0;
                        return (
                          <tr key={c._id} className="border-b last:border-0">
                            <td className="p-2">
                              <div className="font-medium">{c.name}</div>
                              <div className="font-mono text-[11px] text-muted-foreground">{c.username}</div>
                            </td>
                            <td className="p-2">
                              <span className="inline-flex items-center gap-1.5 text-xs">
                                <span
                                  className={`size-2 rounded-full ${
                                    c.online ? "bg-emerald-500" : "bg-muted-foreground/40"
                                  }`}
                                />
                                {c.status}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {c.answered}/{c.totalQuestions}
                              </span>
                            </td>
                            <td className="p-2 text-xs">{c.currentQuestion + 1}</td>
                            <td className="p-2 text-xs">
                              <span className={c.violationCount > 0 ? "font-semibold text-amber-600" : "text-muted-foreground"}>
                                {c.violationCount}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card3D>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hasil ({results.length})
              </h2>
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada hasil masuk.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="p-2 font-medium">Siswa</th>
                        <th className="p-2 font-medium">Nilai</th>
                        <th className="p-2 font-medium">Benar</th>
                        <th className="p-2 font-medium">Salah</th>
                        <th className="p-2 font-medium">Kosong</th>
                        <th className="p-2 font-medium">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r._id} className="border-b last:border-0">
                          <td className="p-2">
                            <div className="font-medium">{r.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">{r.username}</div>
                          </td>
                          <td className="p-2">
                            <span
                              className={`text-lg font-bold ${
                                r.score >= 80
                                  ? "text-emerald-500"
                                  : r.score >= 60
                                    ? "text-amber-500"
                                    : "text-red-500"
                              }`}
                            >
                              {r.score}
                            </span>
                          </td>
                          <td className="p-2 text-xs text-emerald-500">{r.correct}</td>
                          <td className="p-2 text-xs text-red-500">{r.wrong}</td>
                          <td className="p-2 text-xs text-muted-foreground">{r.unanswered}</td>
                          <td className="p-2 font-mono text-[11px] text-muted-foreground">
                            {fmtTime(r.submittedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card3D>

            {violations.length > 0 && (
              <Card3D intensity={2} className="p-5 obsidian-sheen border-amber-500/30">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Log Pelanggaran ({violations.length})
                </h2>
                <ul className="max-h-80 space-y-2 overflow-y-auto">
                  {violations
                    .slice()
                    .reverse()
                    .map((v) => (
                      <li key={v._id} className="flex items-start gap-2 rounded-lg border p-2 text-xs">
                        <span className="shrink-0 font-mono text-muted-foreground">{fmtTime(v.at)}</span>
                        <span className="min-w-0">
                          <span className="font-semibold text-amber-600">
                            {v.name} — {v.type}
                          </span>
                          <span className="block text-muted-foreground">{v.detail}</span>
                        </span>
                      </li>
                    ))}
                </ul>
              </Card3D>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "amber";
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        {icon} {label}
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${tone === "amber" && value > 0 ? "text-amber-500" : ""}`}>
        {value}
      </p>
    </div>
  );
}
