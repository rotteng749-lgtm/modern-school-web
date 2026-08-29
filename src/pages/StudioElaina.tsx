import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import {
  Sparkles,
  RotateCcw,
  Star,
  Wand2,
  Copy,
  Check,
  Layers,
  KeyRound,
  User,
  QrCode,
  Users,
  GraduationCap,
  Palette,
  Search,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ElainaCharacter } from "@/components/ElainaCharacter";
import {
  ParallaxCard,
  ParallaxLayer,
} from "@/components/ParallaxCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ═══════════════════════════════════════════
   STUDIO ELAINA — 3D Anime Character Card
   Now pulls real student/guru data from localStorage
   ═══════════════════════════════════════════ */

const GRADIENT_PRESETS = [
  { name: "Elaina Classic", from: "#c084fc", via: "#a78bfa", to: "#818cf8" },
  { name: "Rose Moon", from: "#f472b6", via: "#e879f9", to: "#c084fc" },
  { name: "Ocean Star", from: "#67e8f9", via: "#a78bfa", to: "#c084fc" },
  { name: "Golden Hour", from: "#fbbf24", via: "#f472b6", to: "#c084fc" },
  { name: "Forest Mist", from: "#6ee7b7", via: "#a78bfa", to: "#818cf8" },
  { name: "Night Sky", from: "#6366f1", via: "#8b5cf6", to: "#a78bfa" },
  { name: "Cherry Blossom", from: "#fda4af", via: "#f9a8d4", to: "#c084fc" },
  { name: "Twilight", from: "#c084fc", via: "#6366f1", to: "#312e81" },
];

const BADGE_OPTIONS = ["Siswa", "Guru", "Admin", "Ketua Kelas", "OSIS", "Perpustakaan", "Lab", "Witch", "Custom"];

/* Types matching the Murid and Guru data */
interface MuridItem {
  id: string;
  name: string;
  nisn: string;
  className: string;
  gender: string;
  photo?: string;
  username?: string;
  password?: string;
}

interface GuruItem {
  id: string;
  name: string;
  nip: string;
  subject: string;
  photo?: string;
}

interface ProfileCardData {
  name: string;
  role: string;
  subtitle: string;
  gradientIndex: number;
  showStars: boolean;
  showSparkles: boolean;
  showCharacter: boolean;
  showQR: boolean;
  showCredentials: boolean;
  tiltIntensity: number;
  username: string;
  password: string;
}

const DEFAULT_CARD: ProfileCardData = {
  name: "Elaina Flonesia",
  role: "Siswa",
  subtitle: "XII IPA 1 · NISN 0081234001",
  gradientIndex: 0,
  showStars: true,
  showSparkles: true,
  showCharacter: true,
  showQR: true,
  showCredentials: true,
  tiltIntensity: 15,
  username: "elaina001",
  password: "Elaina@2026",
};

/* Sparkle particles */
function SparkleParticles({ count = 15 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/80"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `sparkle ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* Star decoration */
function StarDecoration({ count = 8 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    top: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 4}s`,
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {stars.map((s) => (
        <Star
          key={s.id}
          className="absolute text-white/20 fill-white/10"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            transform: `rotate(${s.rotation}deg)`,
            animation: `sparkle 3s ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* QR Code component */
function QRCodeDisplay({ value, size = 120 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: "#ffffff", light: "rgba(0,0,0,0)" },
        errorCorrectionLevel: "M",
      }).catch(() => {});
    }
  }, [value, size]);

  return (
    <div className="inline-flex items-center justify-center rounded-xl p-2"
      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
}

export default function StudioElaina() {
  const [card, setCard] = useState<ProfileCardData>(DEFAULT_CARD);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  /* ── Real data from localStorage ── */
  const [muridList, setMuridList] = useState<MuridItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [dataSource, setDataSource] = useState<"manual" | "siswa" | "guru">("manual");
  const [selectedId, setSelectedId] = useState<string>("");
  const [personSearch, setPersonSearch] = useState("");

  useEffect(() => {
    try {
      const m = localStorage.getItem("msw-murid");
      if (m) setMuridList(JSON.parse(m));
    } catch { /* ignore */ }
    try {
      const g = localStorage.getItem("msw-guru");
      if (g) setGuruList(JSON.parse(g));
    } catch { /* ignore */ }
  }, []);

  const gradient = GRADIENT_PRESETS[card.gradientIndex];
  const resetCard = () => { setCard(DEFAULT_CARD); setDataSource("manual"); setSelectedId(""); };

  /* Auto-fill from selected person */
  const selectPerson = (type: "siswa" | "guru", id: string) => {
    setDataSource(type);
    setSelectedId(id);

    if (type === "siswa") {
      const s = muridList.find((m) => m.id === id);
      if (s) {
        setCard({
          ...card,
          name: s.name,
          role: "Siswa",
          subtitle: `${s.className} · NISN ${s.nisn}`,
          username: s.username || "",
          password: s.password || "",
          showQR: !!(s.username && s.password),
          showCredentials: !!(s.username && s.password),
        });
      }
    } else {
      const g = guruList.find((gr) => gr.id === id);
      if (g) {
        setCard({
          ...card,
          name: g.name,
          role: "Guru",
          subtitle: g.subject,
          username: g.nip || "",
          password: "",
          showQR: false,
          showCredentials: false,
        });
      }
    }
  };

  const filteredSiswa = muridList.filter(
    (s) =>
      s.name.toLowerCase().includes(personSearch.toLowerCase()) ||
      s.className.toLowerCase().includes(personSearch.toLowerCase()) ||
      s.nisn.includes(personSearch)
  );

  const filteredGuru = guruList.filter(
    (g) =>
      g.name.toLowerCase().includes(personSearch.toLowerCase()) ||
      g.subject.toLowerCase().includes(personSearch.toLowerCase())
  );

  const handleCopyCSS = () => {
    const css = `.card-elaina {\n  background: linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to});\n  border-radius: 1.5rem;\n  padding: 2rem;\n  color: white;\n  position: relative;\n  overflow: hidden;\n  box-shadow: 0 20px 60px -12px ${gradient.from}66;\n  perspective: 1000px;\n}`;
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const qrValue = card.username
    ? `https://school.app/login?u=${encodeURIComponent(card.username)}`
    : "https://school.app";

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Studio Elaina</h1>
              <Sparkles className="size-5 text-primary" />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Buat kartu profil 3D bergaya anime — gerakkan mouse ke kartu untuk efek paralaks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={handleCopyCSS}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Tersalin!" : "Copy CSS"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={resetCard}>
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── CONTROLS ── */}
          <div className="space-y-4">
            {/* ── PERSON SELECTOR ── */}
            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Search className="size-4 text-primary" />
                Pilih dari Database
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                Pilih siswa atau guru dari database untuk auto-fill kartu
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 text-sm"
                    placeholder="Cari nama, kelas, NIP..."
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                  />
                </div>

                {/* Siswa list */}
                {filteredSiswa.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <GraduationCap className="size-3" /> Siswa ({filteredSiswa.length})
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-1.5">
                      {filteredSiswa.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => selectPerson("siswa", s.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left text-xs transition-colors ${
                            selectedId === s.id && dataSource === "siswa"
                              ? "bg-primary/15 text-primary"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                            {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-[9px] text-muted-foreground">{s.className} · {s.nisn}</p>
                          </div>
                          {s.username && <KeyRound className="size-3 text-muted-foreground shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guru list */}
                {filteredGuru.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Users className="size-3" /> Guru ({filteredGuru.length})
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-1.5">
                      {filteredGuru.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => selectPerson("guru", g.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left text-xs transition-colors ${
                            selectedId === g.id && dataSource === "guru"
                              ? "bg-primary/15 text-primary"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-500">
                            {g.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{g.name}</p>
                            <p className="text-[9px] text-muted-foreground">{g.subject}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredSiswa.length === 0 && filteredGuru.length === 0 && personSearch && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Tidak ada data yang cocok.
                  </p>
                )}
                {muridList.length === 0 && guruList.length === 0 && !personSearch && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Belum ada data di database. Tambah siswa/guru terlebih dahulu.
                  </p>
                )}
              </div>
            </Card3D>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Wand2 className="size-4 text-primary" />
                Info Kartu
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama</Label>
                  <Input
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="Nama di kartu"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Badge</Label>
                    <Select
                      value={card.role}
                      onValueChange={(v) => setCard({ ...card, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_OPTIONS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subtitle</Label>
                    <Input
                      value={card.subtitle}
                      onChange={(e) => setCard({ ...card, subtitle: e.target.value })}
                      placeholder="XII IPA 1 · NISN..."
                    />
                  </div>
                </div>
              </div>
            </Card3D>

            {/* ── CREDENTIALS ── */}
            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                Akun Siswa
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Tampilkan di Kartu</Label>
                  <Button
                    variant={card.showCredentials ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCard({ ...card, showCredentials: !card.showCredentials })}
                  >
                    {card.showCredentials ? "Aktif" : "Mati"}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      value={card.username}
                      onChange={(e) => setCard({ ...card, username: e.target.value })}
                      placeholder="username_siswa"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      type="text"
                      value={card.password}
                      onChange={(e) => setCard({ ...card, password: e.target.value })}
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>
            </Card3D>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                Gradient
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((g, i) => (
                  <button
                    key={g.name}
                    onClick={() => setCard({ ...card, gradientIndex: i })}
                    className={`relative h-10 rounded-lg transition-all ${
                      card.gradientIndex === i
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                        : "hover:scale-105"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.via}, ${g.to})` }}
                    title={g.name}
                  >
                    {card.gradientIndex === i && (
                      <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </Card3D>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="size-4 text-primary" />
                Efek & 3D
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Sparkle Partikel</Label>
                  <Button
                    variant={card.showSparkles ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCard({ ...card, showSparkles: !card.showSparkles })}
                  >
                    {card.showSparkles ? "Aktif" : "Mati"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Dekorasi Bintang</Label>
                  <Button
                    variant={card.showStars ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCard({ ...card, showStars: !card.showStars })}
                  >
                    {card.showStars ? "Aktif" : "Mati"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Karakter</Label>
                  <Button
                    variant={card.showCharacter ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCard({ ...card, showCharacter: !card.showCharacter })}
                  >
                    {card.showCharacter ? "Aktif" : "Mati"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-1"><QrCode className="size-3" /> QR Code</Label>
                  <Button
                    variant={card.showQR ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCard({ ...card, showQR: !card.showQR })}
                  >
                    {card.showQR ? "Aktif" : "Mati"}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Intensitas 3D: {card.tiltIntensity}°</Label>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={card.tiltIntensity}
                    onChange={(e) => setCard({ ...card, tiltIntensity: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </Card3D>

            {/* Layer info */}
            <Card3D intensity={1} className="p-4 obsidian-sheen">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="size-3.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Lapisan 3D</p>
              </div>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <p>Layer 0 — Gradient background (paling jauh)</p>
                <p>Layer 1 — Bintang & sparkle</p>
                <p>Layer 2 — Karakter Elaina</p>
                <p>Layer 3 — Teks, badge, QR & kredensial (paling dekat)</p>
              </div>
            </Card3D>
          </div>

          {/* ── PREVIEW ── */}
          <div className="flex flex-col items-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 self-start">
              Preview — Gerakkan mouse ke kartu
            </h3>

            <ParallaxCard
              intensity={card.tiltIntensity}
              className="w-full max-w-sm"
            >
              <div
                ref={previewRef}
                className="relative w-full rounded-2xl overflow-hidden text-white shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
                  boxShadow: `0 20px 60px -12px ${gradient.from}66, 0 0 0 1px ${gradient.from}22`,
                  aspectRatio: card.showQR || card.showCredentials ? "3/4.5" : "3/4",
                }}
              >
                {/* LAYER 0: Background gradient + texture */}
                <ParallaxLayer depth={-0.5}>
                  <div className="absolute inset-0" aria-hidden="true">
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2), transparent 60%)`,
                      }}
                    />
                  </div>
                </ParallaxLayer>

                {/* LAYER 1: Stars & sparkles */}
                <ParallaxLayer depth={-0.2}>
                  {card.showStars && <StarDecoration count={10} />}
                  {card.showSparkles && <SparkleParticles count={20} />}
                </ParallaxLayer>

                {/* LAYER 2: Character */}
                {card.showCharacter && (
                  <ParallaxLayer depth={0.3}>
                    <div className="absolute inset-0 flex items-end justify-center">
                      <ElainaCharacter className="w-[75%] h-auto drop-shadow-2xl" />
                    </div>
                  </ParallaxLayer>
                )}

                {/* LAYER 3: UI overlay (name, badge, QR, credentials) */}
                <ParallaxLayer depth={0.8}>
                  {/* Top: Name & badge */}
                  <div className="absolute inset-x-0 top-0 p-6 z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-14 items-center justify-center rounded-2xl text-xl font-bold shadow-lg"
                        style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                      >
                        {card.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xl font-bold tracking-tight drop-shadow-sm">
                          {card.name}
                        </p>
                        <span
                          className="inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-medium"
                          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
                        >
                          {card.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: QR + Credentials */}
                  <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                    <div className="h-px bg-white/20 mb-3" />

                    {card.showQR && card.username && (
                      <div className="flex justify-center mb-3">
                        <QRCodeDisplay value={qrValue} size={100} />
                      </div>
                    )}

                    {card.showCredentials && (
                      <div
                        className="rounded-xl p-3 mb-3"
                        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-2 uppercase tracking-wider font-medium">
                          <KeyRound className="size-2.5" />
                          Akun Login
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <User className="size-3 text-white/50" />
                            <span className="text-sm font-mono font-medium tracking-wide">{card.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <KeyRound className="size-3 text-white/50" />
                            <span className="text-sm font-mono font-medium tracking-wide">{card.password}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-white/80 drop-shadow-sm">{card.subtitle}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Star className="size-3 fill-current" />
                        Yayasan Mambaul Hasan
                      </span>
                      <span>·</span>
                      <span>3D Card</span>
                    </div>
                  </div>
                </ParallaxLayer>

                {/* Decorative corner glow */}
                <div
                  className="absolute -bottom-12 -right-12 size-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle, white, transparent)" }}
                  aria-hidden="true"
                />
              </div>
            </ParallaxCard>

            {/* CSS Output */}
            <Card3D intensity={1} className="w-full max-w-sm mt-6 p-4 obsidian-sheen">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">CSS Output</p>
                <Button variant="ghost" size="sm" onClick={handleCopyCSS}>
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
              <pre className="text-[11px] text-muted-foreground leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`.card-elaina {
  background: linear-gradient(
    135deg,
    ${gradient.from},
    ${gradient.via},
    ${gradient.to}
  );
  border-radius: 1.5rem;
  color: white;
  perspective: 1000px;
  box-shadow: 0 20px 60px -12px ${gradient.from}66;
}`}
              </pre>
            </Card3D>
          </div>
        </div>
      </div>

      {/* Sparkle animation */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </DashboardShell>
  );
}
