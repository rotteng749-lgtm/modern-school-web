import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  BedDouble,
  Users,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Save,
  ShieldCheck,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalAuth } from "@/hooks/use-local-auth";

/* ═══════════════════════════════════════════
   ABSENSI — real roster from msw-murid.
   Status disimpan per tanggal di msw-absensi:
   { "2026-09-04": { "<muridId>": "hadir", ... } }
   Admin/Guru: input absen per kelas.
   Siswa/Orangtua: lihat rekap sendiri (read-only).
   ═══════════════════════════════════════════ */

export interface MuridItem {
  id: string;
  name: string;
  nisn: string;
  className: string;
  gender: string;
  email?: string;
  phone?: string;
  parentName?: string;
  status: "aktif" | "lulus" | "keluar";
  username?: string;
  password?: string;
  photo?: string;
}

type StatusKey = "hadir" | "terlambat" | "izin" | "sakit" | "alpha";

const MURID_KEY = "msw-murid";
const ABSEN_KEY = "msw-absensi";

const DEFAULT_MURID: MuridItem[] = [
  { id: "1", name: "Ahmad Fauzi", nisn: "0081234001", className: "MI Kelas 6", gender: "Laki-laki", parentName: "H. Fauzi", status: "aktif", username: "ahmadfauzi", password: "Ahmd@2026" },
  { id: "2", name: "Siti Nurhaliza", nisn: "0081234002", className: "MI Kelas 5", gender: "Perempuan", parentName: "H. Nurhaliza", status: "aktif", username: "sitinur", password: "Siti@2026" },
  { id: "3", name: "Budi Pratama", nisn: "0081234003", className: "MI Kelas 4", gender: "Laki-laki", parentName: "H. Pratama", status: "aktif", username: "budipra", password: "Budi@2026" },
  { id: "4", name: "Dewi Sartika", nisn: "0081234004", className: "MI Kelas 6", gender: "Perempuan", parentName: "H. Sartika", status: "aktif", username: "dewisart", password: "Dewi@2026" },
  { id: "5", name: "Eko Prasetyo", nisn: "0081234005", className: "MI Kelas 3", gender: "Laki-laki", parentName: "H. Prasetyo", status: "lulus", username: "ekopra", password: "Eko@2026" },
  { id: "6", name: "Fitriani Putri", nisn: "0081234006", className: "MI Kelas 5", gender: "Perempuan", parentName: "H. Putri", status: "aktif", username: "fitriput", password: "Fitr@2026" },
];

const STATUS_META: Record<StatusKey, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  hadir: { label: "Hadir", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/15 border-emerald-500/30" },
  terlambat: { label: "Terlambat", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/15 border-amber-500/30" },
  izin: { label: "Izin", icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-500/15 border-blue-500/30" },
  sakit: { label: "Sakit", icon: BedDouble, color: "text-purple-500", bg: "bg-purple-500/15 border-purple-500/30" },
  alpha: { label: "Alpha", icon: XCircle, color: "text-red-500", bg: "bg-red-500/15 border-red-500/30" },
};

const STATUS_ORDER: StatusKey[] = ["hadir", "terlambat", "izin", "sakit", "alpha"];

/* ── Helpers ── */
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDate(iso: string) {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function shiftDate(iso: string, delta: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function loadMurid(): MuridItem[] {
  try {
    const raw = localStorage.getItem(MURID_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_MURID;
}

type AbsenMap = Record<string, Record<string, StatusKey>>;

function loadAbsen(): AbsenMap {
  try {
    const raw = localStorage.getItem(ABSEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch { /* ignore */ }
  return {};
}

function monthOf(iso: string) {
  return iso.slice(0, 7); // "2026-09"
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Absensi() {
  const { user } = useLocalAuth();
  const role = user?.role ?? "admin";
  const canManage = role === "admin" || role === "guru";

  const [date, setDate] = useState(todayISO());
  const [kelas, setKelas] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [murid, setMurid] = useState<MuridItem[]>([]);
  const [absen, setAbsen] = useState<AbsenMap>(loadAbsen());
  const [justSaved, setJustSaved] = useState(false);

  // Load roster once
  useEffect(() => {
    setMurid(loadMurid());
  }, []);

  // Persist absen map whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ABSEN_KEY, JSON.stringify(absen));
    } catch { /* storage full — ignore */ }
  }, [absen]);

  // Flash "tersimpan" indicator briefly
  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 1800);
    return () => clearTimeout(t);
  }, [justSaved]);

  const dayMap = absen[date] ?? {};

  // Determine which students are visible for the current role
  const visible = useMemo(() => {
    let list = murid;
    if (role === "siswa") {
      list = list.filter((m) => m.username && m.username === user?.username);
    } else if (role === "orangtua") {
      list = list.filter(
        (m) =>
          (user?.childId && m.id === user.childId) ||
          (m.parentName && m.parentName.toLowerCase().includes((user?.name ?? "").toLowerCase())),
      );
    }
    if (kelas !== "all") list = list.filter((m) => m.className === kelas);
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.nisn.includes(search) ||
        m.className.toLowerCase().includes(search.toLowerCase()),
    );
  }, [murid, role, user, kelas, search]);

  const kelasOptions = useMemo(() => {
    const set = new Set<string>();
    murid.forEach((m) => set.add(m.className));
    return [...set].sort();
  }, [murid]);

  const stats = useMemo(() => {
    const total = visible.length;
    const count: Record<StatusKey, number> = { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpha: 0 };
    visible.forEach((m) => {
      const s = dayMap[m.id] ?? "hadir";
      count[s] = (count[s] ?? 0) + 1;
    });
    const recorded = total > 0 ? (Object.keys(dayMap).filter((id) => visible.some((v) => v.id === id)).length) : 0;
    const hadirPct = total > 0 ? Math.round((count.hadir / total) * 100) : 0;
    return { total, count, recorded, hadirPct };
  }, [visible, dayMap]);

  const setStatus = (id: string, s: StatusKey) => {
    if (!canManage) return;
    setAbsen((prev) => ({
      ...prev,
      [date]: { ...(prev[date] ?? {}), [id]: s },
    }));
    setJustSaved(true);
  };

  const markAllHadir = () => {
    if (!canManage) return;
    setAbsen((prev) => {
      const next = { ...(prev[date] ?? {}) };
      visible.forEach((m) => { next[m.id] = "hadir"; });
      return { ...prev, [date]: next };
    });
    setJustSaved(true);
  };

  const resetDay = () => {
    if (!canManage) return;
    setAbsen((prev) => {
      const next = { ...(prev[date] ?? {}) };
      visible.forEach((m) => { delete next[m.id]; });
      return { ...prev, [date]: next };
    });
    setJustSaved(true);
  };

  const exportCSV = () => {
    const rows: string[][] = [
      ["Nama", "NISN", "Kelas", "Status"],
      ...visible.map((m) => [m.name, m.nisn, m.className, STATUS_META[dayMap[m.id] ?? "hadir"].label]),
    ];
    downloadCSV(`absensi-${date}.csv`, rows);
  };

  // Monthly summary (current visible students, whole month up to today)
  const monthly = useMemo(() => {
    const m = monthOf(date);
    const counts: Record<StatusKey, number> = { hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpha: 0 };
    let days = 0;
    Object.entries(absen).forEach(([d, map]) => {
      if (!d.startsWith(m)) return;
      days++;
      Object.entries(map).forEach(([id, s]) => {
        if (visible.some((v) => v.id === id)) counts[s] = (counts[s] ?? 0) + 1;
      });
    });
    const totalEntries = Object.values(counts).reduce((a, b) => a + b, 0);
    const pct = totalEntries > 0 ? Math.round((counts.hadir / totalEntries) * 100) : 0;
    return { counts, days, pct, totalEntries };
  }, [absen, visible, date]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {canManage ? "Input kehadiran harian siswa" : "Rekap kehadiran Anda"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {justSaved && (
              <Badge variant="secondary" className="gap-1 text-emerald-500">
                <Save className="size-3" /> Tersimpan
              </Badge>
            )}
            <Button variant="outline" size="sm" className="rounded-full" onClick={exportCSV} disabled={visible.length === 0}>
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {canManage && (
          <>
            {/* ── Date + kelas picker ── */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon-sm" onClick={() => setDate(shiftDate(date, -1))} aria-label="Hari sebelumnya">
                  <ChevronLeft className="size-4" />
                </Button>
                <input
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => setDate(e.target.value || todayISO())}
                  className="h-9 rounded-full border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button variant="outline" size="icon-sm" onClick={() => setDate(shiftDate(date, 1))} aria-label="Hari berikutnya">
                  <ChevronRight className="size-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1 rounded-full border border-input p-1">
                  <button
                    onClick={() => setKelas("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${kelas === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Semua
                  </button>
                  {kelasOptions.map((k) => (
                    <button
                      key={k}
                      onClick={() => setKelas(k)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${kelas === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {k.replace("MI Kelas ", "Kelas ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Search + bulk actions ── */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa berdasarkan nama, NISN, atau kelas..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={markAllHadir}>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Semua Hadir
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={resetDay}>
                  Reset
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border bg-card p-4 text-center shadow-xs">
            <Users className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-2 text-xl font-bold">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Siswa</p>
          </div>
          {STATUS_ORDER.map((k) => {
            const meta = STATUS_META[k];
            const Icon = meta.icon;
            return (
              <div key={k} className="rounded-xl border bg-card p-4 text-center shadow-xs">
                <Icon className={`mx-auto size-4 ${meta.color}`} />
                <p className="mt-2 text-xl font-bold">{stats.count[k] ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">{meta.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Kehadiran hari ini + rekap bulan ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kehadiran {canManage ? "Hari Ini" : formatDate(date)}
              </p>
              <p className="text-sm font-bold">{stats.hadirPct}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-150"
                style={{ width: `${stats.hadirPct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {stats.recorded} dari {stats.total} siswa tercatat — siswa tanpa catatan dianggap Hadir
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rekap Bulan Ini</p>
              <p className="text-sm font-bold">{monthly.pct}% hadir</p>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 text-center">
              {STATUS_ORDER.map((k) => (
                <div key={k} className="rounded-lg bg-muted/50 py-2">
                  <p className="text-sm font-bold">{monthly.counts[k]}</p>
                  <p className="text-[9px] text-muted-foreground">{STATUS_META[k].label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {monthly.days} hari tercatat · {monthly.totalEntries} catatan
            </p>
          </div>
        </div>

        {/* ── Roster ── */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {canManage ? "Daftar Kehadiran" : "Status Kehadiran Anda"}
          </h2>
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            {visible.length === 0 && (
              <div className="px-6 py-12 text-center">
                <ShieldCheck className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {role === "siswa" || role === "orangtua"
                    ? "Belum ada catatan absensi untuk akun ini."
                    : "Tidak ada siswa yang cocok. Tambahkan siswa dulu di menu Murid."}
                </p>
              </div>
            )}
            <div className="divide-y">
              {visible.map((m) => {
                const current = dayMap[m.id] ?? "hadir";
                const meta = STATUS_META[current];
                const Icon = meta.icon;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="size-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {m.className} · NISN {m.nisn}
                        </p>
                      </div>
                    </div>

                    {canManage ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {STATUS_ORDER.map((k) => {
                          const sm = STATUS_META[k];
                          const active = current === k;
                          const IconBtn = sm.icon;
                          return (
                            <button
                              key={k}
                              onClick={() => setStatus(m.id, k)}
                              title={sm.label}
                              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                active
                                  ? `${sm.bg} ${sm.color}`
                                  : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              }`}
                            >
                              <IconBtn className="size-3" />
                              {sm.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Badge variant="secondary" className={`w-fit gap-1 text-[11px] ${meta.color}`}>
                        <Icon className="size-3" />
                        {meta.label}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
