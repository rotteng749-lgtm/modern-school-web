import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  Palette,
  RotateCcw,
  Star,
  Wand2,
  Copy,
  Check,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ═══════════════════════════════════════════
   STUDIO ELAINA — Anime-inspired 3D Card Builder
   Inspired by "Wandering Witch: The Journey of Elaina"
   Soft pastels, sparkles, gradients, 3D tilt
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

const BADGE_OPTIONS = ["Siswa", "Guru", "Admin", "Ketua Kelas", "OSIS", "Perpustakaan", "Lab", "Custom"];

interface ProfileCardData {
  name: string;
  role: string;
  subtitle: string;
  gradientIndex: number;
  customBadge: string;
  showStars: boolean;
  showSparkles: boolean;
  tiltIntensity: number;
}

const DEFAULT_CARD: ProfileCardData = {
  name: "Elaina Flonesia",
  role: "Siswa",
  subtitle: "XII IPA 1 · NISN 0081234001",
  gradientIndex: 0,
  customBadge: "",
  showStars: true,
  showSparkles: true,
  tiltIntensity: 12,
};

/* Sparkle particle component */
function SparkleParticles({ count = 12 }: { count?: number }) {
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
function StarDecoration({ count = 6 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 4}s`,
    size: 8 + Math.random() * 10,
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

export default function StudioElaina() {
  const [card, setCard] = useState<ProfileCardData>(DEFAULT_CARD);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const gradient = GRADIENT_PRESETS[card.gradientIndex];

  // Handle 3D tilt on preview card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = previewRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * card.tiltIntensity;
    const rotateY = (x - 0.5) * card.tiltIntensity;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    const el = previewRef.current;
    if (!el) return;
    el.style.transform = "perspective(600px) rotateX(0) rotateY(0) scale(1)";
  };

  const resetCard = () => setCard(DEFAULT_CARD);

  const handleCopyCSS = () => {
    const css = `.card-elaina {
  background: linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to});
  border-radius: 1.25rem;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px ${gradient.from}44;
}`;
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
              Buat kartu profil bergaya anime dengan efek 3D — terinspirasi dari Elaina
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
          <div className="space-y-5">
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
                    <Label className="text-xs">Custom Badge</Label>
                    <Input
                      value={card.customBadge}
                      onChange={(e) => setCard({ ...card, customBadge: e.target.value })}
                      placeholder="Atau ketik sendiri"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={card.subtitle}
                    onChange={(e) => setCard({ ...card, subtitle: e.target.value })}
                    placeholder="XII IPA 1 · NISN 008..."
                  />
                </div>
              </div>
            </Card3D>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                Gradient Preset
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((g, i) => (
                  <button
                    key={g.name}
                    onClick={() => setCard({ ...card, gradientIndex: i })}
                    className={`relative h-12 rounded-lg transition-all ${
                      card.gradientIndex === i
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                        : "hover:scale-105"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${g.from}, ${g.via}, ${g.to})`,
                    }}
                    title={g.name}
                  >
                    {card.gradientIndex === i && (
                      <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </Card3D>

            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="size-4 text-primary" />
                Efek
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
                <div className="space-y-1.5">
                  <Label className="text-xs">Intensitas Tilt 3D: {card.tiltIntensity}°</Label>
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
          </div>

          {/* ── PREVIEW ── */}
          <div className="flex flex-col items-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 self-start">
              Preview
            </h3>

            {/* 3D Preview Card */}
            <div
              ref={previewRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-sm rounded-2xl p-8 text-white shadow-2xl transition-transform duration-200 ease-out cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
                boxShadow: `0 20px 60px -12px ${gradient.from}66, 0 0 0 1px ${gradient.from}22`,
                transformStyle: "preserve-3d",
                perspective: "600px",
              }}
            >
              {/* Sparkles overlay */}
              {card.showSparkles && <SparkleParticles count={15} />}

              {/* Stars overlay */}
              {card.showStars && <StarDecoration count={8} />}

              {/* Card content */}
              <div className="relative z-10">
                {/* Avatar placeholder */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-2xl font-bold shadow-lg">
                    {card.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight drop-shadow-sm">
                      {card.name}
                    </p>
                    <span className="inline-block mt-1 rounded-full bg-white/25 backdrop-blur-sm px-3 py-0.5 text-xs font-medium">
                      {card.customBadge || card.role}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/20 my-4" />

                <p className="text-sm text-white/80">{card.subtitle}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-current" />
                    Scholaris
                  </span>
                  <span>·</span>
                  <span>Modern School Web</span>
                </div>
              </div>

              {/* Decorative gradient circle */}
              <div
                className="absolute -bottom-8 -right-8 size-32 rounded-full opacity-30 blur-2xl"
                style={{ background: `radial-gradient(circle, white, transparent)` }}
                aria-hidden="true"
              />
            </div>

            {/* CSS Output */}
            <Card3D intensity={1} className="w-full max-w-sm mt-6 p-4 obsidian-sheen">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">CSS Output</p>
                <Button variant="ghost" size="icon-sm" onClick={handleCopyCSS}>
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
  border-radius: 1.25rem;
  padding: 2rem;
  color: white;
  box-shadow:
    0 20px 60px -12px ${gradient.from}66;
}`}
              </pre>
            </Card3D>
          </div>
        </div>
      </div>

      {/* CSS animation keyframes (injected) */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </DashboardShell>
  );
}
