import { useState, useEffect } from "react";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Building,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { YmhLogo } from "@/components/YmhLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   PROFIL — Editable institution profile
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-profil";

interface ProfilData {
  namaYayasan: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  totalSiswa: string;
  totalGuru: string;
  totalKelas: string;
}

const DEFAULT_DATA: ProfilData = {
  namaYayasan: "Yayasan Mambaul Hasan",
  alamat: "Batur Gading, Probolinggo, Jawa Timur",
  telepon: "(0343) xxx-xxxx",
  email: "info@mambaulhasan.sch.id",
  website: "www.mambaulhasan.sch.id",
  totalSiswa: "1,247",
  totalGuru: "89",
  totalKelas: "36",
};

const FIELD_CONFIG: { key: keyof ProfilData; label: string; icon: typeof Building }[] = [
  { key: "namaYayasan", label: "Nama Yayasan", icon: Building },
  { key: "alamat", label: "Alamat", icon: MapPin },
  { key: "telepon", label: "Telepon", icon: Phone },
  { key: "email", label: "Email", icon: Mail },
  { key: "website", label: "Website", icon: Globe },
];

const STAT_CONFIG: { key: keyof ProfilData; label: string; icon: typeof Users }[] = [
  { key: "totalSiswa", label: "Siswa", icon: Users },
  { key: "totalGuru", label: "Guru & Staff", icon: GraduationCap },
  { key: "totalKelas", label: "Kelas", icon: Building },
];

export default function Profil() {
  const [data, setData] = useState<ProfilData>(DEFAULT_DATA);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ProfilData>(DEFAULT_DATA);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(parsed);
        setEditData(parsed);
      }
    } catch {}
  }, []);

  const handleSave = () => {
    setData(editData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editData));
    setEditing(false);
    toast.success("Profil berhasil diperbarui.");
  };

  const handleCancel = () => {
    setEditData(data);
    setEditing(false);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profil Institusi</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Informasi dasar dan konfigurasi sekolah
            </p>
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={handleCancel}>
                <X className="size-3.5" />
                Batal
              </Button>
              <Button size="sm" className="rounded-full" onClick={handleSave}>
                <Save className="size-3.5" />
                Simpan
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditing(true)}>
              <Edit className="size-3.5" />
              Edit
            </Button>
          )}
        </div>

        {/* Identity card */}
        <Card3D intensity={3} className="p-6 obsidian-sheen">
          <div className="flex items-center gap-4">
            <YmhLogo size={64} />
            <div>
              <h2 className="text-xl font-bold">{data.namaYayasan}</h2>
              <p className="text-sm text-muted-foreground">
                {data.alamat}
              </p>
            </div>
          </div>
        </Card3D>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3">
          {STAT_CONFIG.map((s) => (
            <Card3D key={s.key} intensity={2} className="p-4 text-center obsidian-sheen">
              <s.icon className="size-4 mx-auto text-primary" />
              {editing ? (
                <input
                  className="mt-2 w-full text-center text-xl font-bold bg-transparent border-b border-dashed focus:outline-none"
                  value={editData[s.key]}
                  onChange={(e) => setEditData({ ...editData, [s.key]: e.target.value })}
                />
              ) : (
                <p className="mt-2 text-xl font-bold">{data[s.key]}</p>
              )}
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </Card3D>
          ))}
        </div>

        {/* Info list */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="divide-y">
            {FIELD_CONFIG.map((item) => (
              <div key={item.key} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    {item.label}
                  </p>
                  {editing ? (
                    <input
                      className="mt-0.5 w-full text-sm font-medium bg-transparent border-b border-dashed focus:outline-none"
                      value={editData[item.key]}
                      onChange={(e) => setEditData({ ...editData, [item.key]: e.target.value })}
                    />
                  ) : (
                    <p className="mt-0.5 text-sm font-medium truncate">{data[item.key]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card3D>
      </div>
    </DashboardShell>
  );
}
