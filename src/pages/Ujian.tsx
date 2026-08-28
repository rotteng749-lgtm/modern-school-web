import {
  ClipboardCheck,
  Clock,
  Calendar,
  Users,
  PlayCircle,
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Filter,
  Upload,
} from "lucide-react";
import { Link } from "react-router";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════
   UJIAN / CBT — Modern School Web
   ═══════════════════════════════════════════ */

const UJIAN_LIST = [
  {
    id: 1,
    name: "UTB — Matematika XII IPA",
    class: "XII IPA 1 & 2",
    date: "28 Agustus 2026",
    time: "08:00 – 10:00",
    participants: 64,
    total: 64,
    questions: 40,
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
    questions: 50,
    status: "upcoming" as const,
  },
  {
    id: 3,
    name: "UH Fisika XI",
    class: "XI IPA 3",
    date: "25 Agustus 2026",
    time: "13:00 – 14:00",
    participants: 30,
    total: 30,
    questions: 25,
    status: "finished" as const,
  },
];

const STATUS_MAP = {
  active: { label: "Berlangsung", variant: "default" as const },
  upcoming: { label: "Mendatang", variant: "secondary" as const },
  finished: { label: "Selesai", variant: "outline" as const },
};

export default function Ujian() {
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Upload className="size-3.5" />
              Import Soal
            </Button>
            <Button size="sm" className="rounded-full">
              <Plus className="size-4" />
              Buat Ujian
            </Button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Cari ujian berdasarkan nama, kelas, atau tanggal..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="size-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3">
          {[
            { label: "Berlangsung", value: "1", icon: PlayCircle, color: "text-primary" },
            { label: "Mendatang", value: "1", icon: Calendar, color: "text-muted-foreground" },
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
        <div className="space-y-3">
          {UJIAN_LIST.map((ujian) => {
            const statusInfo = STATUS_MAP[ujian.status];
            const progress = ujian.total > 0 ? (ujian.participants / ujian.total) * 100 : 0;

            return (
              <Link key={ujian.id} to={`/ujian/${ujian.id}`}>
                <Card3D intensity={3} className="group p-5 obsidian-sheen">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {ujian.name}
                        </h3>
                        <Badge variant={statusInfo.variant} className="text-[10px]">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{ujian.class}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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
                        <span className="flex items-center gap-1">
                          <FileText className="size-3" />
                          {ujian.questions} soal
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full sm:w-32 shrink-0">
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

                    <MoreHorizontal className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
                  </div>
                </Card3D>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
