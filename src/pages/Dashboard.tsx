import { Link } from "react-router";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { useLocalAuth } from "@/hooks/use-local-auth";

/* ═══════════════════════════════════════════
   DASHBOARD — Role-based content
   Admin: full stats, management shortcuts
   Guru: teaching overview, class data
   Siswa: personal schedule, grades
   ═══════════════════════════════════════════ */

/* ── Admin stats ── */
const ADMIN_STATS = [
  { label: "Total Siswa", value: "1,247", change: "+12%", positive: true, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Ujian Aktif", value: "3", change: "Hari ini", positive: true, icon: ClipboardCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Bank Soal", value: "486", change: "+23 minggu ini", positive: true, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Rata-rata Nilai", value: "78.4", change: "+2.1", positive: true, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const ADMIN_ANALYTICS = [
  { label: "Tingkat Kehadiran", value: 94, color: "bg-emerald-500" },
  { label: "Tingkat Kelulusan", value: 98, color: "bg-blue-500" },
  { label: "Rata-rata Nilai Nasional", value: 76, color: "bg-amber-500" },
  { label: "Partisipasi Ujian Online", value: 87, color: "bg-primary" },
];

const ADMIN_SHORTCUTS = [
  { label: "Kelola Guru", icon: Users, href: "/guru", desc: "Data tenaga pengajar" },
  { label: "Kelola Murid", icon: GraduationCap, href: "/murid", desc: "Data siswa aktif" },
  { label: "Bank Soal", icon: Trophy, href: "/bank-soal", desc: "Import & kelola soal" },
  { label: "Pengaturan", icon: FileText, href: "/pengaturan", desc: "Konfigurasi sistem" },
];

const ADMIN_SCHEDULE = [
  { label: "UTBK Simulasi XII", time: "08:00 – 10:30", room: "Lab Komputer A", status: "active" },
  { label: "UH Fisika XI", time: "13:00 – 14:00", room: "Ruang 302", status: "upcoming" },
  { label: "Try Out UTBK XII", time: "09:00 – 11:30", room: "Lab Komputer B", status: "upcoming" },
];

const ADMIN_ACTIVITY = [
  { text: "Ujian Matematika XII dimulai", time: "10 menit lalu", type: "ujian" },
  { text: "143 siswa tercatat hadir hari ini", time: "30 menit lalu", type: "absensi" },
  { text: "20 soal IPA ditambahkan ke bank soal", time: "1 jam lalu", type: "bank" },
  { text: "Rapor semester genap siap diekspor", time: "2 jam lalu", type: "info" },
];

/* ── Guru stats ── */
const GURU_STATS = [
  { label: "Kelas Diampu", value: "4", change: "Semester ini", positive: true, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Ujian Aktif", value: "2", change: "Minggu ini", positive: true, icon: ClipboardCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Soal Dibuat", value: "34", change: "+8 bulan ini", positive: true, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Rata Nilai Kelas", value: "81.2", change: "+1.5", positive: true, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const GURU_SHORTCUTS = [
  { label: "Bank Soal", icon: Trophy, href: "/bank-soal", desc: "Buat & kelola soal" },
  { label: "Ujian / CBT", icon: ClipboardCheck, href: "/ujian", desc: "Monitoring ujian" },
  { label: "Absensi", icon: FileText, href: "/absensi", desc: "Rekap kehadiran kelas" },
  { label: "Pengumuman", icon: FileText, href: "/pengumuman", desc: "Lihat pengumuman" },
];

const GURU_CLASSES = [
  { name: "XII IPA 1", students: 36, avgScore: 82.4, nextExam: "UTBK Simulasi" },
  { name: "XII IPA 2", students: 34, avgScore: 79.8, nextExam: "UH Fisika" },
  { name: "XI IPA 1", students: 38, avgScore: 84.1, nextExam: "UTS Semester" },
  { name: "XI IPA 2", students: 35, avgScore: 78.5, nextExam: "UH Kimia" },
];

/* ── Siswa stats ── */
const SISWA_STATS = [
  { label: "Ujian Selesai", value: "8", change: "Dari 12", positive: true, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Rata-rata Nilai", value: "82.5", change: "+3.2", positive: true, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Kehadiran", value: "94%", change: "Semester ini", positive: true, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
  { label: "Peringkat", value: "12", change: "Dari 36", positive: true, icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const SISWA_SCHEDULE = [
  { subject: "Matematika", time: "07:30 – 09:00", teacher: "Dr. Ahmad Sudirman", room: "Ruang 301", status: "active" },
  { subject: "Fisika", time: "09:15 – 10:45", teacher: "Budi Hartono, M.Sc", room: "Lab Fisika", status: "upcoming" },
  { subject: "Bahasa Indonesia", time: "11:00 – 12:30", teacher: "Siti Rahmawati, S.Pd", room: "Ruang 302", status: "upcoming" },
  { subject: "Bahasa Inggris", time: "13:00 – 14:30", teacher: "Dewi Kartika, S.Pd", room: "Ruang 305", status: "upcoming" },
];

const SISWA_GRADES = [
  { subject: "Matematika", score: 85, grade: "A", trend: "up" },
  { subject: "Fisika", score: 78, grade: "B+", trend: "up" },
  { subject: "B. Indonesia", score: 88, grade: "A", trend: "stable" },
  { subject: "B. Inggris", score: 82, grade: "A-", trend: "up" },
  { subject: "Kimia", score: 75, grade: "B", trend: "down" },
];

const SISWA_EXAMS = [
  { name: "UTBK Simulasi XII", date: "Besok, 08:00", status: "upcoming", duration: "120 menit" },
  { name: "UH Fisika Bab 5", date: "Rabu, 09:00", status: "upcoming", duration: "60 menit" },
];

const ACTIVITY_STYLE: Record<string, string> = {
  ujian: "bg-primary/15 text-primary",
  absensi: "bg-blue-500/15 text-blue-500",
  bank: "bg-amber-500/15 text-amber-500",
  info: "bg-emerald-500/15 text-emerald-500",
};

const SCHEDULE_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "Berlangsung", color: "text-primary" },
  upcoming: { label: "Mendatang", color: "text-muted-foreground" },
};

export default function Dashboard() {
  const { user } = useLocalAuth();
  const role = user?.role ?? "admin";

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {role === "admin" ? "Panel Admin" : role === "guru" ? "Panel Guru" : "Panel Siswa"}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Selamat datang, {user?.name}
            </p>
          </div>
        </div>

        {/* ═══════════ ADMIN DASHBOARD ═══════════ */}
        {role === "admin" && (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ADMIN_STATS.map((stat) => (
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

            {/* Shortcuts + Schedule */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Modul
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ADMIN_SHORTCUTS.map((s) => (
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

              <div>
                <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jadwal Hari Ini
                </h2>
                <Card3D intensity={2} className="p-4 obsidian-sheen">
                  <div className="space-y-3">
                    {ADMIN_SCHEDULE.map((s, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Clock className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{s.label}</p>
                            <span className={`text-[10px] font-medium ${SCHEDULE_STATUS[s.status].color}`}>
                              · {SCHEDULE_STATUS[s.status].label}
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

            {/* Analytics bars */}
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Analitik Institusi
              </h2>
              <Card3D intensity={2} className="p-5 obsidian-sheen">
                <div className="grid gap-4 sm:grid-cols-2">
                  {ADMIN_ANALYTICS.map((a) => (
                    <div key={a.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium">{a.label}</p>
                        <p className="text-xs font-bold">{a.value}%</p>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${a.color} transition-all`} style={{ width: `${a.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card3D>
            </div>

            {/* Activity */}
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Aktivitas Terkini
              </h2>
              <Card3D intensity={2} className="obsidian-sheen">
                <div className="divide-y">
                  {ADMIN_ACTIVITY.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors">
                      <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${ACTIVITY_STYLE[a.type]}`}>
                        <FileText className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{a.text}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                    </div>
                  ))}
                </div>
              </Card3D>
            </div>
          </>
        )}

        {/* ═══════════ GURU DASHBOARD ═══════════ */}
        {role === "guru" && (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {GURU_STATS.map((stat) => (
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

            {/* Shortcuts */}
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Akses Cepat
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {GURU_SHORTCUTS.map((s) => (
                  <Link key={s.href} to={s.href}>
                    <Card3D intensity={3} className="group flex items-center gap-3 p-4 transition-colors hover:bg-accent/5 obsidian-sheen">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{s.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{s.desc}</p>
                      </div>
                    </Card3D>
                  </Link>
                ))}
              </div>
            </div>

            {/* My Classes */}
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kelas Diampu
              </h2>
              <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
                <div className="divide-y">
                  {GURU_CLASSES.map((cls) => (
                    <div key={cls.name} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <GraduationCap className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cls.students} siswa · Rata-rata: {cls.avgScore}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-primary">{cls.nextExam}</p>
                        <p className="text-[10px] text-muted-foreground">Ujian berikutnya</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card3D>
            </div>
          </>
        )}

        {/* ═══════════ ORANGTUA DASHBOARD ═══════════ */}
        {role === "orangtua" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SISWA_STATS.map((stat) => (
                <Card3D key={stat.label} intensity={4} className="p-5 obsidian-sheen">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
                      <stat.icon className={`size-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </Card3D>
              ))}
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Anak</h2>
              <Card3D intensity={2} className="p-5 obsidian-sheen">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
                    AF
                  </div>
                  <div>
                    <p className="text-lg font-bold">Ahmad Fauzi</p>
                    <p className="text-sm text-muted-foreground">MI Kelas 6 · NISN: 0081234001</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Status: <span className="text-emerald-500 font-medium">Aktif</span></p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">82.5</p>
                    <p className="text-[10px] text-muted-foreground">Rata-rata</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">94%</p>
                    <p className="text-[10px] text-muted-foreground">Kehadiran</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">12</p>
                    <p className="text-[10px] text-muted-foreground">Peringkat</p>
                  </div>
                </div>
              </Card3D>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ujian Mendatang</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {SISWA_EXAMS.map((exam, i) => (
                  <Card3D key={i} intensity={3} className="p-4 obsidian-sheen">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ClipboardCheck className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{exam.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{exam.date}</p>
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════ SISWA DASHBOARD ═══════════ */}
        {role === "siswa" && (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SISWA_STATS.map((stat) => (
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

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Today's Schedule */}
              <div>
                <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jadwal Hari Ini
                </h2>
                <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
                  <div className="divide-y">
                    {SISWA_SCHEDULE.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors">
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          s.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          <Clock className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{s.subject}</p>
                            {s.status === "active" && (
                              <Badge className="text-[9px] bg-primary/15 text-primary">Aktif</Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {s.teacher} · {s.room}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{s.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card3D>
              </div>

              {/* My Grades */}
              <div>
                <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nilai Terakhir
                </h2>
                <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
                  <div className="divide-y">
                    {SISWA_GRADES.map((g) => (
                      <div key={g.subject} className="flex items-center gap-3 px-5 py-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{g.subject}</p>
                          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${g.score}%`,
                                background: g.score >= 80
                                  ? "linear-gradient(90deg, #10b981, #34d399)"
                                  : g.score >= 60
                                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                    : "linear-gradient(90deg, #ef4444, #f87171)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">{g.score}</p>
                          <p className="text-[10px] text-muted-foreground">{g.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card3D>
              </div>
            </div>

            {/* Upcoming Exams */}
            <div>
              <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ujian Mendatang
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {SISWA_EXAMS.map((exam, i) => (
                  <Card3D key={i} intensity={3} className="p-4 obsidian-sheen">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ClipboardCheck className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{exam.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{exam.date}</p>
                        <p className="text-[11px] text-muted-foreground">Durasi: {exam.duration}</p>
                      </div>
                      <Badge className="text-[10px] bg-amber-500/15 text-amber-500">
                        Mendatang
                      </Badge>
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
