import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Palette,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   PENGATURAN (Settings) — School Config
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-settings";

interface SchoolSettings {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tagline: string;
  accentColor: string;
}

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: "Yayasan Mambaul Hasan",
  address: "Batur Gading, Probolinggo, Jawa Timur",
  phone: "+62 xxx xxxx xxxx",
  email: "admin@mambaulhasan.sch.id",
  website: "https://mambaulhasan.sch.id",
  tagline: "Platform digital terpusat untuk ujian CBT, absensi, dan pengelolaan data sekolah.",
  accentColor: "#0d9488",
};

function loadSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export default function Pengaturan() {
  const [form, setForm] = useState<SchoolSettings>(loadSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(loadSettings());
  }, []);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setTimeout(() => {
      setSaving(false);
      toast.success("Pengaturan berhasil disimpan.");
    }, 400);
  };

  const update = (key: keyof SchoolSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sections = [
    {
      title: "Identitas Sekolah",
      icon: School,
      fields: [
        { key: "schoolName" as const, label: "Nama Sekolah", placeholder: "Masukkan nama sekolah" },
        { key: "tagline" as const, label: "Tagline", placeholder: "Deskripsi singkat sekolah", type: "textarea" },
      ],
    },
    {
      title: "Kontak & Alamat",
      icon: MapPin,
      fields: [
        { key: "address" as const, label: "Alamat", placeholder: "Alamat lengkap sekolah", type: "textarea" },
        { key: "phone" as const, label: "Telepon", placeholder: "+62 xxx xxxx xxxx", icon: Phone },
        { key: "email" as const, label: "Email", placeholder: "admin@sekolah.sch.id", icon: Mail },
        { key: "website" as const, label: "Website", placeholder: "https://sekolah.sch.id", icon: Globe },
      ],
    },
    {
      title: "Tampilan",
      icon: Palette,
      fields: [
        { key: "accentColor" as const, label: "Warna Aksen", type: "color" },
      ],
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Konfigurasi
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Pengaturan
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            <Save className="size-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>

        {/* Settings Sections */}
        {sections.map((section) => (
          <Card3D key={section.title} intensity={2} className="obsidian-sheen">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <section.icon className="size-4.5" />
                </div>
                <h2 className="text-sm font-semibold">{section.title}</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.type === "textarea" ? "sm:col-span-2" : ""}
                  >
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {field.label}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        value={form[field.key]}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={(field as { placeholder?: string }).placeholder}
                        rows={3}
                        className="resize-none"
                      />
                    ) : field.type === "color" ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                          className="size-10 rounded-lg border border-border cursor-pointer"
                        />
                        <Input
                          value={form[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <Input
                        value={form[field.key]}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={(field as { placeholder?: string }).placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card3D>
        ))}

        {/* Preview */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold mb-4">Preview Informasi</h2>
            <Separator className="mb-4" />
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Nama: </span>
                <span className="font-medium">{form.schoolName || "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Tagline: </span>
                <span>{form.tagline || "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Alamat: </span>
                <span>{form.address || "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Telepon: </span>
                <span>{form.phone || "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email: </span>
                <span>{form.email || "—"}</span>
              </p>
            </div>
          </div>
        </Card3D>
      </div>
    </DashboardShell>
  );
}
