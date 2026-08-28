import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Tag,
  Upload,
  FileText,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════
   BANK SOAL — Modern School Web
   ═══════════════════════════════════════════ */

const KATEGORIES = [
  { name: "Matematika", count: 124, color: "bg-blue-500/12 text-blue-500" },
  { name: "Bahasa Indonesia", count: 98, color: "bg-primary/12 text-primary" },
  { name: "Fisika", count: 76, color: "bg-amber-500/12 text-amber-500" },
  { name: "Kimia", count: 65, color: "bg-emerald-500/12 text-emerald-500" },
  { name: "Biologi", count: 52, color: "bg-pink-500/12 text-pink-500" },
  { name: "Bahasa Inggris", count: 71, color: "bg-indigo-500/12 text-indigo-500" },
];

const RECENT_SOAL = [
  {
    id: 1,
    question: "Tentukan nilai x dari persamaan 2x² − 8x + 6 = 0",
    subject: "Matematika",
    type: "Pilihan Ganda",
    difficulty: "Sedang",
    created: "2 hari lalu",
  },
  {
    id: 2,
    question: "Analisis teks argumentasi berikut dan tentukan thesis statement-nya",
    subject: "B. Indonesia",
    type: "Uraian",
    difficulty: "Sulit",
    created: "3 hari lalu",
  },
  {
    id: 3,
    question: "Sebutkan 3 hukum Newton dan berikan contoh penerapannya",
    subject: "Fisika",
    type: "Uraian",
    difficulty: "Sedang",
    created: "5 hari lalu",
  },
];

const DIFF_STYLE: Record<string, string> = {
  Mudah: "bg-emerald-500/12 text-emerald-500",
  Sedang: "bg-amber-500/12 text-amber-500",
  Sulit: "bg-red-500/12 text-red-500",
};

export default function BankSoal() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bank Soal</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Koleksi soal terstruktur — 486 total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Upload className="size-3.5" />
              Import
            </Button>
            <Button size="sm" className="rounded-full">
              <Plus className="size-4" />
              Tambah Soal
            </Button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Cari soal berdasarkan kata kunci, mata pelajaran..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="size-4" />
          </Button>
        </div>

        {/* Category cards */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Per Kategori
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {KATEGORIES.map((cat) => (
              <Card3D key={cat.name} intensity={3} className="p-4 obsidian-sheen">
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 items-center justify-center rounded-lg ${cat.color}`}>
                    <Tag className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{cat.name}</p>
                    <p className="text-[11px] text-muted-foreground">{cat.count} soal</p>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>

        {/* Recent soal */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Soal Terbaru
          </h2>
          <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
            <div className="divide-y">
              {RECENT_SOAL.map((soal) => (
                <div
                  key={soal.id}
                  className="px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {soal.question}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">
                      {soal.subject}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {soal.type}
                    </Badge>
                    <Badge className={`text-[10px] ${DIFF_STYLE[soal.difficulty]}`}>
                      {soal.difficulty}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {soal.created}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card3D>
        </div>
      </div>
    </DashboardShell>
  );
}
