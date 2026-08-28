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
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD
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
    change: "+23",
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
  { label: "Profil", icon: GraduationCap, href: "/profil", desc: "Data sekolah" },
];

const RECENT_ACTIVITIES = [
  { text: "Ujian Matematika kelas XII dimulai", time: "10 menit lalu", type: "ujian" as const },
  { text: "143 siswa telah absen hari ini", time: "30 menit lalu", type: "absensi" as const },
  { text: "Soal IPA kelas X ditambahkan (20 soal)", time: "1 jam lalu", type: "bank" as const },
  { text: "Rapor semester genap siap dicetak", time: "2 jam lalu", type: "info" as const },
];

const TYPE_COLORS = {
  ujian: "bg-primary/15 text-primary",
  absensi: "bg-blue-500/15 text-blue-500",
  bank: "bg-amber-500/15 text-amber-500",
  info: "bg-emerald-500/15 text-emerald-500",
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* ── GREETING ── */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Selamat datang kembali</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard Admin
          </h1>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((stat, i) => (
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

        {/* ── TWO COL: SHORTCUTS + ACTIVITY ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shortcuts */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Akses Cepat
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SHORTCUTS.map((s) => (
                <Link key={s.href} to={s.href}>
                  <Card3D intensity={3} className="group flex items-center gap-4 p-4 transition-colors hover:bg-accent/5 obsidian-sheen">
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

          {/* Recent Activity */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Aktivitas Terkini
            </h2>
            <Card3D intensity={2} className="p-4 obsidian-sheen">
              <div className="space-y-3">
                {RECENT_ACTIVITIES.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[a.type]}`}>
                      <AlertCircle className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{a.text}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card3D>
          </div>
        </div>

        {/* ── EMPTY STATE TEASER ── */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="size-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold">Butuh bantuan memulai?</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Lihat panduan penggunaan untuk menyiapkan bank soal, mengatur jadwal ujian, dan mengelola data siswa.
              </p>
            </div>
          </div>
        </Card3D>
      </div>
    </DashboardShell>
  );
}
