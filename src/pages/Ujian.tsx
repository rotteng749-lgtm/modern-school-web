import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Clock,
  Calendar,
  Users,
  PlayCircle,
  Search,
  Plus,
  FileText,
  X,
  Save,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  CheckCircle,
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
import { getSubjects, initSubjects } from "@/lib/subjects-store";
import type { SoalItem } from "@/pages/BankSoal";

/* ═══════════════════════════════════════════
   UJIAN / CBT — Yayasan Mambaul Hasan
   ═══════════════════════════════════════════ */

export interface UjianData {
  id: string;
  name: string;
  className: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  totalStudents: number;
  questionCount: number;
  status: "active" | "upcoming" | "finished";
  questionIds: string[];
}

const STORAGE_KEY = "msw-ujian";
const SOAL_KEY = "msw-bank-soal";

const KELAS = [
  "MI Kelas 1", "MI Kelas 2", "MI Kelas 3",
  "MI Kelas 4", "MI Kelas 5", "MI Kelas 6",
];

const INITIAL_UJIAN: UjianData[] = [
  {
    id: "1", name: "Ujian Akhir Semester — Matematika", className: "MI Kelas 6",
    subject: "Matematika", date: "2026-06-15", startTime: "08:00", endTime: "10:00",
    totalStudents: 32, questionCount: 20, status: "finished", questionIds: [],
  },
  {
    id: "2", name: "UTS — Bahasa Indonesia", className: "MI Kelas 5",
    subject: "Bahasa Indonesia", date: "2026-08-30", startTime: "09:00", endTime: "11:00",
    totalStudents: 28, questionCount: 25, status: "active", questionIds: [],
  },
];

const EMPTY_FORM = {
  name: "",
  className: "",
  subject: "",
  date: "",
  startTime: "08:00",
  endTime: "10:00",
  totalStudents: 0,
  questionCount: 20,
  status: "upcoming" as "active" | "upcoming" | "finished",
};

export default function Ujian() {
  const [ujianList, setUjianList] = useState<UjianData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bankSoal, setBankSoal] = useState<SoalItem[]>([]);
  const [selectedSoal, setSelectedSoal] = useState<Set<string>>(new Set());
  const [expandedSoalGroup, setExpandedSoalGroup] = useState<string | null>(null);

  useEffect(() => {
    initSubjects();
    setSubjects(getSubjects());

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: UjianData[] = JSON.parse(raw);
        // Migrate old data: add missing fields
        const migrated = parsed.map((u) => ({
          ...u,
          subject: u.subject ?? "",
          questionIds: u.questionIds ?? [],
          startTime: u.startTime ?? "08:00",
          endTime: u.endTime ?? "10:00",
        }));
        setUjianList(migrated);
      } else {
        setUjianList(INITIAL_UJIAN);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_UJIAN));
      }
    } catch {
      setUjianList(INITIAL_UJIAN);
    }

    try {
      const raw = localStorage.getItem(SOAL_KEY);
      if (raw) setBankSoal(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = (list: UjianData[]) => {
    setUjianList(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = ujianList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.className.toLowerCase().includes(search.toLowerCase()) ||
      u.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Available soal for selected subject
  const availableSoal = bankSoal.filter((s) => s.subject === form.subject);

  // When subject changes, reset selected soal
  const handleSubjectChange = (v: string) => {
    setForm({ ...form, subject: v });
    setSelectedSoal(new Set());
  };

  const toggleSoal = (id: string) => {
    setSelectedSoal((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllSoal = () => {
    if (selectedSoal.size === availableSoal.length) {
      setSelectedSoal(new Set());
    } else {
      setSelectedSoal(new Set(availableSoal.map((s) => s.id)));
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedSoal(new Set());
    setDialogOpen(true);
  };

  const openEdit = (u: UjianData) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      className: u.className,
      subject: u.subject,
      date: u.date,
      startTime: u.startTime,
      endTime: u.endTime,
      totalStudents: u.totalStudents,
      questionCount: u.questionCount,
      status: u.status,
    });
    setSelectedSoal(new Set(u.questionIds ?? []));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.className || !form.subject || !form.date) return;

    const questionIds = Array.from(selectedSoal);
    const data: UjianData = {
      id: editingId || Date.now().toString(),
      name: form.name,
      className: form.className,
      subject: form.subject,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      totalStudents: form.totalStudents,
      questionCount: questionIds.length || form.questionCount,
      status: form.status,
      questionIds,
    };

    if (editingId) {
      save(ujianList.map((u) => (u.id === editingId ? data : u)));
    } else {
      save([data, ...ujianList]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus ujian ini?")) {
      save(ujianList.filter((u) => u.id !== id));
    }
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
              Kelola ujian berbasis komputer — {ujianList.length} ujian terdaftar
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={openAdd}>
            <Plus className="size-4" />
            Buat Ujian
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari ujian berdasarkan nama, kelas, atau mapel..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3">
          {[
            { label: "Berlangsung", value: stats.active, icon: PlayCircle, color: "text-emerald-500" },
            { label: "Mendatang", value: stats.upcoming, icon: Calendar, color: "text-amber-500" },
            { label: "Selesai", value: stats.finished, icon: CheckCircle, color: "text-muted-foreground" },
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
                {search ? "Tidak ada ujian yang cocok." : "Belum ada ujian. Klik \"Buat Ujian\" untuk membuat."}
              </p>
            </Card3D>
          ) : (
            filtered.map((ujian) => {                      const soalCount = ujian.questionIds?.length ?? 0;
              const isActive = ujian.status === "active";

              return (
                <Card3D key={ujian.id} intensity={3} className="p-5 obsidian-sheen">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm truncate">
                          {ujian.name}
                        </h3>
                        <Badge
                          variant={isActive ? "default" : ujian.status === "upcoming" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {isActive ? "Berlangsung" : ujian.status === "upcoming" ? "Mendatang" : "Selesai"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ujian.className} · {ujian.subject}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {ujian.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {ujian.startTime} – {ujian.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {ujian.totalStudents} siswa
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {soalCount || ujian.questionCount} soal
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isActive && (
                        <Link to={`/ujian/${ujian.id}`}>
                          <Button size="sm" className="rounded-full text-xs">
                            <PlayCircle className="size-3.5" />
                            Mulai CBT
                          </Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ujian)} title="Edit">
                        <Edit className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(ujian.id)} title="Hapus">
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card3D>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Ujian" : "Buat Ujian Baru"}</DialogTitle>
            <DialogDescription>
              Pilih mata pelajaran untuk menarik soal dari Bank Soal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Ujian *</Label>
              <Input
                placeholder="Contoh: UAS — Matematika MI Kelas 6"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Mata Pelajaran *</Label>
                <Select value={form.subject} onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kelas *</Label>
                <Select value={form.className} onValueChange={(v) => setForm({ ...form, className: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {KELAS.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jam Selesai</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Peserta</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="32"
                  value={form.totalStudents || ""}
                  onChange={(e) => setForm({ ...form, totalStudents: Number(e.target.value) })}
                />
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

            {/* Soal picker from bank soal */}
            {form.subject && (
              <div className="space-y-2 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Pilih Soal dari Bank Soal ({availableSoal.length} soal "{form.subject}")
                  </Label>
                  <Button variant="outline" size="sm" onClick={selectAllSoal} className="text-xs h-7">
                    {selectedSoal.size === availableSoal.length ? "Batal Pilih" : "Pilih Semua"}
                  </Button>
                </div>

                {availableSoal.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">
                    Belum ada soal untuk mata pelajaran ini. Tambah di Bank Soal dulu.
                  </p>
                ) : (
                  <>
                    {(() => {
                      // Group by kelas
                      const groups: Record<string, SoalItem[]> = {};
                      availableSoal.forEach((s) => {
                        const key = s.className || "Semua Kelas";
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(s);
                      });

                      return (
                        <div className="max-h-56 overflow-y-auto space-y-1">
                          {Object.entries(groups).map(([kelas, items]) => {
                            const groupKey = `${form.subject}|${kelas}`;
                            const isOpen = expandedSoalGroup === groupKey;
                            const allSelected = items.every((s) => selectedSoal.has(s.id));
                            const someSelected = items.some((s) => selectedSoal.has(s.id));

                            return (
                              <div key={kelas} className="border rounded-lg overflow-hidden">
                                {/* Group header */}
                                <div
                                  className="flex items-center gap-2 px-2.5 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => setExpandedSoalGroup(isOpen ? null : groupKey)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                    onChange={() => {
                                      const next = new Set(selectedSoal);
                                      items.forEach((s) => {
                                        if (allSelected) next.delete(s.id);
                                        else next.add(s.id);
                                      });
                                      setSelectedSoal(next);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="accent-primary"
                                  />
                                  <span className="text-xs font-semibold flex-1">{kelas}</span>
                                  <Badge variant="secondary" className="text-[9px]">
                                    {items.filter((s) => selectedSoal.has(s.id)).length}/{items.length}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {isOpen ? "▾" : "▸"}
                                  </span>
                                </div>

                                {/* Questions inside group */}
                                {isOpen && (
                                  <div className="border-t divide-y">
                                    {items.map((s, i) => (
                                      <label
                                        key={s.id}
                                        className={`flex items-start gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                                          selectedSoal.has(s.id) ? "bg-primary/10" : "hover:bg-muted/50"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedSoal.has(s.id)}
                                          onChange={() => toggleSoal(s.id)}
                                          className="mt-0.5 accent-primary"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="truncate">{i + 1}. {s.question}</p>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <Badge variant="outline" className="text-[9px]">{s.type}</Badge>
                                            <Badge variant="outline" className="text-[9px]">{s.difficulty}</Badge>
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <p className="text-[10px] text-muted-foreground text-right mt-1">
                      {selectedSoal.size} soal dipilih
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              <X className="size-3.5" /> Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!form.name || !form.className || !form.subject || !form.date}
            >
              <Save className="size-3.5" />
              {editingId ? "Simpan" : "Buat Ujian"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
