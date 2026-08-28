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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card3D } from "@/components/Card3D";
import { useLocalAuth } from "@/hooks/use-local-auth";

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
    </div>
  );
}
