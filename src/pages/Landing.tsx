import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  Shield,
  BarChart3,
  Users,
  ClipboardCheck,
  BookOpen,
  Terminal,
  Lock,
  Activity,
  Send,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card3D } from "@/components/Card3D";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   LANDING — Modern School Web
   Premium, serious, technical, minimal
   ═══════════════════════════════════════════ */

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "CBT & Ujian",
    desc: "Ujian berbasis komputer — terjadwal, terukur, dan terintegrasi penuh.",
  },
  {
    icon: Users,
    title: "Absensi",
    desc: "Rekap kehadiran real-time untuk siswa dan tenaga pengajar.",
  },
  {
    icon: BookOpen,
    title: "Bank Soal",
    desc: "Pengelolaan soal terstruktur — import, ekspor, dan kategorisasi otomatis.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analitik",
    desc: "Visualisasi data kinerja kelas dan individu dalam satu panel.",
  },
];

const CAPABILITIES = [
  { icon: Terminal, text: "API-ready architecture" },
  { icon: Lock, text: "Autentikasi berlapis" },
  { icon: Activity, text: "Monitoring real-time" },
  { icon: Shield, text: "Audit trail lengkap" },
];

/* ── Contact Form Component ── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Nama, email, dan pesan wajib diisi.");
      return;
    }
    setSending(true);
    // Store to localStorage inbox
    const inbox = JSON.parse(localStorage.getItem("msw-inbox") || "[]");
    inbox.unshift({
      id: Date.now().toString(),
      ...form,
      isRead: false,
      createdAt: new Date().toISOString().split("T")[0],
    });
    localStorage.setItem("msw-inbox", JSON.stringify(inbox));
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success("Pesan berhasil terkirim! Kami akan segera merespons.");
    }, 500);
  };

  return (
    <Card3D intensity={2} className="obsidian-sheen p-6 sm:p-7">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="size-4.5 text-primary" />
        <h3 className="text-sm font-semibold">Kirim Pesan</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Nama *</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap" />
          </div>
          <div>
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@contoh.com" />
          </div>
          <div>
            <Label className="text-xs">Telepon</Label>
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="08xx xxxx xxxx" />
          </div>
          <div>
            <Label className="text-xs">Subjek</Label>
            <Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Perihal pesan" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Pesan *</Label>
          <Textarea
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Tuliskan pesan Anda di sini..."
            rows={4}
          />
        </div>
        <Button type="submit" disabled={sending} className="rounded-full w-full sm:w-auto">
          <Send className="size-4" />
          {sending ? "Mengirim..." : "Kirim Pesan"}
        </Button>
      </form>
    </Card3D>
  );
}

export default function Landing() {
  const { user } = useLocalAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MSW</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            <a href="#fitur" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
            <a href="#kontak" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Kontak</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="rounded-full px-4">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Dashboard" : "Masuk"}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={mounted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Terminal className="size-3 text-primary" />
              School Management System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Modern School
              <br />
              <span className="text-muted-foreground">Web</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
              Platform terpusat untuk ujian CBT, absensi digital, dan pengelolaan
              data sekolah. Dibangun untuk performa dan keandalan.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full px-7 text-sm font-semibold shadow-lg shadow-primary/20"
              >
                <Link to="/auth">
                  Mulai
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-7 text-sm font-semibold"
              >
                <a href="#fitur">Lihat Fitur</a>
              </Button>
            </div>

            {/* Capability chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {CAPABILITIES.map((c) => (
                <span
                  key={c.text}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground"
                >
                  <c.icon className="size-3" />
                  {c.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fitur" className="border-t bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Modul Inti
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Setiap modul dirancang untuk alur kerja yang cepat dan terukur.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card3D className="p-6 sm:p-7 h-full obsidian-sheen">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Siap Digunakan
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Masuk untuk mulai mengelola ujian, absensi, dan data sekolah.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              <Link to="/auth">
                Masuk
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="kontak" className="border-t bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Hubungi Kami</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Pertanyaan, masukan, atau kerja sama — kami siap membantu.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-5">
              {[
                { icon: MapPin, label: "Alamat", value: "Jl. Pendidikan No. 123, Jakarta Selatan" },
                { icon: Phone, label: "Telepon", value: "+62 21 5555 0123" },
                { icon: Mail, label: "Email", value: "admin@msw.sch.id" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <c.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</p>
                    <p className="text-sm font-medium mt-0.5">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            <span className="font-medium">Modern School Web</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p>CBT · Absensi · Bank Soal · Analitik</p>
        </div>
      </footer>

      {/* ── CHATBOT ── */}
      <ChatbotWidget />
    </div>
  );
}
