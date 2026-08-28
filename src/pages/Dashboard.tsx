import { Link } from "react-router";
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CalendarDays,
  Search,
  Plus,
  FileText,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD — Modern School Web
   Premium, technical, minimal
   ═══════════════════════════════════════════ */

const STAT_CARDS = [
  {
    label: "Total Siswa",
    value: "1,247",
    change: "+12%",
    positive: true,
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Ujian Aktif",
    value: "3",
    change: "Hari ini",
    positive: true,
    icon: ClipboardCheck,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Bank Soal",
    value: "486",
    change: "+23 minggu ini",
    positive: true,
    icon: BookOpen,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Rata-rata Nilai",
    value: "78.4",
    change: "+2.1",
    positive: true,
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const SHORTCUTS = [
  { label: "Ujian / CBT", icon: ClipboardCheck, href: "/ujian", desc: "Kelola ujian aktif" },
  { label: "Absensi", icon: CalendarDays, href: "/absensi", desc: "Rekap kehadiran" },
  { label: "Bank Soal", icon: BookOpen, href: "/bank-soal", desc: "Import & kelola soal" },
  { label: "Profil", icon: GraduationCap, href: "/profil", desc: "Data institusi" },
];

const SCHEDULE = [
  { label: "UTBK Simulasi XII", time: "08:00 – 10:30", room: "Lab Komputer A", status: "active" as const },
  { label: "UH Fisika XI", time: "13:00 – 14:00", room: "Ruang 302", status: "upcoming" as const },
  { label: "Try Out UTBK XII", time: "09:00 – 11:30", room: "Lab Komputer B", status: "upcoming" as const },
];

const RECENT = [
  { text: "Ujian Matematika XII dimulai", time: "10 menit lalu", type: "ujian" as const },
  { text: "143 siswa tercatat hadir hari ini", time: "30 menit lalu", type: "absensi" as const },
  { text: "20 soal IPA ditambahkan ke bank soal", time: "1 jam lalu", type: "bank" as const },
  { text: "Rapor semester genap siap diekspor", time: "2 jam lalu", type: "info" as const },
];

const TYPE_COLORS = {
  ujian: "bg-primary/15 text-primary",
  absensi: "bg-blue-500/15 text-blue-500",
  bank: "bg-amber-500/15 text-amber-500",
  info: "bg-emerald-500/15 text-emerald-500",
};

const STATUS_STYLE = {
  active: { label: "Berlangsung", color: "text-primary" },
  upcoming: { label: "Mendatang", color: "text-muted-foreground" },
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* ── HEADER + SEARCH ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Panel Admin
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Cari siswa, ujian, soal..." className="pl-9 sm:w-64" />
            </div>
            <Button size="sm" className="rounded-full shrink-0">
              <Plus className="size-3.5" />
              Baru
            </Button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((stat) => (
            <Card3D key={stat.label} intensity={4} className="p-5 obsidian-sheen">
              <div className="flex items-start justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="text-[11px] font-medium gap-1">
                  <span className={stat.positive ? "text-emerald-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card3D>
          ))}
        </div>

        {/* ── TWO COL: SHORTCUTS + SCHEDULE ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shortcuts */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Modul
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SHORTCUTS.map((s) => (
                <Link key={s.href} to={s.href}>
                  <Card3D
                    intensity={3}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-accent/5 obsidian-sheen"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card3D>
                </Link>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Jadwal Hari Ini
            </h2>
            <Card3D intensity={2} className="p-4 obsidian-sheen">
              <div className="space-y-3">
                {SCHEDULE.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{s.label}</p>
                        <span className={`text-[10px] font-medium ${STATUS_STYLE[s.status].color}`}>
                          · {STATUS_STYLE[s.status].label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {s.time} — {s.room}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card3D>
          </div>
        </div>

        {/* ── RECENT ACTIVITY ── */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Aktivitas Terkini
          </h2>
          <Card3D intensity={2} className="obsidian-sheen">
            <div className="divide-y">
              {RECENT.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors"
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[a.type]}`}
                  >
                    <FileText className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{a.text}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </Card3D>
        </div>
      </div>
    </DashboardShell>
  );
}
