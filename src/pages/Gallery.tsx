import { useState, useEffect } from "react";
import {
  Images,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  FolderOpen,
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
   GALLERY — Student Projects & Achievements
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-gallery";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  author: string;
  createdAt: string;
}

const CATEGORIES = ["Proyek Sains", "Seni & Desain", "Olahraga", "Teknologi", "Kegiatan Sekolah", "Prestasi"];

const PLACEHOLDER_COLORS = [
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-cyan-500 to-sky-600",
];

const DEFAULT_ITEMS: GalleryItem[] = [
  {
    id: "1",
    title: "Robot Penjelajah Mars",
    category: "Teknologi",
    description: "Proyek robot penjelajah semi-otonom yang dibuat oleh siswa kelas XI untuk kompetisi robotik nasional.",
    imageUrl: "",
    author: "Tim Robotika XII",
    createdAt: "2026-08-18",
  },
  {
    id: "2",
    title: "Mural Budaya Nusantara",
    category: "Seni & Desain",
    description: "Mural berukuran 3x10 meter menggambarkan keberagaman budaya Indonesia di dinding gedung utama.",
    imageUrl: "",
    author: "Klub Seni Rupa",
    createdAt: "2026-08-12",
  },
  {
    id: "3",
    title: "Juara 1 Lomba Cerdas Cermat",
    category: "Prestasi",
    description: "Tim cerdas cermat sekolah berhasil meraih juara 1 tingkat provinsi.",
    imageUrl: "",
    author: "Tim Cerdas Cermat",
    createdAt: "2026-08-05",
  },
];

function loadItems(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_ITEMS;
}

function saveItems(items: GalleryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>(loadItems);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "Proyek Sains",
    description: "",
    imageUrl: "",
    author: "",
  });

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const filtered = items.filter(
    (item) =>
      (filterCategory === "Semua" || item.category === filterCategory) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", category: "Proyek Sains", description: "", imageUrl: "", author: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl,
      author: item.author,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Judul wajib diisi.");
      return;
    }
    if (editingId) {
      setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, ...form } : i)));
      toast.success("Item galeri berhasil diperbarui.");
    } else {
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Item galeri baru berhasil ditambahkan.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Yakin ingin menghapus item ini?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item galeri berhasil dihapus.");
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Portfolio & Pencapaian
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Gallery</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari galeri..."
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

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {["Semua", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <Card3D intensity={2} className="obsidian-sheen">
                <div className="p-8 text-center text-muted-foreground">
                  <Images className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada item galeri ditemukan.</p>
                </div>
              </Card3D>
            </div>
          )}
          {filtered.map((item, idx) => (
            <Card3D key={item.id} intensity={4} className="obsidian-sheen overflow-hidden group">
              {/* Image / Placeholder */}
              <div
                className={`h-40 bg-gradient-to-br ${
                  PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length]
                } flex items-center justify-center relative`}
              >
                <Images className="size-10 text-white/40" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="bg-black/40 hover:bg-black/60 text-white"
                    onClick={() => openEdit(item)}
                  >
                    <Edit className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="bg-black/40 hover:bg-black/60 text-white"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <Badge variant="secondary" className="text-[10px] mb-2">
                  {item.category}
                </Badge>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                  <span>{item.author}</span>
                  <span>{item.createdAt}</span>
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
            <DialogTitle>{editingId ? "Edit Item Galeri" : "Item Galeri Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Judul</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Nama proyek atau pencapaian"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label>Penulis / Tim</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  placeholder="Nama penulis atau tim"
                />
              </div>
            </div>
            <div>
              <Label>URL Gambar (opsional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Deskripsi singkat item"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editingId ? "Simpan" : "Tambahkan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
