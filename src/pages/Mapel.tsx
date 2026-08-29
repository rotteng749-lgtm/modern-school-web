import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getSubjects,
  addSubject,
  removeSubject,
  renameSubject,
  initSubjects,
} from "@/lib/subjects-store";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   MAPEL — Mata Pelajaran Management
   ═══════════════════════════════════════════ */

export default function Mapel() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [addValue, setAddValue] = useState("");

  useEffect(() => {
    initSubjects();
    setSubjects(getSubjects());
  }, []);

  const handleAdd = () => {
    if (!addValue.trim()) return;
    if (addSubject(addValue.trim())) {
      setSubjects(getSubjects());
      setAddValue("");
      setAddDialog(false);
      toast.success("Mata pelajaran ditambahkan.");
    } else {
      toast.error("Nama sudah ada.");
    }
  };

  const handleDelete = (name: string) => {
    if (!confirm(`Hapus mata pelajaran "${name}"?`)) return;
    removeSubject(name);
    setSubjects(getSubjects());
    toast.success("Dihapus.");
  };

  const handleRename = () => {
    if (editIdx === null || !editName.trim()) return;
    if (renameSubject(subjects[editIdx], editName.trim())) {
      setSubjects(getSubjects());
      setEditIdx(null);
      toast.success("Berhasil diubah.");
    } else {
      toast.error("Nama sudah ada.");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mata Pelajaran</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola daftar mata pelajaran — {subjects.length} terdaftar
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={() => setAddDialog(true)}>
            <Plus className="size-4" />
            Tambah Mapel
          </Button>
        </div>

        <Card3D intensity={2} className="overflow-hidden obsidian-sheen">
          <div className="divide-y">
            {subjects.map((name, idx) => (
              <div key={name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors group">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {editIdx === idx ? (
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 text-sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        autoFocus
                      />
                      <Button size="icon-sm" variant="ghost" onClick={handleRename}>
                        <Save className="size-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditIdx(null)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{name}</p>
                  )}
                </div>
                {editIdx !== idx && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => { setEditIdx(idx); setEditName(name); }}
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(name)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card3D>
      </div>

      {/* Add dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
            <DialogDescription>Masukkan nama mata pelajaran baru.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-2">
            <Input
              placeholder="Contoh: Tahfidz Qur'an"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <Button onClick={handleAdd} disabled={!addValue.trim()}>Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
