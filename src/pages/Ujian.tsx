import {
  ClipboardCheck,
  Clock,
  Calendar,
  Users,
  PlayCircle,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";

/* ═══════════════════════════════════════════
   UJIAN / CBT MODULE
   ═══════════════════════════════════════════ */

const UJIAN_LIST = [
  {
    id: 1,
    name: "Ujian Tengah Semester — Matematika XII",
    class: "XII IPA 1 & 2",
    date: "28 Agustus 2026",
    time: "08:00 – 10:00",
    participants: 64,
    total: 64,
    status: "active" as const,
  },
  {
    id: 2,
    name: "Try Out UTBK — Bahasa Indonesia",
    class: "XII IPS 1",
    date: "30 Agustus 2026",
    time: "09:00 – 11:30",
    participants: 0,
    total: 32,
    status: "upcoming" as const,
  },
  {
    id: 3,
    name: "Ulangan Harian — Fisika XI",
    class: "XI IPA 3",
    date: "25 Agustus 2026",
    time: "13:00 – 14:00",
    participants: 30,
    total: 30,
    status: "finished" as const,
  },
];

const STATUS_MAP = {
  active: { label: "Berlangsung", variant: "default" as const, color: "text-primary" },
  upcoming: { label: "Akan Datang", variant: "secondary" as const, color: "text-muted-foreground" },
  finished: { label: "Selesai", variant: "outline" as const, color: "text-emerald-500" },
};

export default function Ujian() {
  const hasUjian = UJIAN_LIST.length > 0;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ujian / CBT</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola ujian berbasis komputer
            </p>
          </div>
          <Button size="sm" className="rounded-full">
            <ClipboardCheck className="size-4" />
            Buat Ujian Baru
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3">
          {[
            { label: "Berlangsung", value: "1", icon: PlayCircle, color: "text-primary" },
            { label: "Akan Datang", value: "1", icon: Calendar, color: "text-muted-foreground" },
            { label: "Selesai", value: "1", icon: FileText, color: "text-emerald-500" },
          ].map((s) => (
            <Card3D key={s.label} intensity={2} className="p-4 text-center obsidian-sheen">
              <s.icon className={`size-4 mx-auto ${s.color}`} />
              <p className="mt-2 text-xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </Card3D>
          ))}
        </div>

        {/* Exam list */}
        {hasUjian ? (
          <div className="space-y-3">
            {UJIAN_LIST.map((ujian) => {
              const statusInfo = STATUS_MAP[ujian.status];
              const progress = ujian.total > 0 ? (ujian.participants / ujian.total) * 100 : 0;

              return (
                <Card3D key={ujian.id} intensity={3} className="p-5 obsidian-sheen">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm truncate">{ujian.name}</h3>
                        <Badge variant={statusInfo.variant} className="text-[10px]">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{ujian.class}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {ujian.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {ujian.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {ujian.participants}/{ujian.total}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full sm:w-32">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground text-right">
                        {Math.round(progress)}%
                      </p>
                    </div>

                    <Button variant="ghost" size="icon-sm" className="shrink-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </Card3D>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardCheck className="size-6" />}
            title="Belum ada ujian"
            description="Buat ujian baru untuk memulai CBT dengan siswa."
            action={<Button size="sm">Buat Ujian</Button>}
          />
        )}
      </div>
    </DashboardShell>
  );
}
