import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import {
  Sparkles,
  RotateCcw,
  Star,
  Wand2,
  Copy,
  Check,
  Layers,
  Download,
  Palette,
  User,
  KeyRound,
} from "lucide-react";
import { Card3D } from "@/components/Card3D";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ElainaCharacter } from "@/components/ElainaCharacter";
import { ParallaxCard, ParallaxLayer } from "@/components/ParallaxCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Users,
  Search,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   STUDIO ELAINA — 3D Anime Card Builder
   Features: parallax card, export to PNG
   ═══════════════════════════════════════════ */

const GRADIENTS = [
  { name: "Elaina Classic", from: "#c084fc", via: "#a78bfa", to: "#818cf8" },
  { name: "Rose Moon", from: "#f472b6", via: "#e879f9", to: "#c084fc" },
  { name: "Ocean Star", from: "#67e8f9", via: "#a78bfa", to: "#c084fc" },
  { name: "Golden Hour", from: "#fbbf24", via: "#f472b6", to: "#c084fc" },
  { name: "Forest Mist", from: "#6ee7b7", via: "#a78bfa", to: "#818cf8" },
  { name: "Night Sky", from: "#6366f1", via: "#8b5cf6", to: "#a78bfa" },
  { name: "Cherry Blossom", from: "#fda4af", via: "#f9a8d4", to: "#c084fc" },
  { name: "Twilight", from: "#c084fc", via: "#6366f1", to: "#312e81" },
];

const BADGES = ["Siswa", "Guru", "Admin", "Ketua Kelas", "OSIS", "Perpustakaan", "Lab"];

interface CardData {
  name: string;
  badge: string;
  subtitle: string;
  username: string;
  password: string;
  showCredentials: boolean;
  gradientIdx: number;
  showStars: boolean;
  showSparkles: boolean;
  showCharacter: boolean;
  tilt: number;
}

const DEFAULT: CardData = {
  name: "Elaina Flonesia",
  badge: "Siswa",
  subtitle: "Kelas 6 · MI Mambaul Hasan",
  username: "elaina001",
  password: "Elaina@2026",
  showCredentials: true,
  gradientIdx: 0,
  showStars: true,
  showSparkles: true,
  showCharacter: true,
  tilt: 15,
};

/* ── Sparkle particles ── */
function Sparkles_({ count = 15 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    dur: `${2 + Math.random() * 2}s`,
    size: 2 + Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/80"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, animation: `sparkle ${p.dur} ease-in-out ${p.delay} infinite` }}
        />
      ))}
    </div>
  );
}

/* ── Star decoration ── */
function Stars_({ count = 8 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    top: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 4}s`,
    size: 6 + Math.random() * 10,
    rot: Math.random() * 360,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {items.map((s) => (
        <Star
          key={s.id}
          className="absolute text-white/20 fill-white/10"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, transform: `rotate(${s.rot}deg)`, animation: `sparkle 3s ease-in-out ${s.delay} infinite` }}
        />
      ))}
    </div>
  );
}

export default function StudioElaina() {
  const [card, setCard] = useState<CardData>(DEFAULT);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* ── Real data selector ── */
  const [muridList, setMuridList] = useState<{ id: string; name: string; className: string; nisn: string; username?: string; password?: string }[]>([]);
  const [guruList, setGuruList] = useState<{ id: string; name: string; subject: string }[]>([]);
  const [personSearch, setPersonSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    try {
      const m = localStorage.getItem("msw-murid");
      if (m) setMuridList(JSON.parse(m));
    } catch {}
    try {
      const g = localStorage.getItem("msw-guru");
      if (g) setGuruList(JSON.parse(g));
    } catch {}
  }, []);

  const gradient = GRADIENTS[card.gradientIdx];

  const selectPerson = (type: "siswa" | "guru", id: string) => {
    setSelectedId(id);
    if (type === "siswa") {
      const s = muridList.find((m) => m.id === id);
      if (s) setCard({
        ...card,
        name: s.name,
        badge: "Siswa",
        subtitle: `${s.className} · NISN ${s.nisn}`,
        username: s.username || "",
        password: s.password || "",
        showCredentials: !!(s.username && s.password),
      });
    } else {
      const g = guruList.find((gr) => gr.id === id);
      if (g) setCard({ ...card, name: g.name, badge: "Guru", subtitle: g.subject, showCredentials: false });
    }
  };

  const filteredSiswa = muridList.filter((s) =>
    s.name.toLowerCase().includes(personSearch.toLowerCase()) || s.className.toLowerCase().includes(personSearch.toLowerCase())
  );
  const filteredGuru = guruList.filter((g) =>
    g.name.toLowerCase().includes(personSearch.toLowerCase()) || g.subject.toLowerCase().includes(personSearch.toLowerCase())
  );

  /* ── Export to PNG ── */
  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: undefined,
      });
      const link = document.createElement("a");
      link.download = `kartu-${card.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Kartu berhasil diekspor!");
    } catch (err) {
      toast.error("Gagal mengekspor kartu.");
    }
    setExporting(false);
  };

  const handleCopyCSS = () => {
    const css = `.card-elaina {\n  background: linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to});\n  border-radius: 1.5rem;\n  color: white;\n  perspective: 1000px;\n  box-shadow: 0 20px 60px -12px ${gradient.from}66;\n}`;
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
              Buat kartu profil 3D bergaya anime — ekspor sebagai gambar PNG
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={handleCopyCSS}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Tersalin!" : "Copy CSS"}
            </Button>
            <Button size="sm" className="rounded-full" onClick={handleExport} disabled={exporting}>
              <Download className="size-3.5" />
              {exporting ? "Exporting..." : "Export PNG"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setCard(DEFAULT); setSelectedId(""); }}>
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── CONTROLS ── */}
          <div className="space-y-4">
            {/* Person selector */}
            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Search className="size-4 text-primary" />
                Pilih dari Database
              </h3>
              <div className="space-y-3">
                <Input className="text-sm" placeholder="Cari nama, kelas, NIP..." value={personSearch} onChange={(e) => setPersonSearch(e.target.value)} />
                {filteredSiswa.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <GraduationCap className="size-3" /> Siswa
                    </p>
                    <div className="max-h-28 overflow-y-auto space-y-1 border rounded-lg p-1.5">
                      {filteredSiswa.slice(0, 10).map((s) => (
                        <button key={s.id} onClick={() => selectPerson("siswa", s.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left text-xs transition-colors ${selectedId === s.id ? "bg-primary/15 text-primary" : "hover:bg-accent/50"}`}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                            {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-[9px] text-muted-foreground">{s.className}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {filteredGuru.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Users className="size-3" /> Guru
                    </p>
                    <div className="max-h-28 overflow-y-auto space-y-1 border rounded-lg p-1.5">
                      {filteredGuru.slice(0, 10).map((g) => (
                        <button key={g.id} onClick={() => selectPerson("guru", g.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left text-xs transition-colors ${selectedId === g.id ? "bg-primary/15 text-primary" : "hover:bg-accent/50"}`}
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
                {muridList.length === 0 && guruList.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Belum ada data di database.</p>
                )}
              </div>
            </Card3D>

            {/* Card info */}
            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Wand2 className="size-4 text-primary" />
                Info Kartu
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama</Label>
                  <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Nama di kartu" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Badge</Label>
                    <Select value={card.badge} onValueChange={(v) => setCard({ ...card, badge: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BADGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subtitle</Label>
                    <Input value={card.subtitle} onChange={(e) => setCard({ ...card, subtitle: e.target.value })} placeholder="Kelas 6 · NISN..." />
                  </div>
                </div>
              </div>
            </Card3D>

            {/* Gradient */}
            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                Gradient
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENTS.map((g, i) => (
                  <button key={g.name} onClick={() => setCard({ ...card, gradientIdx: i })}
                    className={`relative h-10 rounded-lg transition-all ${card.gradientIdx === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "hover:scale-105"}`}
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.via}, ${g.to})` }}
                    title={g.name}
                  >
                    {card.gradientIdx === i && <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </Card3D>

            {/* Effects */}
            <Card3D intensity={2} className="p-5 obsidian-sheen">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="size-4 text-primary" />
                Efek & 3D
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Username & Password</Label>
                  <Button variant={card.showCredentials ? "default" : "outline"} size="sm" className="h-7 text-xs"
                    onClick={() => setCard({ ...card, showCredentials: !card.showCredentials })}
                  >
                    {card.showCredentials ? "Aktif" : "Mati"}
                  </Button>
                </div>
                {card.showCredentials && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Username</Label>
                      <Input className="h-7 text-xs" value={card.username} onChange={(e) => setCard({ ...card, username: e.target.value })} placeholder="username" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Password</Label>
                      <Input className="h-7 text-xs" value={card.password} onChange={(e) => setCard({ ...card, password: e.target.value })} placeholder="password" />
                    </div>
                  </div>
                )}
                {[
                  { label: "Sparkle Partikel", key: "showSparkles" as const },
                  { label: "Dekorasi Bintang", key: "showStars" as const },
                  { label: "Karakter", key: "showCharacter" as const },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label className="text-xs">{item.label}</Label>
                    <Button variant={card[item.key] ? "default" : "outline"} size="sm" className="h-7 text-xs"
                      onClick={() => setCard({ ...card, [item.key]: !card[item.key] })}
                    >
                      {card[item.key] ? "Aktif" : "Mati"}
                    </Button>
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-xs">Intensitas 3D: {card.tilt}°</Label>
                  <input type="range" min={0} max={25} value={card.tilt}
                    onChange={(e) => setCard({ ...card, tilt: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </Card3D>

            <Card3D intensity={1} className="p-4 obsidian-sheen">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="size-3.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Lapisan 3D</p>
              </div>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <p>Layer 0 — Gradient background (paling jauh)</p>
                <p>Layer 1 — Bintang & sparkle</p>
                <p>Layer 2 — Karakter Elaina</p>
                <p>Layer 3 — Teks & badge (paling dekat)</p>
              </div>
            </Card3D>
          </div>

          {/* ── PREVIEW ── */}
          <div className="flex flex-col items-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 self-start">
              Preview — Gerakkan mouse ke kartu
            </h3>

            <ParallaxCard intensity={card.tilt} className="w-full max-w-sm">
              <div ref={cardRef}
                className="relative w-full rounded-2xl overflow-hidden text-white shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
                  boxShadow: `0 20px 60px -12px ${gradient.from}66, 0 0 0 1px ${gradient.from}22`,
                  aspectRatio: card.showCredentials ? "3/4" : "4/5",
                  minHeight: "480px",
                }}
              >
                {/* Layer 0 — background gradient overlay */}
                <ParallaxLayer depth={-0.5}>
                  <div className="absolute inset-0" aria-hidden="true">
                    <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2), transparent 60%)" }} />
                  </div>
                </ParallaxLayer>

                {/* Layer 1 — stars & sparkles */}
                <ParallaxLayer depth={-0.2}>
                  {card.showStars && <Stars_ count={10} />}
                  {card.showSparkles && <Sparkles_ count={20} />}
                </ParallaxLayer>

                {/* Layer 2 — character illustration (background only) */}
                {card.showCharacter && (
                  <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-0" aria-hidden="true">
                    <ElainaCharacter className="w-[55%] h-auto drop-shadow-2xl opacity-70" />
                  </div>
                )}

                {/* Top: name + badge — direct child, no ParallaxLayer */}
                <div className="absolute inset-x-0 top-0 p-6 z-20">
                  <div className="flex items-center gap-3">
                    <div className="flex size-14 items-center justify-center rounded-2xl text-xl font-bold shadow-lg"
                      style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                    >
                      {card.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xl font-bold tracking-tight drop-shadow-sm">{card.name}</p>
                      <span className="inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-medium"
                        style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
                      >
                        {card.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: credentials + subtitle + school name — direct child, no ParallaxLayer */}
                <div className="absolute inset-x-0 bottom-0 p-5 z-20">
                  <div className="h-px bg-white/20 mb-3" />
                  {card.showCredentials && card.username && (
                    <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-2 uppercase tracking-wider font-medium">
                        <KeyRound className="size-2.5" /> Akun Login
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-white/50" />
                          <span className="text-sm font-mono font-medium">{card.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <KeyRound className="size-3 text-white/50" />
                          <span className="text-sm font-mono font-medium">{card.password}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-white/80 drop-shadow-sm">{card.subtitle}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/50">
                    <Star className="size-3 fill-current" />
                    <span>Yayasan Mambaul Hasan</span>
                  </div>
                </div>

                {/* Corner glow */}
                <div className="absolute -bottom-12 -right-12 size-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle, white, transparent)" }} aria-hidden="true"
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
  background: linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to});
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

      <style>{`@keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }`}</style>
    </DashboardShell>
  );
}
