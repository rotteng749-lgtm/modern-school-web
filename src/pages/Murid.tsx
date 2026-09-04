import { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  X,
  Save,
  Calendar,
  Upload,
  FileText,
  Copy,
  Check,
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
import { FileUpload } from "@/components/FileUpload";
import { parseDocx, type ParsedStudent } from "@/lib/docx-import";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { toast } from "sonner";
import {
  validateCredentials,
  usernameTaken,
  sanitizeText,
  sanitizeNumeric,
} from "@/lib/security";

/* ═══════════════════════════════════════════
   MURID MANAGEMENT — Yayasan Mambaul Hasan
   ═══════════════════════════════════════════ */

export interface MuridData {
  id: string;
  name: string;
  nisn: string;
  className: string;
  gender: "Laki-laki" | "Perempuan";
  email: string;
  phone: string;
  parentName: string;
  status: "aktif" | "lulus" | "keluar";
  photo?: string; // base64 data URL
  username?: string;
  password?: string;
}

const STORAGE_KEY = "msw-murid";

const INITIAL_MURID: MuridData[] = [
  { id: "1", name: "Ahmad Fauzi", nisn: "0081234001", className: "MI Kelas 6", gender: "Laki-laki", email: "ahmad.f@siswa.id", phone: "0812-1111-2222", parentName: "H. Fauzi", status: "aktif", username: "ahmadfauzi", password: "Ahmd@2026" },
  { id: "2", name: "Siti Nurhaliza", nisn: "0081234002", className: "MI Kelas 5", gender: "Perempuan", email: "siti.n@siswa.id", phone: "0813-2222-3333", parentName: "H. Nurhaliza", status: "aktif", username: "sitinur", password: "Siti@2026" },
  { id: "3", name: "Budi Pratama", nisn: "0081234003", className: "MI Kelas 4", gender: "Laki-laki", email: "budi.p@siswa.id", phone: "0821-3333-4444", parentName: "H. Pratama", status: "aktif", username: "budipra", password: "Budi@2026" },
  { id: "4", name: "Dewi Sartika", nisn: "0081234004", className: "MI Kelas 6", gender: "Perempuan", email: "dewi.s@siswa.id", phone: "0856-4444-5555", parentName: "H. Sartika", status: "aktif", username: "dewisart", password: "Dewi@2026" },
  { id: "5", name: "Eko Prasetyo", nisn: "0081234005", className: "MI Kelas 3", gender: "Laki-laki", email: "eko.p@siswa.id", phone: "0878-5555-6666", parentName: "H. Prasetyo", status: "lulus", username: "ekopra", password: "Eko@2026" },
  { id: "6", name: "Fitriani Putri", nisn: "0081234006", className: "MI Kelas 5", gender: "Perempuan", email: "fitri.p@siswa.id", phone: "0857-6666-7777", parentName: "H. Putri", status: "aktif", username: "fitriput", password: "Fitr@2026" },
];

const KELAS = ["MI Kelas 1", "MI Kelas 2", "MI Kelas 3", "MI Kelas 4", "MI Kelas 5", "MI Kelas 6"];

const EMPTY_FORM: Omit<MuridData, "id"> = {
  name: "",
  nisn: "",
  className: "",
  gender: "Laki-laki",
  email: "",
  phone: "",
  parentName: "",
  status: "aktif",
  photo: undefined,
  username: "",
  password: "",
};

const STATUS_STYLE = {
  aktif: { color: "text-emerald-500" },
  lulus: { color: "text-blue-500" },
  keluar: { color: "text-red-500" },
};

export default function Murid() {
  const [muridList, setMuridList] = useState<MuridData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [statusFilter, setStatusFilter] = useState<"all" | "aktif" | "lulus" | "keluar">("all");

  /* ── Import state ── */
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importPhase, setImportPhase] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedForImport, setSelectedForImport] = useState<Set<number>>(new Set());
  const [importClassName, setImportClassName] = useState("X IPA 1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auth = useLocalAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: MuridData[] = raw ? JSON.parse(raw) : INITIAL_MURID;
      setMuridList(list);
      // Sync initial murid data to auth
      list.forEach((m) => {
        if (m.username && m.password && m.status === "aktif") {
          auth.addUser(m.username, m.password, m.name, "siswa");
        }
      });
    } catch {
      setMuridList(INITIAL_MURID);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (list: MuridData[]) => {
    setMuridList(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      toast.error("Penyimpanan penuh — data belum tersimpan. Hapus foto besar atau kurangi data.");
    }
  };

  const filtered = muridList.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.className.toLowerCase().includes(search.toLowerCase()) ||
      m.nisn.includes(search) ||
      m.parentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (m: MuridData) => {
    setEditingId(m.id);
    setForm({ name: m.name, nisn: m.nisn, className: m.className, gender: m.gender, email: m.email, phone: m.phone, parentName: m.parentName, status: m.status, photo: m.photo, username: m.username || "", password: m.password || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.className) return;

    // Sanitize plain-text fields
    const name = sanitizeText(form.name);
    const parentName = sanitizeText(form.parentName ?? "");
    const nisn = sanitizeNumeric(form.nisn);

    // Credentials: both-or-neither, validated + normalized
    const hasCred = Boolean(form.username || form.password);
    let username = "";
    let password = "";
    if (hasCred) {
      const v = validateCredentials(form.username ?? "", form.password ?? "");
      if (v.error) {
        toast.error(v.error);
        return;
      }
      username = v.username;
      password = (form.password ?? "").trim();
    }

    const prevUsername = editingId ? muridList.find((m) => m.id === editingId)?.username ?? "" : "";
    if (username && usernameTaken(username, prevUsername ? [prevUsername] : [])) {
      toast.error(`Username "${username}" sudah dipakai. Pilih username lain.`);
      return;
    }

    const cleaned = { ...form, name, parentName, nisn, username, password };

    if (editingId) {
      const prev = muridList.find((m) => m.id === editingId);
      save(muridList.map((m) => (m.id === editingId ? { ...m, ...cleaned } : m)));
      // Sync to auth: update so password changes actually apply (addUser is a no-op on existing)
      if (hasCred) {
        auth.updateUser(prev?.username ?? "", username, password, name, "siswa");
      } else if (prev?.username) {
        auth.deleteUser(prev.username);
      }
    } else {
      const newMurid: MuridData = { ...cleaned, id: Date.now().toString() };
      save([newMurid, ...muridList]);
      // Sync to auth
      if (hasCred) auth.addUser(username, password, name, "siswa");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus murid ini?")) {
      const m = muridList.find((m) => m.id === id);
      if (m?.username) auth.deleteUser(m.username);
      save(muridList.filter((m) => m.id !== id));
    }
  };

  const handleLulus = (id: string) => {
    if (confirm("Tandai siswa ini sebagai lulus? Status akan berubah ke 'lulus'.")) {
      save(muridList.map((m) => m.id === id ? { ...m, status: "lulus" as const } : m));
    }
  };

  const handleDeleteLulus = () => {
    if (confirm("Hapus semua siswa berstatus 'lulus'? Tindakan ini tidak dapat dibatalkan.")) {
      save(muridList.filter((m) => m.status !== "lulus"));
    }
  };

  /* ── .docx Import handlers ── */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportPhase("Membaca dokumen...");
    setImportProgress(10);

    // Simulate reading progress
    const progressInterval = setInterval(() => {
      setImportProgress((p) => Math.min(p + 8, 60));
    }, 150);

    try {
      const students = await parseDocx(file);
      clearInterval(progressInterval);
      setImportProgress(70);
      setImportPhase("Memproses data...");

      setTimeout(() => {
        setParsedStudents(students);
        setSelectedForImport(new Set(students.map((_, i) => i)));
        setImportProgress(100);
        setImportPhase("Siap diimpor!");
        setTimeout(() => {
          setImportDialogOpen(true);
        }, 400);
      }, 400);
    } catch (err) {
      clearInterval(progressInterval);
      setImportProgress(0);
      setImportPhase("Gagal membaca dokumen");
      console.error("DOCX parse error:", err);
    }

    // Reset file input
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

  const toggleSelectAll = () => {
    if (selectedForImport.size === parsedStudents.length) {
      setSelectedForImport(new Set());
    } else {
      setSelectedForImport(new Set(parsedStudents.map((_, i) => i)));
    }
  };

  const handleImport = () => {
    setImporting(true);
    setImportProgress(0);
    setImportPhase("Mengimpor data...");

    const selected = parsedStudents.filter((_, i) => selectedForImport.has(i));
    let imported = 0;

    const interval = setInterval(() => {
      imported++;
      setImportProgress(Math.round((imported / selected.length) * 100));

      if (imported >= selected.length) {
        clearInterval(interval);
        setImportPhase("Selesai!");

        // Actually save to localStorage
        const newMurids: MuridData[] = selected.map((s, i) => ({
          id: (Date.now() + i).toString(),
          name: s.name,
          nisn: s.nisn,
          className: importClassName,
          gender: "Laki-laki" as const,
          email: `${s.username}@siswa.id`,
          phone: "",
          parentName: "",
          status: "aktif" as const,
          username: s.username,
          password: s.password,
        }));

        save([...newMurids, ...muridList]);

        // Sync imported students to auth
        newMurids.forEach((m) => {
          if (m.username && m.password) {
            auth.addUser(m.username, m.password, m.name, "siswa");
          }
        });

        setTimeout(() => {
          setImporting(false);
          setImportDialogOpen(false);
          setParsedStudents([]);
          setImportProgress(0);
          setImportPhase("");
        }, 600);
      }
    }, 80);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  const active = muridList.filter((m) => m.status === "aktif").length;
  const graduated = muridList.filter((m) => m.status === "lulus").length;
  const expelled = muridList.filter((m) => m.status === "keluar").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Murid</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola data siswa — {muridList.length} terdaftar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Import .docx button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="size-4" />
              Import .docx
            </Button>
            <Button size="sm" className="rounded-full" onClick={openAdd}>
              <Plus className="size-4" />
              Tambah Murid
            </Button>
          </div>
        </div>

        {/* Import progress bar */}
        {importPhase && !importDialogOpen && (
          <Card3D intensity={1} className="p-4 obsidian-sheen">
            <div className="flex items-center gap-3 mb-2">
              <Upload className="size-4 text-primary" />
              <span className="text-sm font-medium">{importPhase}</span>
              <span className="ml-auto text-xs text-muted-foreground">{importProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-150"
                style={{
                  width: `${importProgress}%`,
                  background: importProgress >= 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #6366f1, #818cf8)",
                }}
              />
            </div>
          </Card3D>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "aktif", "lulus", "keluar"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s === "all" ? "Semua" : s === "aktif" ? `Aktif (${active})` : s === "lulus" ? `Lulus (${graduated})` : `Keluar (${expelled})`}
            </button>
          ))}
          {graduated > 0 && (
            <button
              onClick={handleDeleteLulus}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-auto"
            >
              Hapus Semua Lulus
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, kelas, NISN, atau nama orang tua..."
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
          <Card3D intensity={2} className="p-4 text-center obsidian-sheen">
            <GraduationCap className="size-4 mx-auto text-primary" />
            <p className="mt-2 text-xl font-bold">{muridList.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </Card3D>
          <Card3D intensity={2} className="p-4 text-center obsidian-sheen">
            <GraduationCap className="size-4 mx-auto text-emerald-500" />
            <p className="mt-2 text-xl font-bold">{active}</p>
            <p className="text-[11px] text-muted-foreground">Aktif</p>
          </Card3D>
          <Card3D intensity={2} className="p-4 text-center obsidian-sheen">
            <Calendar className="size-4 mx-auto text-amber-500" />
            <p className="mt-2 text-xl font-bold">{new Set(muridList.map((m) => m.className)).size}</p>
            <p className="text-[11px] text-muted-foreground">Kelas</p>
          </Card3D>
        </div>

        {/* Murid list */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Daftar Murid
          </h2>
          <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Tidak ada murid yang cocok dengan pencarian.
                </div>
              ) : (
                filtered.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors"
                  >
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="size-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                        {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{m.name}</p>
                        <Badge
                          variant={m.status === "aktif" ? "default" : "outline"}
                          className={`text-[10px] ${STATUS_STYLE[m.status].color}`}
                        >
                          {m.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {m.className} · NISN: {m.nisn} · {m.gender}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        {m.email && <span className="flex items-center gap-1"><Mail className="size-3" />{m.email}</span>}
                        {m.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{m.phone}</span>}
                      </div>
                      {m.username && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          User: <span className="font-mono">{m.username}</span> · Pass: <span className="font-mono">{m.password}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Orang tua: {m.parentName || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {m.status === "aktif" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleLulus(m.id)} title="Tandai Lulus">
                          <GraduationCap className="size-3.5 text-emerald-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(m)}>
                        <Edit className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card3D>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Murid" : "Tambah Murid"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui data murid." : "Masukkan data murid baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap *</Label>
              <Input
                placeholder="Ahmad Fauzi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">NISN</Label>
                <Input
                  placeholder="0081234..."
                  value={form.nisn}
                  onChange={(e) => setForm({ ...form, nisn: e.target.value })}
                />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jenis Kelamin</Label>
                <Select value={form.gender} onValueChange={(v: "Laki-laki" | "Perempuan") => setForm({ ...form, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v: "aktif" | "lulus" | "keluar") => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="lulus">Lulus</SelectItem>
                    <SelectItem value="keluar">Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  placeholder="nama@siswa.id"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telepon</Label>
                <Input
                  placeholder="0812-xxxx-xxxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Orang Tua / Wali</Label>
              <Input
                placeholder="H. Fauzi"
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Username</Label>
                <Input
                  placeholder="otomatis dari nama"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <Input
                  placeholder="otomatis random"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Foto Profil</Label>
              {form.photo ? (
                <div className="flex items-center gap-3">
                  <img src={form.photo} alt="Preview" className="w-14 h-14 rounded-full object-cover border" />
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, photo: undefined })}>
                    Ganti foto
                  </Button>
                </div>
              ) : (
                <FileUpload
                  category="siswa"
                  onUploaded={(file) => setForm({ ...form, photo: file.dataUrl })}
                  maxSizeMB={3}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              <X className="size-3.5" />
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!form.name || !form.className}>
              <Save className="size-3.5" />
              {editingId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Import .docx Dialog ═══ */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Import dari .docx
            </DialogTitle>
            <DialogDescription>
              {parsedStudents.length} siswa ditemukan dalam dokumen. Pilih siswa yang ingin diimpor.
            </DialogDescription>
          </DialogHeader>

          {/* Import progress bar */}
          {importing && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <Upload className="size-4 text-primary" />
                <span>{importPhase}</span>
                <span className="ml-auto text-muted-foreground">{importProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-150"
                  style={{
                    width: `${importProgress}%`,
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                  }}
                />
              </div>
            </div>
          )}

          {!importing && parsedStudents.length > 0 && (
            <>
              {/* Class selector + select all */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Kelas Tujuan</Label>
                  <Select value={importClassName} onValueChange={setImportClassName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KELAS.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-5">
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedForImport.size === parsedStudents.length ? "Batal Pilih" : "Pilih Semua"}
                  </Button>
                </div>
              </div>

              {/* Parsed students table */}
              <div className="mt-3 border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background border-b">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="p-2 w-8">
                          <input
                            type="checkbox"
                            checked={selectedForImport.size === parsedStudents.length}
                            onChange={toggleSelectAll}
                            className="accent-primary"
                          />
                        </th>
                        <th className="p-2">Nama</th>
                        <th className="p-2">NISN</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Password</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedStudents.map((s, i) => (
                        <tr
                          key={i}
                          className={`${selectedForImport.has(i) ? "bg-primary/5" : "opacity-60"} hover:bg-accent/30 transition-colors`}
                        >
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedForImport.has(i)}
                              onChange={() => toggleImportSelection(i)}
                              className="accent-primary"
                            />
                          </td>
                          <td className="p-2 font-medium">{s.name}</td>
                          <td className="p-2 font-mono text-xs">{s.nisn}</td>
                          <td className="p-2 font-mono text-xs">{s.username}</td>
                          <td className="p-2 font-mono text-xs">{s.password}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => copyToClipboard(`${s.username} / ${s.password}`, i)}
                            >
                              {copiedIdx === i ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>{selectedForImport.size} dari {parsedStudents.length} dipilih</span>
                <span>Kelas: {importClassName}</span>
              </div>

              {/* Import button */}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => { setImportDialogOpen(false); setParsedStudents([]); }}>
                  <X className="size-3.5" />
                  Batal
                </Button>
                <Button size="sm" onClick={handleImport} disabled={selectedForImport.size === 0}>
                  <Upload className="size-3.5" />
                  Impor {selectedForImport.size} Siswa
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
