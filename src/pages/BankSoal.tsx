import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Tag,
  Upload,
  FileText,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
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
import { importSoal, type ParsedSoal } from "@/lib/soal-import";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   BANK SOAL — Full CRUD + Auto-detect Import
   Yayasan Mambaul Hasan
   ═══════════════════════════════════════════ */

export interface SoalItem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  subject: string;
  type: "Pilihan Ganda" | "Uraian";
  difficulty: "Mudah" | "Sedang" | "Sulit";
  createdAt: string;
}

const STORAGE_KEY = "msw-bank-soal";

const SUBJECTS = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Fisika",
  "Kimia",
  "Biologi",
  "IPS",
  "Pendidikan Agama",
  "PJOK",
  "Informatika",
];

const INITIAL_SOAL: SoalItem[] = [
  {
    id: "1",
    question: "Tentukan nilai x dari persamaan 2x² − 8x + 6 = 0",
    options: ["x = 1 atau x = 3", "x = 2 atau x = 4", "x = -1 atau x = 3", "x = 1 atau x = -3"],
    answer: "x = 1 atau x = 3",
    subject: "Matematika",
    type: "Pilihan Ganda",
    difficulty: "Sedang",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "2",
    question: "Analisis teks argumentasi berikut dan tentukan thesis statement-nya",
    options: [],
    answer: "",
    subject: "Bahasa Indonesia",
    type: "Uraian",
    difficulty: "Sulit",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "3",
    question: "Sebutkan 3 hukum Newton dan berikan contoh penerapannya dalam kehidupan sehari-hari",
    options: [],
    answer: "",
    subject: "Fisika",
    type: "Uraian",
    difficulty: "Sedang",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const EMPTY_FORM = {
  question: "",
  options: ["", "", "", ""],
  answer: "",
  subject: "",
  type: "Pilihan Ganda" as "Pilihan Ganda" | "Uraian",
  difficulty: "Sedang" as "Mudah" | "Sedang" | "Sulit",
};

const DIFF_STYLE: Record<string, string> = {
  Mudah: "bg-emerald-500/12 text-emerald-500",
  Sedang: "bg-amber-500/12 text-amber-500",
  Sulit: "bg-red-500/12 text-red-500",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function BankSoal() {
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  /* ── Add/Edit dialog ── */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* ── Import dialog ── */
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importPhase, setImportPhase] = useState("");
  const [parsedSoal, setParsedSoal] = useState<ParsedSoal[]>([]);
  const [selectedForImport, setSelectedForImport] = useState<Set<number>>(new Set());
  const [importSubject, setImportSubject] = useState("Matematika");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ format: string; detectedType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSoalList(JSON.parse(raw));
      } else {
        setSoalList(INITIAL_SOAL);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOAL));
      }
    } catch {
      setSoalList(INITIAL_SOAL);
    }
  }, []);

  const save = (list: SoalItem[]) => {
    setSoalList(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  /* ── Filtered list ── */
  const filtered = soalList.filter((s) => {
    const matchSearch =
      !search ||
      s.question.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || s.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  /* ── Category counts ── */
  const categoryCounts = soalList.reduce(
    (acc, s) => {
      acc[s.subject] = (acc[s.subject] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  /* ── Add/Edit handlers ── */
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (s: SoalItem) => {
    setEditingId(s.id);
    setForm({
      question: s.question,
      options: s.options.length >= 4 ? s.options : [...s.options, "", "", "", ""].slice(0, 4),
      answer: s.answer,
      subject: s.subject,
      type: s.type,
      difficulty: s.difficulty,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.question || !form.subject) return;

    const cleanedOptions =
      form.type === "Pilihan Ganda"
        ? form.options.filter((o) => o.trim())
        : [];

    if (editingId) {
      save(
        soalList.map((s) =>
          s.id === editingId
            ? { ...s, ...form, options: cleanedOptions }
            : s
        )
      );
      toast.success("Soal berhasil diperbarui.");
    } else {
      const newSoal: SoalItem = {
        id: Date.now().toString(),
        question: form.question,
        options: cleanedOptions,
        answer: form.answer,
        subject: form.subject,
        type: form.type,
        difficulty: form.difficulty,
        createdAt: new Date().toISOString(),
      };
      save([newSoal, ...soalList]);
      toast.success("Soal berhasil ditambahkan.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus soal ini?")) {
      save(soalList.filter((s) => s.id !== id));
      toast.success("Soal berhasil dihapus.");
    }
  };

  /* ── Import handlers ── */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportPhase("Membaca file...");
    setImportProgress(10);

    const progressInterval = setInterval(() => {
      setImportProgress((p) => Math.min(p + 8, 60));
    }, 150);

    try {
      const result = await importSoal(file);
      clearInterval(progressInterval);
      setImportProgress(70);
      setImportPhase(`Terdeteksi: ${result.format} — ${result.detectedType}`);

      setTimeout(() => {
        setParsedSoal(result.questions);
        setImportResult({ format: result.format, detectedType: result.detectedType });
        setSelectedForImport(new Set(result.questions.map((_, i) => i)));
        setImportProgress(100);
        setImportPhase(`${result.questions.length} soal ditemukan!`);

        setTimeout(() => {
          setImportDialogOpen(true);
        }, 400);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setImportProgress(0);
      setImportPhase("Gagal membaca file");
      toast.error(err instanceof Error ? err.message : "Gagal mengimpor file.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleImportSelection = (idx: number) => {
    setSelectedForImport((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleImport = () => {
    setImporting(true);
    setImportProgress(0);
    setImportPhase("Mengimpor soal...");

    const selected = parsedSoal.filter((_, i) => selectedForImport.has(i));
    let imported = 0;

    const interval = setInterval(() => {
      imported++;
      setImportProgress(Math.round((imported / selected.length) * 100));

      if (imported >= selected.length) {
        clearInterval(interval);

        const newSoalItems: SoalItem[] = selected.map((s, i) => ({
          id: (Date.now() + i).toString(),
          question: s.question,
          options: s.options,
          answer: s.answer,
          subject: importSubject,
          type: s.type,
          difficulty: s.difficulty,
          createdAt: new Date().toISOString(),
        }));

        save([...newSoalItems, ...soalList]);
        setImportPhase("Selesai!");
        toast.success(`${selected.length} soal berhasil diimpor.`);

        setTimeout(() => {
          setImporting(false);
          setImportDialogOpen(false);
          setParsedSoal([]);
          setImportProgress(0);
          setImportPhase("");
          setImportResult(null);
        }, 600);
      }
    }, 80);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bank Soal</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Koleksi soal terstruktur — {soalList.length} total soal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.txt,.csv,.tsv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Import
            </Button>
            <Button size="sm" className="rounded-full" onClick={openAdd}>
              <Plus className="size-4" />
              Tambah Soal
            </Button>
          </div>
        </div>

        {/* Import progress bar */}
        {importPhase && !importDialogOpen && (
          <Card3D intensity={1} className="p-4 obsidian-sheen">
            <div className="flex items-center gap-3 mb-2">
              <Upload className="size-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">{importPhase}</span>
              <span className="ml-auto text-xs text-muted-foreground">{importProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${importProgress}%`,
                  background:
                    importProgress >= 100
                      ? "linear-gradient(90deg, #10b981, #34d399)"
                      : "linear-gradient(90deg, #6366f1, #818cf8)",
                }}
              />
            </div>
          </Card3D>
        )}

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari soal berdasarkan kata kunci, mata pelajaran..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mapel</SelectItem>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category cards */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Per Kategori
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {SUBJECTS.filter((s) => categoryCounts[s]).map((name) => (
              <Card3D
                key={name}
                intensity={3}
                className={`p-4 obsidian-sheen cursor-pointer transition-all ${
                  filterSubject === name ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setFilterSubject(filterSubject === name ? "all" : name)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Tag className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {categoryCounts[name]} soal
                    </p>
                  </div>
                </div>
              </Card3D>
            ))}
            {Object.keys(categoryCounts).length === 0 && (
              <Card3D intensity={2} className="p-4 obsidian-sheen col-span-full">
                <p className="text-sm text-muted-foreground text-center">
                  Belum ada soal. Tambah atau import soal pertama.
                </p>
              </Card3D>
            )}
          </div>
        </div>

        {/* Soal list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Daftar Soal
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} dari {soalList.length}
            </span>
          </div>
          <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {soalList.length === 0
                    ? "Belum ada soal. Klik \"Tambah Soal\" atau \"Import\"."
                    : "Tidak ada soal yang cocok dengan pencarian."}
                </div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id}
                    className="px-5 py-4 hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">
                        {s.question}
                      </p>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                          <Edit className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Options preview for Pilihan Ganda */}
                    {s.type === "Pilihan Ganda" && s.options.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {s.options.map((opt, i) => (
                          <span
                            key={i}
                            className={`text-[11px] px-2 py-1 rounded bg-muted/50 ${
                              s.answer && opt === s.answer
                                ? "bg-emerald-500/15 text-emerald-600 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {s.subject}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {s.type}
                      </Badge>
                      <Badge className={`text-[10px] ${DIFF_STYLE[s.difficulty]}`}>
                        {s.difficulty}
                      </Badge>
                      {s.answer && s.type === "Pilihan Ganda" && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                          ✓ {s.answer}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {timeAgo(s.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card3D>
        </div>
      </div>

      {/* ═══ ADD / EDIT DIALOG ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui soal yang sudah ada." : "Buat soal baru atau isi jawaban pilihan ganda."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Subject + Type + Difficulty */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Mata Pelajaran *</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) => setForm({ ...form, subject: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jenis Soal</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: "Pilihan Ganda" | "Uraian") =>
                    setForm({ ...form, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pilihan Ganda">Pilihan Ganda</SelectItem>
                    <SelectItem value="Uraian">Uraian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tingkat Kesulitan</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v: "Mudah" | "Sedang" | "Sulit") =>
                    setForm({ ...form, difficulty: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mudah">Mudah</SelectItem>
                    <SelectItem value="Sedang">Sedang</SelectItem>
                    <SelectItem value="Sulit">Sulit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question */}
            <div className="space-y-1.5">
              <Label className="text-xs">Soal / Pertanyaan *</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                placeholder="Tuliskan soal di sini..."
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>

            {/* Options for Pilihan Ganda */}
            {form.type === "Pilihan Ganda" && (
              <div className="space-y-2">
                <Label className="text-xs">Pilihan Jawaban</Label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <Input
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...form.options];
                        newOpts[i] = e.target.value;
                        setForm({ ...form, options: newOpts });
                      }}
                    />
                    {form.answer === opt && opt && (
                      <Check className="size-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-xs">Jawaban Benar</Label>
                  <Select
                    value={form.answer}
                    onValueChange={(v) => setForm({ ...form, answer: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jawaban benar" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.options
                        .filter((o) => o.trim())
                        .map((opt, i) => (
                          <SelectItem key={i} value={opt}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Answer for Uraian */}
            {form.type === "Uraian" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Kunci Jawaban (opsional)</Label>
                <textarea
                  className="w-full min-h-[60px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  placeholder="Tuliskan kunci jawaban / rubrik penilaian..."
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              <X className="size-3.5" />
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!form.question || !form.subject}
            >
              <Save className="size-3.5" />
              {editingId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ IMPORT DIALOG ═══ */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Import Soal
            </DialogTitle>
            <DialogDescription>
              {parsedSoal.length} soal ditemukan dari {importResult?.format || "file"}.
            </DialogDescription>
          </DialogHeader>

          {/* Auto-detect info */}
          {importResult && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mt-2">
              <AlertCircle className="size-4 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Format terdeteksi: {importResult.format}</p>
                <p className="text-muted-foreground">
                  Tipe soal dominan: {importResult.detectedType} — {parsedSoal.length} soal
                </p>
              </div>
            </div>
          )}

          {/* Import progress */}
          {importing && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <Upload className="size-4 text-primary animate-pulse" />
                <span>{importPhase}</span>
                <span className="ml-auto text-muted-foreground">{importProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${importProgress}%`,
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                  }}
                />
              </div>
            </div>
          )}

          {!importing && parsedSoal.length > 0 && (
            <>
              {/* Subject selector + select all */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Mata Pelajaran Tujuan</Label>
                  <Select value={importSubject} onValueChange={setImportSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedForImport.size === parsedSoal.length) {
                        setSelectedForImport(new Set());
                      } else {
                        setSelectedForImport(new Set(parsedSoal.map((_, i) => i)));
                      }
                    }}
                  >
                    {selectedForImport.size === parsedSoal.length ? "Batal Pilih" : "Pilih Semua"}
                  </Button>
                </div>
              </div>

              {/* Preview table */}
              <div className="mt-3 border rounded-lg overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background border-b">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="p-2 w-8">
                          <input
                            type="checkbox"
                            checked={selectedForImport.size === parsedSoal.length && parsedSoal.length > 0}
                            onChange={() => {
                              if (selectedForImport.size === parsedSoal.length) {
                                setSelectedForImport(new Set());
                              } else {
                                setSelectedForImport(new Set(parsedSoal.map((_, i) => i)));
                              }
                            }}
                            className="accent-primary"
                          />
                        </th>
                        <th className="p-2">No</th>
                        <th className="p-2">Soal</th>
                        <th className="p-2">Jenis</th>
                        <th className="p-2">Opsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedSoal.map((s, i) => (
                        <tr
                          key={i}
                          className={`${
                            selectedForImport.has(i) ? "bg-primary/5" : "opacity-60"
                          } hover:bg-accent/30 transition-colors`}
                        >
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedForImport.has(i)}
                              onChange={() => toggleImportSelection(i)}
                              className="accent-primary"
                            />
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">{i + 1}</td>
                          <td className="p-2">
                            <p className="text-xs font-medium line-clamp-2">{s.question}</p>
                            {s.options.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {s.options.slice(0, 4).map((opt, j) => (
                                  <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    {String.fromCharCode(65 + j)}. {opt.slice(0, 30)}
                                    {opt.length > 30 ? "..." : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-[9px]">
                              {s.type}
                            </Badge>
                          </td>
                          <td className="p-2 text-[10px] text-muted-foreground">
                            {s.options.length > 0 ? `${s.options.length} opsi` : "Uraian"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>
                  {selectedForImport.size} dari {parsedSoal.length} dipilih
                </span>
                <span>Mapel: {importSubject}</span>
              </div>

              {/* Import button */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImportDialogOpen(false);
                    setParsedSoal([]);
                    setImportResult(null);
                  }}
                >
                  <X className="size-3.5" />
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={selectedForImport.size === 0}
                >
                  <Upload className="size-3.5" />
                  Impor {selectedForImport.size} Soal
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
