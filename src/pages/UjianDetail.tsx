import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  PlayCircle,
  Settings,
  Download,
  BarChart,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════
   UJIAN DETAIL — Modern School Web
   Detail view for individual exams
   ═══════════════════════════════════════════ */

const EXAM_DATA: Record<string, {
  name: string;
  class: string;
  date: string;
  time: string;
  duration: string;
  questions: number;
  totalStudents: number;
  participants: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  status: "active" | "upcoming" | "finished";
  description: string;
}> = {
  "1": {
    name: "UTB — Matematika XII IPA",
    class: "XII IPA 1 & 2",
    date: "28 Agustus 2026",
    time: "08:00 – 10:00",
    duration: "120 menit",
    questions: 40,
    totalStudents: 64,
    participants: 64,
    avgScore: 76.2,
    highestScore: 98,
    lowestScore: 32,
    status: "active",
    description: "Ujian Tengah Berbasis komputer — Matematika Peminatan kelas XII IPA. Terdiri dari 30 soal pilihan ganda dan 10 soal uraian.",
  },
  "2": {
    name: "Try Out UTBK — Bahasa Indonesia",
    class: "XII IPS 1",
    date: "30 Agustus 2026",
    time: "09:00 – 11:30",
    duration: "150 menit",
    questions: 50,
    totalStudents: 32,
    participants: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
    status: "upcoming",
    description: "Simulasi UTBK — Tes Potensi Skolastik dan Literasi Bahasa Indonesia.",
  },
  "3": {
    name: "UH Fisika XI",
    class: "XI IPA 3",
    date: "25 Agustus 2026",
    time: "13:00 – 14:00",
    duration: "60 menit",
    questions: 25,
    totalStudents: 30,
    participants: 30,
    avgScore: 81.4,
    highestScore: 96,
    lowestScore: 44,
    status: "finished",
    description: "Ulangan Harian — Hukum Newton dan Gerak Lurus.",
  },
};

const STATUS_STYLE = {
  active: { label: "Berlangsung", color: "text-primary" },
  upcoming: { label: "Mendatang", color: "text-muted-foreground" },
  finished: { label: "Selesai", color: "text-emerald-500" },
};

export default function UjianDetail() {
  const { id } = useParams();
  const exam = EXAM_DATA[id ?? "1"];

  if (!exam) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Ujian tidak ditemukan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ID ujian "{id}" tidak valid.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
            <Link to="/ujian">
              <ArrowLeft className="size-4" />
              Kembali ke Daftar
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const statusInfo = STATUS_STYLE[exam.status];
  const completion = exam.totalStudents > 0
    ? (exam.participants / exam.totalStudents) * 100
    : 0;

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl">
        {/* Back + Header */}
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/ujian">
              <ArrowLeft className="size-4" />
              Daftar Ujian
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{exam.name}</h1>
                <span className={`text-xs font-medium ${statusInfo.color}`}>
                  · {statusInfo.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{exam.class}</p>
            </div>
            <div className="flex items-center gap-2">
              {exam.status === "active" && (
                <Button size="sm" className="rounded-full">
                  <PlayCircle className="size-4" />
                  Monitoring
                </Button>
              )}
              {exam.status === "finished" && (
                <Button variant="outline" size="sm" className="rounded-full">
                  <BarChart className="size-3.5" />
                  Laporan
                </Button>
              )}
              <Button variant="outline" size="sm" className="rounded-full">
                <Settings className="size-3.5" />
                Pengaturan
              </Button>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[
            { icon: Calendar, label: "Tanggal", value: exam.date },
            { icon: Clock, label: "Durasi", value: exam.duration },
            { icon: FileText, label: "Soal", value: `${exam.questions} soal` },
            { icon: Users, label: "Peserta", value: `${exam.participants}/${exam.totalStudents}` },
          ].map((item) => (
            <Card3D key={item.label} intensity={2} className="p-4 obsidian-sheen">
              <item.icon className="size-4 text-primary" />
              <p className="mt-2 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm font-semibold">{item.value}</p>
            </Card3D>
          ))}
        </div>

        {/* Description */}
        <Card3D intensity={2} className="p-5 obsidian-sheen">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {exam.description}
          </p>
        </Card3D>

        {/* Score summary (only for finished/active with participants) */}
        {exam.participants > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ringkasan Nilai
            </h2>
            <div className="grid gap-3 grid-cols-3">
              {[
                { label: "Rata-rata", value: exam.avgScore.toFixed(1) },
                { label: "Tertinggi", value: exam.highestScore.toString() },
                { label: "Terendah", value: exam.lowestScore.toString() },
              ].map((s) => (
                <Card3D key={s.label} intensity={2} className="p-4 text-center obsidian-sheen">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </Card3D>
              ))}
            </div>
          </div>
        )}

        {/* Completion bar */}
        <Card3D intensity={2} className="p-5 obsidian-sheen">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Penyelesaian</p>
            <p className="text-sm font-bold text-primary">{Math.round(completion)}%</p>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {exam.participants} dari {exam.totalStudents} siswa telah menyelesaikan ujian.
          </p>
        </Card3D>
      </div>
    </DashboardShell>
  );
}
