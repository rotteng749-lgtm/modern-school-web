import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════
   ABSENSI — Modern School Web
   ═══════════════════════════════════════════ */

const ABSENSI_DATA = [
  { name: "Ahmad Fauzi", class: "XII IPA 1", status: "hadir" as const },
  { name: "Siti Nurhaliza", class: "XII IPA 1", status: "hadir" as const },
  { name: "Budi Pratama", class: "XII IPA 2", status: "terlambat" as const },
  { name: "Dewi Sartika", class: "XII IPA 1", status: "hadir" as const },
  { name: "Eko Prasetyo", class: "XII IPS 1", status: "alpha" as const },
  { name: "Fitriani Putri", class: "XII IPA 2", status: "hadir" as const },
  { name: "Gilang Ramadhan", class: "XII IPS 1", status: "izin" as const },
  { name: "Hana Permata", class: "XII IPA 1", status: "hadir" as const },
];

const STATUS_STYLE = {
  hadir: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/12" },
  terlambat: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/12" },
  alpha: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/12" },
  izin: { icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-500/12" },
};

const STATUS_LABEL = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  alpha: "Alpha",
  izin: "Izin",
};

export default function Absensi() {
  const [selectedDate] = useState("28 Agustus 2026");

  const total = ABSENSI_DATA.length;
  const hadir = ABSENSI_DATA.filter((s) => s.status === "hadir").length;
  const terlambat = ABSENSI_DATA.filter((s) => s.status === "terlambat").length;
  const alpha = ABSENSI_DATA.filter((s) => s.status === "alpha").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Rekap kehadiran — {selectedDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Cari siswa berdasarkan nama atau kelas..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="size-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-4">
          {[
            { label: "Total", value: total, icon: Users, color: "text-foreground" },
            { label: "Hadir", value: hadir, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Terlambat", value: terlambat, icon: Clock, color: "text-amber-500" },
            { label: "Alpha", value: alpha, icon: XCircle, color: "text-red-500" },
          ].map((s) => (
            <Card3D key={s.label} intensity={2} className="p-4 text-center obsidian-sheen">
              <s.icon className={`size-4 mx-auto ${s.color}`} />
              <p className="mt-2 text-xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </Card3D>
          ))}
        </div>

        {/* Attendance list */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Daftar Kehadiran
          </h2>
          <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
            <div className="divide-y">
              {ABSENSI_DATA.map((siswa, i) => {
                const s = STATUS_STYLE[siswa.status];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {siswa.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{siswa.name}</p>
                      <p className="text-[11px] text-muted-foreground">{siswa.class}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] gap-1 ${s.color}`}>
                      <s.icon className="size-3" />
                      {STATUS_LABEL[siswa.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card3D>
        </div>
      </div>
    </DashboardShell>
  );
}
