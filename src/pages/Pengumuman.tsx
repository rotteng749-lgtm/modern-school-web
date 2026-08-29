import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Search,
  CalendarDays,
  Tag,
  Eye,
  Trash2,
  Edit,
  X,
  FileText,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   PENGUMUMAN (Announcements) — CRUD
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-pengumuman";

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  views: number;
  publishedAt: string;
  isPublished: boolean;
}

const CATEGORIES = [
  "Akademik",
  "Kegiatan",
  "Pengumuman Resmi",
  "Prestasi",
  "Berita",
];

const DEFAULT_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Jadwal Ujian Akhir Semester Genap 2026",
    category: "Akademik",
    excerpt: "Pengumuman jadwal pelaksanaan ujian akhir semester genap tahun ajaran 2025/2026.",
    content: "Ujian akhir semester genap akan dilaksanakan mulai tanggal 15 Juni hingga 28 Juni 2026. Seluruh siswa wajib hadir tepat waktu sesuai jadwal yang telah ditentukan.",
    views: 342,
    publishedAt: "2026-08-20",
    isPublished: true,
  },
  {
    id: "2",
    title: "Prestasi Olimpiade Sains Tingkat Nasional",
    category: "Prestasi",
    excerpt: "Tim olimpiade sains sekolah meraih juara 2 dalam kompetisi tingkat nasional.",
    content: "Selamat kepada tim olimpiade sains yang telah mengharumkan nama sekolah dengan meraih juara 2 pada Olimpiade Sains Nasional 2026 di Jakarta.",
    views: 521,
    publishedAt: "2026-08-15",
    isPublished: true,
  },
  {
    id: "3",
    title: "Kegiatan Class Meeting dan Perpisahan",
    category: "Kegiatan",
    excerpt: "Jadwal kegiatan class meeting dan perpisahan siswa kelas XII.",
    content: "Class meeting akan dilaksanakan selama 3 hari setelah ujian akhir selesai, diikuti dengan acara perpisahan siswa kelas XII.",
    views: 189,
    publishedAt: "2026-08-10",
    isPublished: true,
  },
];

function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_ARTICLES;
}

function saveArticles(articles: Article[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

const CATEGORY_COLORS: Record<string, string> = {
  Akademik: "bg-blue-500/15 text-blue-500",
  Kegiatan: "bg-emerald-500/15 text-emerald-500",
  "Pengumuman Resmi": "bg-amber-500/15 text-amber-500",
  Prestasi: "bg-purple-500/15 text-purple-500",
  Berita: "bg-pink-500/15 text-pink-500",
};

export default function Pengumuman() {
  const [articles, setArticles] = useState<Article[]>(loadArticles);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "Akademik",
    excerpt: "",
    content: "",
    isPublished: true,
  });

  useEffect(() => {
    saveArticles(articles);
  }, [articles]);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", category: "Akademik", excerpt: "", content: "", isPublished: true });
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      content: a.content,
      isPublished: a.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Judul wajib diisi.");
      return;
    }
    if (editingId) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, ...form }
            : a
        )
      );
      toast.success("Pengumuman berhasil diperbarui.");
    } else {
      const newArticle: Article = {
        id: Date.now().toString(),
        ...form,
        views: 0,
        publishedAt: new Date().toISOString().split("T")[0],
      };
      setArticles((prev) => [newArticle, ...prev]);
      toast.success("Pengumuman baru berhasil dibuat.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast.success("Pengumuman berhasil dihapus.");
  };

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Konten & Publikasi
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Pengumuman
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari pengumuman..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 sm:w-64"
              />
            </div>
            <Button onClick={openCreate} size="sm" className="rounded-full shrink-0">
              <Plus className="size-3.5" />
              Baru
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Pengumuman", value: articles.length.toString(), icon: FileText },
            { label: "Total Dilihat", value: totalViews.toLocaleString(), icon: Eye },
            { label: "Kategori", value: CATEGORIES.length.toString(), icon: Tag },
          ].map((s) => (
            <Card3D key={s.label} intensity={3} className="p-4 obsidian-sheen">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="size-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        {/* Articles List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card3D intensity={2} className="obsidian-sheen">
              <div className="p-8 text-center text-muted-foreground">
                <Megaphone className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada pengumuman ditemukan.</p>
              </div>
            </Card3D>
          )}
          {filtered.map((article) => (
            <Card3D key={article.id} intensity={2} className="obsidian-sheen">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className={`text-[10px] ${CATEGORY_COLORS[article.category] || ""}`}>
                        {article.category}
                      </Badge>
                      {!article.isPublished && (
                        <Badge variant="outline" className="text-[10px]">Draft</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base">{article.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {article.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {article.views} dilihat
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(article)}>
                      <Edit className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pengumuman" : "Pengumuman Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Judul</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Judul pengumuman"
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ringkasan</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Ringkasan singkat"
                rows={2}
              />
            </div>
            <div>
              <Label>Konten</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Isi pengumuman lengkap"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Simpan Perubahan" : "Terbitkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
