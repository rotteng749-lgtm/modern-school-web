/* ═══════════════════════════════════════════
   SCHOOL LOGOS — Yayasan Mambaul Hasan
   4 variants matching the reference images:
   1. MD.MH  — Madrasah Diniyah Barrul Hasan
   2. RA-MH  — Raudlatul Athfal Mambaul Hasan
   3. MI.MH  — Madrasah Ibtidaiyah Mambaul Hasan
   4. YMH    — Yayasan Mambaul Hasan
   ═══════════════════════════════════════════ */

interface LogoProps {
  className?: string;
  size?: number;
}

/* Shared pentagon badge shape */
function PentagonBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Pentagon outer shape */}
      <polygon
        points="100,5 185,60 170,165 30,165 15,60"
        fill="#eab308"
        stroke="#1e3a5f"
        strokeWidth="4"
      />
      {/* Inner blue circle */}
      <circle cx="100" cy="105" r="55" fill="#3b82f6" stroke="#1e3a5f" strokeWidth="2" />
      {/* Green shield */}
      <rect x="65" y="70" width="50" height="70" rx="4" fill="#16a34a" stroke="#fff" strokeWidth="1.5" />
      {/* Open book */}
      <g transform="translate(78, 82)">
        <path d="M0,0 Q12,-5 24,0 L24,22 Q12,17 0,22 Z" fill="#fff" opacity="0.9" />
        <path d="M24,0 Q12,-5 0,0 L0,22 Q12,17 24,22 Z" fill="#f0f0f0" opacity="0.9" />
        <line x1="12" y1="-2" x2="12" y2="23" stroke="#16a34a" strokeWidth="0.8" />
        {/* Book lines */}
        <line x1="3" y1="6" x2="10" y2="5" stroke="#16a34a" strokeWidth="0.5" opacity="0.6" />
        <line x1="3" y1="10" x2="10" y2="9" stroke="#16a34a" strokeWidth="0.5" opacity="0.6" />
        <line x1="3" y1="14" x2="10" y2="13" stroke="#16a34a" strokeWidth="0.5" opacity="0.6" />
        <line x1="14" y1="5" x2="21" y2="6" stroke="#16a34a" strokeWidth="0.5" opacity="0.6" />
        <line x1="14" y1="9" x2="21" y2="10" stroke="#16a34a" strokeWidth="0.5" opacity="0.6" />
        <line x1="14" y1="13" x2="21" y2="14" stroke="#16a34a" strokeWidth="0.5" opacity="0.6" />
      </g>
      {/* Quill/pen on left of book */}
      <g transform="translate(68, 88)" opacity="0.8">
        <path d="M0,0 L-2,20 L0,18 L2,20 Z" fill="#fff" />
        <path d="M0,0 Q-3,-5 -1,-8 Q1,-5 0,0" fill="#eab308" />
      </g>
      {/* Stars on right side (6 stars) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(125, ${76 + i * 12})`}>
          <polygon
            points="0,-4 1.2,-1.2 4,-1.2 2,0.8 2.8,4 0,2 -2.8,4 -2,0.8 -4,-1.2 -1.2,-1.2"
            fill="#1e3a5f"
          />
        </g>
      ))}
      {children}
    </svg>
  );
}

/* 1. Madrasah Diniyah Barrul Hasan — MD.MH */
export function LogoMDMH({ className = "", size = 200 }: LogoProps) {
  return (
    <PentagonBadge className={className} >
      {/* Top arc text */}
      <defs>
        <path id="mdmh-top" d="M40,95 Q100,35 160,95" fill="none" />
        <path id="mdmh-bot" d="M45,145 Q100,175 155,145" fill="none" />
      </defs>
      <text fontSize="9" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#mdmh-top" startOffset="50%" textAnchor="middle">
          MADRASAH DINIYAH BARRUL HASAN
        </textPath>
      </text>
      <text fontSize="8" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#mdmh-bot" startOffset="50%" textAnchor="middle">
          BATUR GADING PROBOLINGGO
        </textPath>
      </text>
      {/* MD.MH label */}
      <text x="87" y="80" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        MD.MH
      </text>
      {/* BTR label */}
      <text x="91" y="135" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        BTR
      </text>
    </PentagonBadge>
  );
}

/* 2. Raudlatul Athfal Mambaul Hasan — RA-MH */
export function LogoRAMH({ className = "", size = 200 }: LogoProps) {
  return (
    <PentagonBadge className={className}>
      <defs>
        <path id="ramh-top" d="M35,95 Q100,30 165,95" fill="none" />
        <path id="ramh-bot" d="M45,145 Q100,175 155,145" fill="none" />
      </defs>
      <text fontSize="8.5" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#ramh-top" startOffset="50%" textAnchor="middle">
          RAUDLATUL ATHFAL MAMBAUL HASAN
        </textPath>
      </text>
      <text fontSize="8" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#ramh-bot" startOffset="50%" textAnchor="middle">
          BATUR GADING PROBOLINGGO
        </textPath>
      </text>
      <text x="86" y="80" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        RA-MH
      </text>
      <text x="91" y="135" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        BTR
      </text>
    </PentagonBadge>
  );
}

/* 3. Madrasah Ibtidaiyah Mambaul Hasan — MI.MH */
export function LogoMIMH({ className = "", size = 200 }: LogoProps) {
  return (
    <PentagonBadge className={className}>
      <defs>
        <path id="mimh-top" d="M35,95 Q100,30 165,95" fill="none" />
        <path id="mimh-bot" d="M45,145 Q100,175 155,145" fill="none" />
      </defs>
      <text fontSize="8.5" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#mimh-top" startOffset="50%" textAnchor="middle">
          MADRASAH IBTIDAIYAH MAMBAUL HASAN
        </textPath>
      </text>
      <text fontSize="8" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#mimh-bot" startOffset="50%" textAnchor="middle">
          BATUR GADING PROBOLINGGO
        </textPath>
      </text>
      <text x="87" y="80" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        MI.MH
      </text>
      <text x="91" y="135" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        BTR
      </text>
    </PentagonBadge>
  );
}

/* 4. Yayasan Mambaul Hasan — YMH */
export function LogoYMH({ className = "", size = 200 }: LogoProps) {
  return (
    <PentagonBadge className={className}>
      <defs>
        <path id="ymh-top" d="M40,95 Q100,38 160,95" fill="none" />
        <path id="ymh-bot" d="M45,145 Q100,175 155,145" fill="none" />
      </defs>
      <text fontSize="9.5" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#ymh-top" startOffset="50%" textAnchor="middle">
          YAYASAN MAMBAUL HASAN
        </textPath>
      </text>
      <text fontSize="8" fill="#1e3a5f" fontWeight="bold" letterSpacing="0.5">
        <textPath href="#ymh-bot" startOffset="50%" textAnchor="middle">
          BATUR GADING PROBOLINGGO
        </textPath>
      </text>
      <text x="88" y="80" fontSize="8" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        YMH
      </text>
      <text x="91" y="135" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
        BTR
      </text>
    </PentagonBadge>
  );
}

/* All presets for the Database page selector */
export const SCHOOL_LOGO_PRESETS = [
  { id: "ymh", name: "Yayasan Mambaul Hasan", abbr: "YMH", component: LogoYMH },
  { id: "mdmh", name: "Madrasah Diniyah Barrul Hasan", abbr: "MD.MH", component: LogoMDMH },
  { id: "ramh", name: "Raudlatul Athfal Mambaul Hasan", abbr: "RA-MH", component: LogoRAMH },
  { id: "mimh", name: "Madrasah Ibtidaiyah Mambaul Hasan", abbr: "MI.MH", component: LogoMIMH },
] as const;
