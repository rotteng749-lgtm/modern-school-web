import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Upload,
  Trash2,
  HardDrive,
  FileImage,
  FolderOpen,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import {
  getAllFiles,
  deleteFile,
  getStorageUsage,
  formatBytes,
  type StoredFile,
} from "@/lib/file-storage";
import {
  saveMainLogo,
  getMainLogo,
  removeMainLogo,
} from "@/lib/logo-storage";
import { SCHOOL_LOGO_PRESETS } from "@/components/SchoolLogos";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   DATABASE — File/Image Management + Logo
   ═══════════════════════════════════════════ */

const CATEGORIES = [
  { value: "all", label: "Semua" },
  { value: "logo", label: "Logo" },
  { value: "guru", label: "Guru" },
  { value: "siswa", label: "Siswa" },
  { value: "gallery", label: "Gallery" },
  { value: "umum", label: "Umum" },
];

const CATEGORY_COLORS: Record<string, string> = {
  logo: "bg-primary/15 text-primary",
  guru: "bg-blue-500/15 text-blue-500",
  siswa: "bg-emerald-500/15 text-emerald-500",
  gallery: "bg-amber-500/15 text-amber-500",
  umum: "bg-purple-500/15 text-purple-500",
};

export default function DatabasePage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [storage, setStorage] = useState({ count: 0, bytes: 0 });
  const [filter, setFilter] = useState("all");
  const [uploadCategory, setUploadCategory] = useState("umum");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | null>(getMainLogo());

  const loadData = useCallback(async () => {
    try {
      const all = await getAllFiles();
      setFiles(all.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
      const usage = await getStorageUsage();
      setStorage(usage);
      setCurrentLogo(getMainLogo());
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCurrentLogo(detail);
    };
    window.addEventListener("logo-changed", handler);
    return () => window.removeEventListener("logo-changed", handler);
  }, [loadData]);

  const filtered = files.filter((f) => {
    if (filter !== "all" && f.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus gambar ini?")) return;
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setStorage((prev) => ({ ...prev, count: prev.count - 1 }));
    if (selectedFile?.id === id) setSelectedFile(null);
    toast.success("Gambar berhasil dihapus.");
  };

  const handleLogoUpload = async (file: StoredFile) => {
    await saveMainLogo(file.dataUrl, file.name);
    // Delete from regular files since it's now the logo
    await deleteFile(file.id);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setCurrentLogo(file.dataUrl);
    toast.success("Logo utama berhasil diperbarui!");
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Hapus logo utama? Sidebar akan kembali ke icon default.")) return;
    await removeMainLogo();
    setCurrentLogo(null);
    toast.success("Logo utama berhasil dihapus.");
  };

  const categoryCounts = files.reduce(
    (acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Penyimpanan Lokal
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Database File
            </h1>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={loadData}>
            <RefreshCw className="size-3.5" />
            Muat Ulang
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total File", value: storage.count.toString(), icon: FileImage, color: "text-primary", bg: "bg-primary/10" },
            { label: "Ukuran", value: formatBytes(storage.bytes), icon: HardDrive, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Kategori", value: Object.keys(categoryCounts).length.toString(), icon: FolderOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "IndexedDB", value: "Aktif", icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((stat) => (
            <Card3D key={stat.label} intensity={3} className="p-4 obsidian-sheen">
              <div className="flex items-center gap-3">
                <div className={`flex size-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        {/* ═══ LOGO MANAGEMENT ═══ */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Logo Utama Sekolah</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Logo ini tampil di sidebar, header, dan landing page. Pilih preset atau upload logo sendiri.
            </p>

            {/* Preset logo selector */}
            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Logo Preset Yayasan Mambaul Hasan</p>
              <div className="grid grid-cols-4 gap-3">
                {SCHOOL_LOGO_PRESETS.map((preset) => {
                  const LogoComp = preset.component;
                  return (
                    <button
                      key={preset.id}
                      onClick={async () => {
                        // Convert SVG to data URL for storage
                        const svgEl = document.createElement("div");
                        svgEl.innerHTML = "";
                        document.body.appendChild(svgEl);
                        // Use a simpler approach: store the preset ID
                        localStorage.setItem("msw-logo-preset", preset.id);
                        window.dispatchEvent(new CustomEvent("logo-changed", { detail: `preset:${preset.id}` }));
                        toast.success(`Logo ${preset.name} dipilih!`);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-transparent hover:border-primary/50 bg-muted/30 hover:bg-muted/60 transition-all group"
                    >
                      <LogoComp className="w-16 h-16 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">{preset.abbr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Current Logo Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed bg-muted/50 flex items-center justify-center overflow-hidden">
                  {currentLogo ? (
                    <img src={currentLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImageIcon className="size-8 opacity-40" />
                      <span className="text-[10px]">Belum ada logo</span>
                    </div>
                  )}
                </div>
                {currentLogo && (
                  <Button variant="destructive" size="sm" className="rounded-full text-xs" onClick={handleRemoveLogo}>
                    <Trash2 className="size-3" />
                    Hapus Logo
                  </Button>
                )}
              </div>

              {/* Upload */}
              <div className="flex-1 w-full">
                <FileUpload
                  category="logo"
                  onUploaded={handleLogoUpload}
                  maxSizeMB={5}
                />
                <p className="text-[10px] text-muted-foreground mt-2">
                  Format: PNG, JPG, atau WEBP. Ukuran optimal 200×200px.
                </p>
              </div>
            </div>
          </div>
        </Card3D>

        {/* Upload Section — other files */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Upload Gambar Lainnya</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c.value !== "all" && c.value !== "logo").map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setUploadCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        uploadCategory === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <FileUpload
                category={uploadCategory}
                onUploaded={() => loadData()}
              />
            </div>
          </div>
        </Card3D>

        {/* Browse Section */}
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-sm font-semibold">File Tersimpan</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Cari file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
                {cat.value !== "all" && categoryCounts[cat.value] && (
                  <span className="ml-1 opacity-70">({categoryCounts[cat.value]})</span>
                )}
                {cat.value === "all" && (
                  <span className="ml-1 opacity-70">({files.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* File Grid */}
          {filtered.length === 0 ? (
            <Card3D intensity={2} className="obsidian-sheen">
              <div className="p-8 text-center text-muted-foreground">
                <Database className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada file tersimpan.</p>
                <p className="text-xs mt-1">Upload gambar pertama di atas.</p>
              </div>
            </Card3D>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="group relative aspect-square rounded-xl overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                  onClick={() => setSelectedFile(file)}
                >
                  <img
                    src={file.thumbnail || file.dataUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <Badge variant="secondary" className={`text-[9px] ${CATEGORY_COLORS[file.category] || ""}`}>
                      {file.category}
                    </Badge>
                    <p className="text-[10px] text-white/80 text-center line-clamp-1">{file.name}</p>
                    <p className="text-[9px] text-white/50">{formatBytes(file.size)}</p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="bg-white/10 hover:bg-destructive/80 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedFile(null)}
        >
          <Card3D intensity={2} className="w-full max-w-lg obsidian-sheen">
            <div className="p-5" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold truncate">{selectedFile.name}</h3>
                <Button variant="ghost" size="icon-sm" onClick={() => setSelectedFile(null)}>
                  ×
                </Button>
              </div>
              <div className="rounded-lg overflow-hidden border mb-4">
                <img
                  src={selectedFile.dataUrl}
                  alt={selectedFile.name}
                  className="w-full max-h-80 object-contain bg-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Kategori: </span>
                  <Badge variant="secondary" className={`text-[10px] ${CATEGORY_COLORS[selectedFile.category] || ""}`}>
                    {selectedFile.category}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Ukuran: </span>
                  <span className="font-medium">{formatBytes(selectedFile.size)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Diupload: </span>
                  <span className="font-medium">
                    {new Date(selectedFile.uploadedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    handleDelete(selectedFile.id);
                    setSelectedFile(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Hapus
                </Button>
              </div>
            </div>
          </Card3D>
        </div>
      )}
    </DashboardShell>
  );
}
