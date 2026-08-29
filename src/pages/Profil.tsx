import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Building,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { YmhLogo } from "@/components/YmhLogo";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════
   PROFIL — Modern School Web
   ═══════════════════════════════════════════ */

const INFO_ITEMS = [
  { icon: Building, label: "Nama Yayasan", value: "Yayasan Mambaul Hasan" },
  { icon: MapPin, label: "Alamat", value: "Batur Gading, Probolinggo, Jawa Timur" },
  { icon: Phone, label: "Telepon", value: "(0343) xxx-xxxx" },
  { icon: Mail, label: "Email", value: "info@mambaulhasan.sch.id" },
  { icon: Globe, label: "Website", value: "www.mambaulhasan.sch.id", link: true },
];

const STATS = [
  { label: "Siswa", value: "1,247", icon: Users },
  { label: "Guru & Staff", value: "89", icon: GraduationCap },
  { label: "Kelas", value: "36", icon: Building },
];

export default function Profil() {
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
          <Button variant="outline" size="sm" className="rounded-full">
            <Edit className="size-3.5" />
            Edit
          </Button>
        </div>

        {/* Identity card */}
        <Card3D intensity={3} className="p-6 obsidian-sheen">
          <div className="flex items-center gap-4">
            <YmhLogo size={64} />
            <div>
              <h2 className="text-xl font-bold">Yayasan Mambaul Hasan</h2>
              <p className="text-sm text-muted-foreground">
                Batur Gading, Probolinggo · MD-MH / RA-MH / BTR
              </p>
            </div>
          </div>
        </Card3D>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3">
          {STATS.map((s) => (
            <Card3D key={s.label} intensity={2} className="p-4 text-center obsidian-sheen">
              <s.icon className="size-4 mx-auto text-primary" />
              <p className="mt-2 text-xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </Card3D>
          ))}
        </div>

        {/* Info list */}
        <Card3D intensity={2} className="obsidian-sheen">
          <div className="divide-y">
            {INFO_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    {item.label}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{item.value}</p>
                    {item.link && (
                      <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card3D>
      </div>
    </DashboardShell>
  );
}
