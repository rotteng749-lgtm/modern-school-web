/* ═══════════════════════════════════════════
   MAGIC CIRCLES — 15 decorative SVG patterns
   For Studio Elaina card backgrounds
   ═══════════════════════════════════════════ */

import type { ReactNode } from "react";

const W = "white";

export interface MagicCircle {
  name: string;
  render: () => ReactNode;
}

function S({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 200 200" className="w-[65%] opacity-[0.12]">{children}</svg>;
}

const R = (i: number) => `rotate(${i * 30} 100 100)`;
const R6 = (i: number) => `rotate(${i * 60} 100 100)`;
const R5 = (i: number) => `rotate(${i * 72} 100 100)`;
const R8 = (i: number) => `rotate(${i * 45} 100 100)`;

export const MAGIC_CIRCLES: MagicCircle[] = [
  /* 0 — Pentagon Star */
  {
    name: "Bintang Lima",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="80" fill="none" stroke={W} strokeWidth="0.6" />
        <polygon points="100,15 112,65 165,65 122,95 138,145 100,115 62,145 78,95 35,65 88,65" fill="none" stroke={W} strokeWidth="1.2" />
        {[0,1,2,3,4].map(i => <line key={i} x1="100" y1="8" x2="100" y2="28" stroke={W} strokeWidth="1" transform={R5(i)} />)}
      </S>
    ),
  },
  /* 1 — Hexagram */
  {
    name: "Hexagram",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="90" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="72" fill="none" stroke={W} strokeWidth="0.5" />
        <polygon points="100,20 160,80 160,140 100,180 40,140 40,80" fill="none" stroke={W} strokeWidth="1.2" />
        <polygon points="100,180 160,140 160,80 100,20 40,80 40,140" fill="none" stroke={W} strokeWidth="0.8" />
        {[0,1,2,3,4,5].map(i => <circle key={i} cx={100 + 82 * Math.cos((i * 60 - 90) * Math.PI / 180)} cy={100 + 82 * Math.sin((i * 60 - 90) * Math.PI / 180)} r="3" fill={W} opacity="0.5" />)}
      </S>
    ),
  },
  /* 2 — Rune Ring */
  {
    name: "Cincin Rune",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="90" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="82" fill="none" stroke={W} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="65" fill="none" stroke={W} strokeWidth="0.8" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5 - 90) * Math.PI / 180;
          const r1 = 74, r2 = 86;
          return <line key={i} x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)} x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)} stroke={W} strokeWidth={i % 2 === 0 ? "1.5" : "0.8"} />;
        })}
        {[0,1,2,3,4,5,6,7].map(i => <text key={i} x="100" y="98" textAnchor="middle" fill={W} fontSize="7" fontWeight="bold" transform={`rotate(${i * 45} 100 100)`} opacity="0.6">✦</text>)}
      </S>
    ),
  },
  /* 3 — Zodiac Wheel */
  {
    name: "Roda Zodiak",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="85" fill="none" stroke={W} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={W} strokeWidth="0.8" />
        <circle cx="100" cy="100" r="40" fill="none" stroke={W} strokeWidth="0.5" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 - 90) * Math.PI / 180;
          return <line key={i} x1={100 + 40 * Math.cos(a)} y1={100 + 40 * Math.sin(a)} x2={100 + 92 * Math.cos(a)} y2={100 + 92 * Math.sin(a)} stroke={W} strokeWidth="0.6" />;
        })}
        <circle cx="100" cy="100" r="18" fill="none" stroke={W} strokeWidth="1" />
        <circle cx="100" cy="100" r="4" fill={W} opacity="0.4" />
      </S>
    ),
  },
  /* 4 — Celestial (sun + moon + stars) */
  {
    name: "Celestial",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="90" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="75" fill="none" stroke={W} strokeWidth="0.5" strokeDasharray="4 4" />
        {/* Sun */}
        <circle cx="100" cy="100" r="25" fill="none" stroke={W} strokeWidth="1.2" />
        <circle cx="100" cy="100" r="15" fill="none" stroke={W} strokeWidth="0.6" />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="100" y1="70" x2="100" y2="58" stroke={W} strokeWidth="0.8" transform={R(i)} />)}
        {/* Moon */}
        <circle cx="100" cy="30" r="8" fill="none" stroke={W} strokeWidth="1" />
        <circle cx="103" cy="28" r="6" fill={W} opacity="0.15" />
        {/* Stars */}
        {[[45,45],[155,45],[155,155],[45,155]].map(([x,y], i) => <polygon key={i} points={`${x},${y-5} ${x+2},${y-1} ${x+5},${y} ${x+2},${y+1} ${x},${y+5} ${x-2},${y+1} ${x-5},${y} ${x-2},${y-1}`} fill={W} opacity="0.4" />)}
      </S>
    ),
  },
  /* 5 — Mandala */
  {
    name: "Mandala",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="90" fill="none" stroke={W} strokeWidth="1.2" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={W} strokeWidth="0.6" />
        <circle cx="100" cy="100" r="50" fill="none" stroke={W} strokeWidth="0.8" />
        <circle cx="100" cy="100" r="30" fill="none" stroke={W} strokeWidth="0.5" />
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 45} 100 100)`}>
            <ellipse cx="100" cy="55" rx="12" ry="22" fill="none" stroke={W} strokeWidth="0.7" />
            <ellipse cx="100" cy="45" rx="6" ry="12" fill="none" stroke={W} strokeWidth="0.4" />
          </g>
        ))}
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={100 + 60 * Math.cos((i * 45 - 90) * Math.PI / 180)} cy={100 + 60 * Math.sin((i * 45 - 90) * Math.PI / 180)} r="2.5" fill={W} opacity="0.3" />)}
      </S>
    ),
  },
  /* 6 — Hexagonal Grid */
  {
    name: "Heksagon",
    render: () => {
      const hex = (cx: number, cy: number, r: number) =>
        Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 - 30) * Math.PI / 180;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
      return (
        <S>
          <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
          <polygon points={hex(100, 100, 50)} fill="none" stroke={W} strokeWidth="1.2" />
          <polygon points={hex(100, 100, 30)} fill="none" stroke={W} strokeWidth="0.6" />
          {[0,60,120,180,240,300].map((deg, i) => {
            const a = (deg - 90) * Math.PI / 180;
            return <polygon key={i} points={hex(100 + 65 * Math.cos(a), 100 + 65 * Math.sin(a), 22)} fill="none" stroke={W} strokeWidth="0.6" opacity="0.5" />;
          })}
          <circle cx="100" cy="100" r="8" fill={W} opacity="0.15" />
        </S>
      );
    },
  },
  /* 7 — Flower of Life */
  {
    name: "Bunga Kehidupan",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="30" fill="none" stroke={W} strokeWidth="0.8" />
        {[0,60,120,180,240,300].map((deg, i) => {
          const a = (deg - 90) * Math.PI / 180;
          return <circle key={i} cx={100 + 30 * Math.cos(a)} cy={100 + 30 * Math.sin(a)} r="30" fill="none" stroke={W} strokeWidth="0.6" />;
        })}
        {[0,60,120,180,240,300].map((deg, i) => {
          const a = (deg - 90) * Math.PI / 180;
          return <circle key={i} cx={100 + 52 * Math.cos(a)} cy={100 + 52 * Math.sin(a)} r="30" fill="none" stroke={W} strokeWidth="0.4" opacity="0.5" />;
        })}
        <circle cx="100" cy="100" r="60" fill="none" stroke={W} strokeWidth="0.4" opacity="0.4" />
      </S>
    ),
  },
  /* 8 — Constellation */
  {
    name: "Rasi Bintang",
    render: () => {
      const stars = [[100,25],[60,55],[140,55],[45,100],[155,100],[65,145],[135,145],[100,175],[80,80],[120,80],[80,120],[120,120]];
      const lines = [[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,7],[1,8],[2,9],[3,10],[4,11],[8,10],[9,11],[8,9],[10,11]];
      return (
        <S>
          <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
          {lines.map(([a, b], i) => <line key={i} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} stroke={W} strokeWidth="0.5" opacity="0.4" />)}
          {stars.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i < 8 ? "2.5" : "1.5"} fill={W} opacity={i < 8 ? "0.6" : "0.35"} />)}
        </S>
      );
    },
  },
  /* 9 — Sun Rays */
  {
    name: "Sinar Matahari",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="90" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={W} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="22" fill="none" stroke={W} strokeWidth="1.2" />
        <circle cx="100" cy="100" r="12" fill="none" stroke={W} strokeWidth="0.6" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 - 90) * Math.PI / 180;
          const inner = i % 2 === 0 ? 28 : 35;
          const outer = i % 2 === 0 ? 65 : 55;
          return <line key={i} x1={100 + inner * Math.cos(a)} y1={100 + inner * Math.sin(a)} x2={100 + outer * Math.cos(a)} y2={100 + outer * Math.sin(a)} stroke={W} strokeWidth={i % 2 === 0 ? "1" : "0.5"} />;
        })}
        {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={100 + 80 * Math.cos((i * 30 - 90) * Math.PI / 180)} cy={100 + 80 * Math.sin((i * 30 - 90) * Math.PI / 180)} r="1.5" fill={W} opacity="0.3" />)}
      </S>
    ),
  },
  /* 10 — Celtic Spiral */
  {
    name: "Spiral Keltik",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="78" fill="none" stroke={W} strokeWidth="0.5" />
        {/* Triple spiral (triskelion) */}
        {[0,120,240].map((rot, i) => (
          <path key={i} d={`M100,100 Q${100 + 25 * Math.cos((rot - 60) * Math.PI / 180)},${100 + 25 * Math.sin((rot - 60) * Math.PI / 180)} ${100 + 35 * Math.cos(rot * Math.PI / 180)},${100 + 35 * Math.sin(rot * Math.PI / 180)} Q${100 + 20 * Math.cos((rot + 90) * Math.PI / 180)},${100 + 20 * Math.sin((rot + 90) * Math.PI / 180)} ${100 + 15 * Math.cos(rot * Math.PI / 180)},${100 + 15 * Math.sin(rot * Math.PI / 180)}`} fill="none" stroke={W} strokeWidth="1.2" />
        ))}
        <circle cx="100" cy="100" r="6" fill="none" stroke={W} strokeWidth="1" />
        {/* Outer decorative arcs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M${100 + 55 * Math.cos((i * 60 - 90) * Math.PI / 180)},${100 + 55 * Math.sin((i * 60 - 90) * Math.PI / 180)} Q${100 + 65 * Math.cos((i * 60 - 60) * Math.PI / 180)},${100 + 65 * Math.sin((i * 60 - 60) * Math.PI / 180)} ${100 + 55 * Math.cos((i * 60 - 30) * Math.PI / 180)},${100 + 55 * Math.sin((i * 60 - 30) * Math.PI / 180)}`} fill="none" stroke={W} strokeWidth="0.7" opacity="0.5" />
        ))}
      </S>
    ),
  },
  /* 11 — Minimalist Dots */
  {
    name: "Titik Minimalis",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="90" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={W} strokeWidth="0.3" strokeDasharray="2 6" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 - 90) * Math.PI / 180;
          const r = i % 3 === 0 ? 80 : 60;
          return <circle key={i} cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r={i % 3 === 0 ? "2.5" : "1.2"} fill={W} opacity={i % 3 === 0 ? "0.5" : "0.25"} />;
        })}
        <circle cx="100" cy="100" r="8" fill={W} opacity="0.12" />
        <circle cx="100" cy="100" r="2" fill={W} opacity="0.3" />
      </S>
    ),
  },
  /* 12 — Triangle Portal */
  {
    name: "Portal Segitiga",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
        <polygon points="100,18 175,155 25,155" fill="none" stroke={W} strokeWidth="1.2" />
        <polygon points="100,182 25,45 175,45" fill="none" stroke={W} strokeWidth="0.8" />
        <polygon points="100,45 148,128 52,128" fill="none" stroke={W} strokeWidth="0.5" />
        <polygon points="100,155 52,72 148,72" fill="none" stroke={W} strokeWidth="0.4" />
        <circle cx="100" cy="100" r="18" fill="none" stroke={W} strokeWidth="1" />
        <circle cx="100" cy="100" r="4" fill={W} opacity="0.2" />
        {[0,120,240].map((deg, i) => <circle key={i} cx={100 + 88 * Math.cos((deg - 90) * Math.PI / 180)} cy={100 + 88 * Math.sin((deg - 90) * Math.PI / 180)} r="3" fill={W} opacity="0.3" />)}
      </S>
    ),
  },
  /* 13 — Arcane Sigil */
  {
    name: "Sigil Arcane",
    render: () => (
      <S>
        <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="85" fill="none" stroke={W} strokeWidth="0.4" />
        <circle cx="100" cy="100" r="60" fill="none" stroke={W} strokeWidth="0.8" />
        <circle cx="100" cy="100" r="35" fill="none" stroke={W} strokeWidth="0.5" />
        {/* Cross lines */}
        <line x1="100" y1="15" x2="100" y2="185" stroke={W} strokeWidth="0.4" />
        <line x1="15" y1="100" x2="185" y2="100" stroke={W} strokeWidth="0.4" />
        <line x1="35" y1="35" x2="165" y2="165" stroke={W} strokeWidth="0.3" />
        <line x1="165" y1="35" x2="35" y2="165" stroke={W} strokeWidth="0.3" />
        {/* Outer runes */}
        {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ"].map((rune, i) => {
          const a = (i * 30 - 90) * Math.PI / 180;
          return <text key={i} x={100 + 76 * Math.cos(a)} y={100 + 76 * Math.sin(a) + 3} textAnchor="middle" fill={W} fontSize="6" opacity="0.4">{rune}</text>;
        })}
        <circle cx="100" cy="100" r="6" fill={W} opacity="0.15" />
      </S>
    ),
  },
  /* 14 — Crystal Facets */
  {
    name: "Kristal",
    render: () => {
      const pts = (r: number, n: number, off = -90) =>
        Array.from({ length: n }).map((_, i) => {
          const a = (off + i * (360 / n)) * Math.PI / 180;
          return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
        }).join(" ");
      return (
        <S>
          <circle cx="100" cy="100" r="92" fill="none" stroke={W} strokeWidth="1.5" />
          <polygon points={pts(80, 8)} fill="none" stroke={W} strokeWidth="1" />
          <polygon points={pts(55, 8, -67.5)} fill="none" stroke={W} strokeWidth="0.6" />
          <polygon points={pts(35, 8)} fill="none" stroke={W} strokeWidth="0.4" />
          {/* Connecting lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a1 = (i * 45 - 90) * Math.PI / 180;
            const a2 = (i * 45 - 67.5) * Math.PI / 180;
            return <line key={i} x1={100 + 80 * Math.cos(a1)} y1={100 + 80 * Math.sin(a1)} x2={100 + 55 * Math.cos(a2)} y2={100 + 55 * Math.sin(a2)} stroke={W} strokeWidth="0.4" opacity="0.4" />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 - 90) * Math.PI / 180;
            return <circle key={i} cx={100 + 80 * Math.cos(a)} cy={100 + 80 * Math.sin(a)} r="2" fill={W} opacity="0.35" />;
          })}
          <circle cx="100" cy="100" r="15" fill="none" stroke={W} strokeWidth="0.8" />
        </S>
      );
    },
  },
];
