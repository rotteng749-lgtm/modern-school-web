import { useState, useEffect } from "react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  Mail,
  Phone,
  X,
  Save,
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

/* ═══════════════════════════════════════════
   GURU MANAGEMENT — Modern School Web
   ═══════════════════════════════════════════ */

export interface GuruData {
  id: string;
  name: string;
  nip: string;
  subject: string;
  email: string;
  phone: string;
  status: "aktif" | "nonaktif";
  photo?: string;
  username?: string;
  password?: string;
}

const STORAGE_KEY = "msw-guru";

const INITIAL_GURU: GuruData[] = [
  { id: "1", name: "Dr. Ahmad Sudirman, M.Pd", nip: "198501012010011001", subject: "Matematika", email: "ahmad@sekolah.id", phone: "0812-3456-7890", status: "aktif", username: "ahmadsudirman", password: "Ahmad@2026" },
  { id: "2", name: "Siti Rahmawati, S.Pd", nip: "199003152015042001", subject: "Bahasa Indonesia", email: "siti@sekolah.id", phone: "0813-4567-8901", status: "aktif", username: "sitirahma", password: "Siti@2026" },
  { id: "3", name: "Budi Hartono, M.Sc", nip: "198806202012031001", subject: "Fisika", email: "budi@sekolah.id", phone: "0821-5678-9012", status: "aktif", username: "budiharto", password: "Budi@2026" },
  { id: "4", name: "Dewi Kartika, S.Pd", nip: "199205102018012001", subject: "Kimia", email: "dewi@sekolah.id", phone: "0856-6789-0123", status: "nonaktif", username: "dewikartika", password: "Dewi@2026" },
];

const MAPPEL = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Fisika", "Kimia", "Biologi", "IPS", "Pendidikan Agama", "PJOK", "Informatika"];

const EMPTY_FORM: Omit<GuruData, "id"> = {
  name: "",
  nip: "",
  subject: "",
  email: "",
  phone: "",
  status: "aktif",
  photo: undefined,
  username: "",
  password: "",
};

export default function Guru() {
  const [guruList, setGuruList] = useState<GuruData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const auth = useLocalAuth();

  // Load from localStorage
  useEffect(() => {
    // Sync initial guru data to auth
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: GuruData[] = raw ? JSON.parse(raw) : INITIAL_GURU;
    list.forEach((g) => {
      if (g.username && g.password) {
        auth.addUser(g.username, g.password, g.name, "guru");
      }
    });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setGuruList(JSON.parse(raw));
      } else {
        setGuruList(INITIAL_GURU);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GURU));
      }
    } catch {
      setGuruList(INITIAL_GURU);
    }
  }, []);

  const save = (list: GuruData[]) => {
    setGuruList(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = guruList.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.subject.toLowerCase().includes(search.toLowerCase()) ||
      g.nip.includes(search)
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (g: GuruData) => {
    setEditingId(g.id);
    setForm({ name: g.name, nip: g.nip, subject: g.subject, email: g.email, phone: g.phone, status: g.status, photo: g.photo, username: g.username || "", password: g.password || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.subject) return;

    if (editingId) {
      const prev = guruList.find((g) => g.id === editingId);
      save(guruList.map((g) => (g.id === editingId ? { ...g, ...form } : g)));
      // Sync to auth
      if (form.username && form.password) {
        auth.updateUser(prev?.username || "", form.username, form.password, form.name, "guru");
      }
    } else {
      const newGuru: GuruData = { ...form, id: Date.now().toString() };
      save([newGuru, ...guruList]);
      // Sync to auth
      if (form.username && form.password) {
        auth.addUser(form.username, form.password, form.name, "guru");
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus guru ini?")) {
      const g = guruList.find((g) => g.id === id);
      if (g?.username) auth.deleteUser(g.username);
      save(guruList.filter((g) => g.id !== id));
    }
  };

  const active = guruList.filter((g) => g.status === "aktif").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guru</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola data tenaga pengajar
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={openAdd}>
            <Plus className="size-4" />
            Tambah Guru
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, mata pelajaran, atau NIP..."
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
            <Users className="size-4 mx-auto text-primary" />
            <p className="mt-2 text-xl font-bold">{guruList.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </Card3D>
          <Card3D intensity={2} className="p-4 text-center obsidian-sheen">
            <Users className="size-4 mx-auto text-emerald-500" />
            <p className="mt-2 text-xl font-bold">{active}</p>
            <p className="text-[11px] text-muted-foreground">Aktif</p>
          </Card3D>
          <Card3D intensity={2} className="p-4 text-center obsidian-sheen">
            <BookOpen className="size-4 mx-auto text-amber-500" />
            <p className="mt-2 text-xl font-bold">{new Set(guruList.map((g) => g.subject)).size}</p>
            <p className="text-[11px] text-muted-foreground">Mapel</p>
          </Card3D>
        </div>

        {/* Guru list */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Daftar Guru
          </h2>
          <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Tidak ada guru yang cocok dengan pencarian.
                </div>
              ) : (
                filtered.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors"
                  >
                    {g.photo ? (
                      <img src={g.photo} alt={g.name} className="size-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                        {g.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{g.name}</p>
                        <Badge
                          variant={g.status === "aktif" ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {g.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {g.subject} · NIP: {g.nip}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="size-3" />{g.email}</span>
                        <span className="flex items-center gap-1"><Phone className="size-3" />{g.phone}</span>
                      </div>
                      {g.username && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          User: <span className="font-mono">{g.username}</span> · Pass: <span className="font-mono">{g.password}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(g)}>
                        <Edit className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(g.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Guru" : "Tambah Guru"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui data guru." : "Masukkan data guru baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap *</Label>
              <Input
                placeholder="Dr. Ahmad Sudirman, M.Pd"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">NIP</Label>
                <Input
                  placeholder="19850101..."
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Mata Pelajaran *</Label>
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAPPEL.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  placeholder="guru@sekolah.id"
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
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v: "aktif" | "nonaktif") => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Username</Label>
                <Input
                  placeholder="Masukkan username login"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <Input
                  placeholder="Masukkan password"
                  type="password"
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
                  category="guru"
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
            <Button size="sm" onClick={handleSave} disabled={!form.name || !form.subject}>
              <Save className="size-3.5" />
              {editingId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
