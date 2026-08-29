import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   CHATBOT WIDGET — FAQ-based AI assistant
   Inspired by digitalweb.site chatbot
   ═══════════════════════════════════════════ */

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
}

const FAQ_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["jadwal", "ujian", "uas", "us", "try out", "utbk"],
    reply: "Jadwal ujian terbaru bisa dilihat di menu Ujian/CBT setelah login. Untuk pertanyaan lebih lanjut, hubungi bagian akademik.",
  },
  {
    keywords: ["absensi", "hadir", "alpha", "izin", "sakit"],
    reply: "Sistem absensi digital kami mencatat kehadiran secara otomatis. Guru dan siswa bisa melihat rekap absensi di menu Absensi.",
  },
  {
    keywords: ["guru", "dosen", "pengajar", "kelas"],
    reply: "Daftar guru dan pengajar tersedia di menu Guru. Setiap guru memiliki profil lengkap termasuk mata pelajaran yang diampu.",
  },
  {
    keywords: ["nilai", "rapor", "penilaian", "hasil"],
    reply: "Nilai dan rapor bisa diakses melalui dashboard siswa. Rapor semester akan tersedia setelah semua ujian selesai dinilai.",
  },
  {
    keywords: ["soal", "bank soal", "latihan", "tryout"],
    reply: "Bank soal tersedia dengan ratusan soal terstruktur. Guru bisa mengimport soal baru, dan siswa bisa berlatih lewat modul CBT.",
  },
  {
    keywords: ["ppdb", "pendaftaran", "daftar", "siswa baru"],
    reply: "Pendaftaran siswa baru (PPDB) bisa dilakukan secara online. Silakan hubungi admisi sekolah untuk informasi lebih lanjut.",
  },
  {
    keywords: ["kontak", "hubungi", "telepon", "email", "wa", "whatsapp"],
    reply: "Anda bisa menghubungi kami melalui form Kontak di bawah, atau langsung via telepon dan email yang tertera di halaman ini.",
  },
  {
    keywords: ["harga", "biaya", "paket", "bayar"],
    reply: "Untuk informasi biaya pendidikan dan SPP, silakan hubungi bagian keuangan sekolah. Informasi lengkap tersedia di halaman profil.",
  },
  {
    keywords: ["halo", "hai", "hello", "selamat", "pagi", "siang", "sore", "malam"],
    reply: "Halo! Selamat datang di Modern School Web. Saya asisten virtual yang siap membantu pertanyaan seputar sekolah. Ada yang bisa saya bantu?",
  },
  {
    keywords: ["terima kasih", "makasih", "thanks"],
    reply: "Sama-sama! Senang bisa membantu. Jangan ragu untuk bertanya lagi jika ada yang diperlukan.",
  },
];

function getReply(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQ_REPLIES) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.reply;
    }
  }
  return "Terima kasih atas pertanyaannya. Untuk informasi lebih detail, silakan hubungi sekolah langsung melalui form Kontak atau datang ke bagian administrasi.";
}

function getNow(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Halo! Saya asisten virtual Modern School Web. Ada yang bisa saya bantu? Tanyakan tentang jadwal ujian, absensi, bank soal, atau informasi sekolah lainnya.",
      time: getNow(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { sender: "user", text, time: getNow() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const reply = getReply(text);
      setMessages((prev) => [...prev, { sender: "bot", text: reply, time: getNow() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-5 right-5 z-50 size-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200",
          "bg-primary text-primary-foreground hover:scale-110",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Tutup chat" : "Buka chat"}
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-22 right-5 z-50 w-[350px] max-w-[calc(100vw-2.5rem)] rounded-2xl border bg-background shadow-2xl overflow-hidden flex flex-col" style={{ height: "min(480px, calc(100vh - 120px))" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary/5">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Bot className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Asisten MSW</p>
              <p className="text-[11px] text-muted-foreground">Online — Siap membantu</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2 max-w-[85%]",
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    msg.sender === "user"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {msg.sender === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                </div>
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  {msg.text}
                  <p className="text-[10px] opacity-60 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px]">
                  <Bot className="size-3.5" />
                </div>
                <div className="rounded-xl px-3 py-2 bg-muted rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={!input.trim() || isTyping}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
