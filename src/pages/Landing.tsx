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
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/use-auth";

/* ═══════════════════════════════════════════
   LANDING PAGE — Scholaris
   Anime light / Obsidian dark, CTA → /auth
   ═══════════════════════════════════════════ */

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "CBT & Ujian Online",
    desc: "Ujian berbasis komputer yang aman, cepat, dan anti kecurangan.",
  },
  {
    icon: Users,
    title: "Absensi Digital",
    desc: "Catat kehadiran siswa dan guru secara real-time.",
  },
  {
    icon: BookOpen,
    title: "Bank Soal",
    desc: "Kelola ribuan soal dengan mudah — import, export, kategori.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analitik",
    desc: "Visualisasi performa siswa dan kelas dalam satu tampilan.",
  },
];

const STATS = [
  { value: "50+", label: "Sekolah Aktif" },
  { value: "12K+", label: "Siswa Terdaftar" },
  { value: "100K+", label: "Ujian Tercatat" },
  { value: "99.9%", label: "Uptime Server" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
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
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Scholaris</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="rounded-full px-4">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Dashboard" : "Masuk"}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-20 right-0 h-[300px] w-[300px] rounded-full bg-accent/6 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={mounted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Star className="size-3 text-primary" />
              Sistem Manajemen Sekolah Modern
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Kelola Sekolah
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Lebih Cerdas
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Platform terpadu untuk ujian CBT, absensi digital, bank soal, dan
              analitik — dirancang untuk sekolah &amp; pesantren Indonesia.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7 text-sm font-semibold shadow-lg shadow-primary/20">
                <Link to="/auth">
                  Mulai Sekarang
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7 text-sm font-semibold">
                <a href="#fitur">
                  Lihat Fitur
                  <ChevronRight className="size-4" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={mounted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
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
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Shield className="size-3 text-primary" />
              Fitur Utama
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Semua yang Dibutuhkan Sekolah
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Satu platform, semua kebutuhan administrasi &amp; akademik terpenuhi.
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
              Siap Memulai?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Daftar sekarang dan kelola sekolah dengan lebih efisien.
            </p>
            <Button asChild size="lg" className="mt-7 rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20">
              <Link to="/auth">
                Masuk / Daftar
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
            <span className="font-medium">Scholaris</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p>Sistem Manajemen Sekolah — CBT, Absensi, Bank Soal</p>
        </div>
      </footer>
    </div>
  );
}
