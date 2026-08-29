import { useState, useEffect } from "react";
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
   MURID MANAGEMENT — Modern School Web
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
}

const STORAGE_KEY = "msw-murid";

const INITIAL_MURID: MuridData[] = [
  { id: "1", name: "Ahmad Fauzi", nisn: "0081234001", className: "XII IPA 1", gender: "Laki-laki", email: "ahmad.f@siswa.id", phone: "0812-1111-2222", parentName: "H. Fauzi", status: "aktif" },
  { id: "2", name: "Siti Nurhaliza", nisn: "0081234002", className: "XII IPA 1", gender: "Perempuan", email: "siti.n@siswa.id", phone: "0813-2222-3333", parentName: "H. Nurhaliza", status: "aktif" },
  { id: "3", name: "Budi Pratama", nisn: "0081234003", className: "XII IPA 2", gender: "Laki-laki", email: "budi.p@siswa.id", phone: "0821-3333-4444", parentName: "H. Pratama", status: "aktif" },
  { id: "4", name: "Dewi Sartika", nisn: "0081234004", className: "XII IPA 1", gender: "Perempuan", email: "dewi.s@siswa.id", phone: "0856-4444-5555", parentName: "H. Sartika", status: "aktif" },
  { id: "5", name: "Eko Prasetyo", nisn: "0081234005", className: "XII IPS 1", gender: "Laki-laki", email: "eko.p@siswa.id", phone: "0878-5555-6666", parentName: "H. Prasetyo", status: "keluar" },
  { id: "6", name: "Fitriani Putri", nisn: "0081234006", className: "XII IPA 2", gender: "Perempuan", email: "fitri.p@siswa.id", phone: "0857-6666-7777", parentName: "H. Putri", status: "aktif" },
];

const KELAS = ["X IPA 1", "X IPA 2", "X IPS 1", "X IPS 2", "XI IPA 1", "XI IPA 2", "XI IPS 1", "XI IPS 2", "XII IPA 1", "XII IPA 2", "XII IPS 1", "XII IPS 2"];

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setMuridList(JSON.parse(raw));
      } else {
        setMuridList(INITIAL_MURID);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MURID));
      }
    } catch {
      setMuridList(INITIAL_MURID);
    }
  }, []);

  const save = (list: MuridData[]) => {
    setMuridList(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = muridList.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.className.toLowerCase().includes(search.toLowerCase()) ||
      m.nisn.includes(search) ||
      m.parentName.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (m: MuridData) => {
    setEditingId(m.id);
    setForm({ name: m.name, nisn: m.nisn, className: m.className, gender: m.gender, email: m.email, phone: m.phone, parentName: m.parentName, status: m.status, photo: m.photo });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.className) return;

    if (editingId) {
      save(muridList.map((m) => (m.id === editingId ? { ...m, ...form } : m)));
    } else {
      const newMurid: MuridData = { ...form, id: Date.now().toString() };
      save([newMurid, ...muridList]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus murid ini?")) {
      save(muridList.filter((m) => m.id !== id));
    }
  };

  const active = muridList.filter((m) => m.status === "aktif").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Murid</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola data siswa
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={openAdd}>
            <Plus className="size-4" />
            Tambah Murid
          </Button>
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
                        <span className="flex items-center gap-1"><Mail className="size-3" />{m.email}</span>
                        <span className="flex items-center gap-1"><Phone className="size-3" />{m.phone}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Orang tua: {m.parentName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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
    </DashboardShell>
  );
}
