import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Clock,
  Calendar,
  Users,
  PlayCircle,
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Filter,
  Upload,
  X,
  Save,
} from "lucide-react";
import { Link } from "react-router";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ═══════════════════════════════════════════
   UJIAN / CBT — Modern School Web
   ═══════════════════════════════════════════ */

interface UjianData {
  id: number;
  name: string;
  className: string;
  date: string;
  time: string;
  participants: number;
  total: number;
  questions: number;
  status: "active" | "upcoming" | "finished";
}

const STORAGE_KEY = "msw-ujian";

const INITIAL_UJIAN: UjianData[] = [
  {
    id: 1,
    name: "UTB — Matematika XII IPA",
    className: "XII IPA 1 & 2",
    date: "28 Agustus 2026",
    time: "08:00 – 10:00",
    participants: 64,
    total: 64,
    questions: 40,
    status: "active",
  },
  {
    id: 2,
    name: "Try Out UTBK — Bahasa Indonesia",
    className: "XII IPS 1",
    date: "30 Agustus 2026",
    time: "09:00 – 11:30",
    participants: 0,
    total: 32,
    questions: 50,
    status: "upcoming",
  },
  {
    id: 3,
    name: "UH Fisika XI",
    className: "XI IPA 3",
    date: "25 Agustus 2026",
    time: "13:00 – 14:00",
    participants: 30,
    total: 30,
    questions: 25,
    status: "finished",
  },
];

const EMPTY_FORM = {
  name: "",
  className: "",
  date: "",
  startTime: "",
  endTime: "",
  total: 0,
  questions: 0,
  status: "upcoming" as const,
};

const KELAS_OPTIONS = [
  "X IPA 1", "X IPA 2", "X IPS 1", "X IPS 2",
  "XI IPA 1", "XI IPA 2", "XI IPS 1", "XI IPS 2",
  "XII IPA 1", "XII IPA 2", "XII IPS 1", "XII IPS 2",
];

const STATUS_MAP = {
  active: { label: "Berlangsung", variant: "default" as const },
  upcoming: { label: "Mendatang", variant: "secondary" as const },
  finished: { label: "Selesai", variant: "outline" as const },
};

export default function Ujian() {
  const [ujianList, setUjianList] = useState<UjianData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUjianList(JSON.parse(raw));
      } else {
        setUjianList(INITIAL_UJIAN);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_UJIAN));
      }
    } catch {
      setUjianList(INITIAL_UJIAN);
    }
  }, []);

  const save = (list: UjianData[]) => {
    setUjianList(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = ujianList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.className.toLowerCase().includes(search.toLowerCase()) ||
      u.date.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name || !form.className || !form.date) return;
    const newUjian: UjianData = {
      id: Date.now(),
      name: form.name,
      className: form.className,
      date: form.date,
      time: `${form.startTime || "08:00"} – ${form.endTime || "10:00"}`,
      participants: 0,
      total: form.total,
      questions: form.questions,
      status: form.status,
    };
    save([newUjian, ...ujianList]);
    setDialogOpen(false);
    setForm(EMPTY_FORM);
  };

  const stats = {
    active: ujianList.filter((u) => u.status === "active").length,
    upcoming: ujianList.filter((u) => u.status === "upcoming").length,
    finished: ujianList.filter((u) => u.status === "finished").length,
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ujian / CBT</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola ujian berbasis komputer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Upload className="size-3.5" />
              Import Soal
            </Button>
            <Button size="sm" className="rounded-full" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Buat Ujian
            </Button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari ujian berdasarkan nama, kelas, atau tanggal..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="size-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3">
          {[
            { label: "Berlangsung", value: stats.active, icon: PlayCircle, color: "text-primary" },
            { label: "Mendatang", value: stats.upcoming, icon: Calendar, color: "text-muted-foreground" },
            { label: "Selesai", value: stats.finished, icon: FileText, color: "text-emerald-500" },
          ].map((s) => (
            <Card3D key={s.label} intensity={2} className="p-4 text-center obsidian-sheen">
              <s.icon className={`size-4 mx-auto ${s.color}`} />
              <p className="mt-2 text-xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </Card3D>
          ))}
        </div>

        {/* Exam list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card3D intensity={1} className="p-12 text-center obsidian-sheen">
              <ClipboardCheck className="size-8 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "Tidak ada ujian yang cocok." : "Belum ada ujian. Klik \"Buat Ujian\" untuk menambahkan."}
              </p>
            </Card3D>
          ) : (
            filtered.map((ujian) => {
              const statusInfo = STATUS_MAP[ujian.status];
              const progress = ujian.total > 0 ? (ujian.participants / ujian.total) * 100 : 0;

              return (
                <Link key={ujian.id} to={`/ujian/${ujian.id}`}>
                  <Card3D intensity={3} className="group p-5 obsidian-sheen">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {ujian.name}
                          </h3>
                          <Badge variant={statusInfo.variant} className="text-[10px]">
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{ujian.className}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {ujian.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {ujian.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {ujian.participants}/{ujian.total}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="size-3" />
                            {ujian.questions} soal
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full sm:w-32 shrink-0">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground text-right">
                          {Math.round(progress)}%
                        </p>
                      </div>

                      <MoreHorizontal className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
                    </div>
                  </Card3D>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Create Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Ujian Baru</DialogTitle>
            <DialogDescription>
              Isi informasi ujian untuk membuat sesi CBT baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Ujian *</Label>
              <Input
                placeholder="Contoh: UTBK — Matematika XII IPA"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kelas *</Label>
              <Select value={form.className} onValueChange={(v) => setForm({ ...form, className: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {KELAS_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jam Mulai</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jam Selesai</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Peserta</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="32"
                  value={form.total || ""}
                  onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Soal</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="40"
                  value={form.questions || ""}
                  onChange={(e) => setForm({ ...form, questions: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Mendatang</SelectItem>
                  <SelectItem value="active">Berlangsung</SelectItem>
                  <SelectItem value="finished">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              <X className="size-3.5" />
              Batal
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!form.name || !form.className || !form.date}>
              <Save className="size-3.5" />
              Buat Ujian
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
