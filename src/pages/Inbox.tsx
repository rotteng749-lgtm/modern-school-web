import { useState, useEffect } from "react";
import {
  Inbox,
  Mail,
  MailOpen,
  Trash2,
  User,
  Clock,
  MessageSquare,
  Search,
  Filter,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   INBOX — Contact Message Management
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "msw-inbox";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: "1",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "08123456789",
    subject: "Pertanyaan PPDB",
    message: "Selamat pagi, saya ingin menanyakan jadwal pendaftaran siswa baru untuk tahun ajaran 2026/2027 di Yayasan Mambaul Hasan. Kapan pendaftaran dibuka?",
    isRead: false,
    createdAt: "2026-08-25",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti@example.com",
    phone: "",
    subject: "Kerja Sama",
    message: "Kami dari lembaga pendidikan ingin menjajaki kerja sama program pertukaran pelajar dengan Yayasan Mambaul Hasan.",
    isRead: false,
    createdAt: "2026-08-23",
  },
  {
    id: "3",
    name: "Ahmad Rizky",
    email: "ahmad@example.com",
    phone: "08567890123",
    subject: "Info Ujian",
    message: "Apakah ada jadwal ujian susulan untuk siswa yang sakit saat ujian tengah semester?",
    isRead: true,
    createdAt: "2026-08-20",
  },
];

function loadMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_MESSAGES;
}

function saveMessages(msgs: ContactMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

export default function InboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(loadMessages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.isRead) return false;
    if (filter === "read" && !m.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const markRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Yakin ingin menghapus pesan ini?")) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
    toast.success("Pesan berhasil dihapus.");
  };

  const openMessage = (msg: ContactMessage) => {
    markRead(msg.id);
    setSelectedMsg(msg);
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pesan Masuk
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Inbox</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari pesan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Pesan", value: messages.length.toString(), icon: MessageSquare },
            { label: "Belum Dibaca", value: unreadCount.toString(), icon: Mail },
            { label: "Sudah Dibaca", value: (messages.length - unreadCount).toString(), icon: MailOpen },
          ].map((s) => (
            <Card3D key={s.label} intensity={3} className="p-4 obsidian-sheen">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="size-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "Semua" : f === "unread" ? "Belum Dibaca" : "Sudah Dibaca"}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card3D intensity={2} className="obsidian-sheen">
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada pesan ditemukan.</p>
              </div>
            </Card3D>
          )}
          {filtered.map((msg) => (
            <Card3D
              key={msg.id}
              intensity={2}
              className={`obsidian-sheen cursor-pointer transition-colors hover:bg-accent/30 ${
                !msg.isRead ? "border-l-2 border-l-primary" : ""
              }`}
              onClick={() => openMessage(msg)}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{msg.name}</span>
                      {!msg.isRead && (
                        <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary">
                          Baru
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" />
                        {msg.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {msg.createdAt}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg.id);
                    }}
                    className="shrink-0"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMsg?.subject || "Detail Pesan"}</DialogTitle>
          </DialogHeader>
          {selectedMsg && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-bold">
                  {selectedMsg.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedMsg.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMsg.email}</p>
                  {selectedMsg.phone && (
                    <p className="text-xs text-muted-foreground">{selectedMsg.phone}</p>
                  )}
                </div>
              </div>
              <div className="text-sm leading-relaxed">{selectedMsg.message}</div>
              <p className="text-[11px] text-muted-foreground">
                Dikirim pada {selectedMsg.createdAt}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedMsg(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
