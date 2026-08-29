import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   YMH Logo — Yayasan Mambaul Hasan
   Hexagonal badge: book + quill + stars
   Batur Gading, Probolinggo
   ═══════════════════════════════════════════ */

interface YmhLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function YmhLogo({ size = 40, className, showText = false }: YmhLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Hexagonal outer border */}
        <path
          d="M100 8 L185 50 L185 150 L100 192 L15 150 L15 50 Z"
          fill="var(--ymh-yellow, #D4E157)"
          stroke="var(--ymh-border, #1a1a2e)"
          strokeWidth="6"
        />
        {/* Inner hexagon */}
        <path
          d="M100 28 L168 60 L168 140 L100 172 L32 140 L32 60 Z"
          fill="var(--ymh-inner-bg, #e8f5e9)"
          stroke="var(--ymh-border, #1a1a2e)"
          strokeWidth="3"
        />
        {/* Central green rectangle — book area */}
        <rect
          x="48" y="48" width="72" height="104" rx="4"
          fill="var(--ymh-green, #2E7D32)"
          stroke="var(--ymh-border, #1a1a2e)"
          strokeWidth="2"
        />
        {/* YMH text at top of green rect */}
        <text
          x="84" y="68"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          YMH
        </text>
        {/* Open Book */}
        <g transform="translate(60, 78)">
          {/* Left page */}
          <path
            d="M24 0 L24 50 Q12 45 0 50 L0 5 Q12 0 24 0 Z"
            fill="#f5f5dc"
            stroke="var(--ymh-border, #1a1a2e)"
            strokeWidth="1"
          />
          {/* Right page */}
          <path
            d="M24 0 L24 50 Q36 45 48 50 L48 5 Q36 0 24 0 Z"
            fill="#fffde7"
            stroke="var(--ymh-border, #1a1a2e)"
            strokeWidth="1"
          />
          {/* Page lines left */}
          <line x1="6" y1="12" x2="20" y2="10" stroke="#aaa" strokeWidth="0.8" />
          <line x1="6" y1="18" x2="20" y2="16" stroke="#aaa" strokeWidth="0.8" />
          <line x1="6" y1="24" x2="20" y2="22" stroke="#aaa" strokeWidth="0.8" />
          <line x1="6" y1="30" x2="20" y2="28" stroke="#aaa" strokeWidth="0.8" />
          {/* Page lines right */}
          <line x1="28" y1="10" x2="42" y2="12" stroke="#aaa" strokeWidth="0.8" />
          <line x1="28" y1="16" x2="42" y2="18" stroke="#aaa" strokeWidth="0.8" />
          <line x1="28" y1="22" x2="42" y2="24" stroke="#aaa" strokeWidth="0.8" />
          <line x1="28" y1="28" x2="42" y2="30" stroke="#aaa" strokeWidth="0.8" />
          {/* Spine */}
          <line x1="24" y1="0" x2="24" y2="50" stroke="var(--ymh-border, #1a1a2e)" strokeWidth="1.5" />
        </g>
        {/* BTR text below book */}
        <text
          x="84" y="146"
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          BTR
        </text>
        {/* Quill / pen on left side of green rect */}
        <g transform="translate(50, 70) rotate(-15)">
          <path
            d="M0 0 Q2 -8 4 -20 Q5 -16 6 -8 Q4 -2 0 0 Z"
            fill="#FFD54F"
            stroke="var(--ymh-border, #1a1a2e)"
            strokeWidth="0.8"
          />
          <line x1="4" y1="0" x2="4" y2="15" stroke="var(--ymh-border, #1a1a2e)" strokeWidth="1" />
        </g>
        {/* 6 Stars on the right side (vertical) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(140, ${56 + i * 18})`}>
            <polygon
              points="7,0 9.2,4.5 14,5.2 10.5,8.6 11.3,13.4 7,11.1 2.7,13.4 3.5,8.6 0,5.2 4.8,4.5"
              fill="#1a1a2e"
              stroke="none"
            />
          </g>
        ))}
        {/* Top arc text — institution name */}
        <path
          id="topArc"
          d="M40,95 Q100,20 160,95"
          fill="none"
          stroke="none"
        />
        <text
          fill="var(--ymh-text, #1a1a2e)"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          <textPath href="#topArc" startOffset="50%" textAnchor="middle">
            YAYASAN MAMBAUL HASAN
          </textPath>
        </text>
        {/* Bottom arc text — location */}
        <path
          id="bottomArc"
          d="M30,130 Q100,200 170,130"
          fill="none"
          stroke="none"
        />
        <text
          fill="var(--ymh-text, #1a1a2e)"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
            BATUR GADING PROBOLINGGO
          </textPath>
        </text>
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight">Yayasan Mambaul Hasan</span>
          <span className="text-[10px] text-muted-foreground">Batur Gading, Probolinggo</span>
        </div>
      )}
    </div>
  );
}
