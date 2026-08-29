/* ═══════════════════════════════════════════
   ELAINA CHARACTER — Detailed anime witch SVG
   Original art, no copyrighted assets.
   Silver hair, purple eyes, dark cloak, gold bow
   ═══════════════════════════════════════════ */

export function ElainaCharacter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 600"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Anime witch character illustration"
    >
      <defs>
        {/* ── Gradients ── */}
        <linearGradient id="hMain" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#f0eaf8" />
          <stop offset="35%" stopColor="#e2d8f0" />
          <stop offset="70%" stopColor="#d0c0e4" />
          <stop offset="100%" stopColor="#baa8d8" />
        </linearGradient>
        <linearGradient id="hShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c4e8" />
          <stop offset="100%" stopColor="#a890c8" />
        </linearGradient>
        <linearGradient id="hHighlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.35" />
          <stop offset="55%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="skin" cx="0.5" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#ffe8d6" />
          <stop offset="70%" stopColor="#f8dcc8" />
          <stop offset="100%" stopColor="#f0ccb0" />
        </radialGradient>
        <radialGradient id="eyeIris" cx="0.42" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#c4a8f0" />
          <stop offset="30%" stopColor="#9b7de0" />
          <stop offset="65%" stopColor="#7050c0" />
          <stop offset="100%" stopColor="#3a1880" />
        </radialGradient>
        <linearGradient id="cloakMain" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#1a0e38" />
          <stop offset="30%" stopColor="#221450" />
          <stop offset="70%" stopColor="#2a1868" />
          <stop offset="100%" stopColor="#362080" />
        </linearGradient>
        <linearGradient id="cloakInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a0e0" />
          <stop offset="100%" stopColor="#a878d0" />
        </linearGradient>
        <linearGradient id="dressTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f0fa" />
          <stop offset="100%" stopColor="#e8e0f2" />
        </linearGradient>
        <radialGradient id="orbGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ═══ CAPE BACK ═══ */}
      <g opacity="0.95">
        <path
          d="M125 255 Q85 320 70 420 Q65 480 90 520 Q110 490 125 440 Q135 380 140 320 Z"
          fill="url(#cloakMain)"
          stroke="#3b2296"
          strokeWidth="0.5"
        />
        <path
          d="M275 255 Q315 320 330 420 Q335 480 310 520 Q290 490 275 440 Q265 380 260 320 Z"
          fill="url(#cloakMain)"
          stroke="#3b2296"
          strokeWidth="0.5"
        />
        {/* Cape inner lining visible at edges */}
        <path
          d="M128 260 Q90 330 75 430 Q72 470 95 510"
          fill="none"
          stroke="url(#cloakInner)"
          strokeWidth="3"
          opacity="0.3"
        />
        <path
          d="M272 260 Q310 330 325 430 Q328 470 305 510"
          fill="none"
          stroke="url(#cloakInner)"
          strokeWidth="3"
          opacity="0.3"
        />
      </g>

      {/* ═══ LONG HAIR BACK ═══ */}
      <g>
        {/* Left flowing hair */}
        <path
          d="M140 195 Q120 260 115 350 Q112 430 118 500 Q122 540 130 560 Q135 545 137 510 Q140 450 142 380 Q145 310 150 250 Z"
          fill="url(#hMain)"
          stroke="#c4b0e0"
          strokeWidth="0.5"
        />
        {/* Right flowing hair */}
        <path
          d="M260 195 Q280 260 285 350 Q288 430 282 500 Q278 540 270 560 Q265 545 263 510 Q260 450 258 380 Q255 310 250 250 Z"
          fill="url(#hMain)"
          stroke="#c4b0e0"
          strokeWidth="0.5"
        />
        {/* Hair strand detail left */}
        <path d="M130 350 Q127 420 132 500" fill="none" stroke="#c4b0e0" strokeWidth="0.8" opacity="0.4" />
        <path d="M145 300 Q140 380 143 460" fill="none" stroke="#d8c8f0" strokeWidth="0.6" opacity="0.3" />
        {/* Hair strand detail right */}
        <path d="M270 350 Q273 420 268 500" fill="none" stroke="#c4b0e0" strokeWidth="0.8" opacity="0.4" />
        <path d="M255 300 Q260 380 257 460" fill="none" stroke="#d8c8f0" strokeWidth="0.6" opacity="0.3" />
      </g>

      {/* ═══ CLOAK BODY ═══ */}
      <g>
        {/* Cloak sides flowing */}
        <path
          d="M145 235 Q138 300 130 380 Q125 440 120 520 L155 520 Q158 440 162 370 Q167 300 170 245 Z"
          fill="url(#cloakMain)"
        />
        <path
          d="M255 235 Q262 300 270 380 Q275 440 280 520 L245 520 Q242 440 238 370 Q233 300 230 245 Z"
          fill="url(#cloakMain)"
        />
        {/* Center opening showing inner dress */}
        <path
          d="M175 250 Q178 320 180 400 Q182 460 185 520 L215 520 Q218 460 220 400 Q222 320 225 250 Z"
          fill="url(#dressTop)"
          opacity="0.85"
        />
      </g>

      {/* ═══ DRESS / BODY ═══ */}
      <g>
        {/* Skirt base */}
        <path
          d="M160 340 Q150 420 145 520 L255 520 Q250 420 240 340 Z"
          fill="#1a0e38"
          opacity="0.7"
        />
        {/* Collar / neckline */}
        <path
          d="M175 238 Q200 248 225 238"
          fill="none"
          stroke="#d0c0e4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* ═══ GOLD BOW / RIBBON ═══ */}
      <g>
        {/* Main bow loops */}
        <path
          d="M190 243 Q180 232 176 238 Q178 248 190 243"
          fill="#d4a830"
          stroke="#b89020"
          strokeWidth="0.8"
        />
        <path
          d="M210 243 Q220 232 224 238 Q222 248 210 243"
          fill="#d4a830"
          stroke="#b89020"
          strokeWidth="0.8"
        />
        {/* Bow tails */}
        <path
          d="M192 246 Q186 258 183 268"
          fill="none"
          stroke="#d4a830"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M208 246 Q214 258 217 268"
          fill="none"
          stroke="#d4a830"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Bow center knot */}
        <ellipse cx="200" cy="243" rx="4" ry="3" fill="#c89828" stroke="#a88018" strokeWidth="0.5" />
        {/* Bow shine */}
        <ellipse cx="198" cy="240" rx="1.5" ry="1" fill="white" opacity="0.3" />
      </g>

      {/* ═══ HAIR FRONT ═══ */}
      <g>
        {/* Main bangs */}
        <path
          d="M150 180 Q150 145 165 130 Q180 118 200 115 Q220 118 235 130 Q250 145 250 180"
          fill="url(#hMain)"
          stroke="#c4b0e0"
          strokeWidth="0.5"
        />
        {/* Left side bangs */}
        <path
          d="M148 178 Q142 200 138 230 Q136 255 135 275 Q133 260 136 235 Q140 205 145 185"
          fill="url(#hMain)"
          stroke="#c4b0e0"
          strokeWidth="0.5"
        />
        {/* Right side bangs */}
        <path
          d="M252 178 Q258 200 262 230 Q264 255 265 275 Q267 260 264 235 Q260 205 255 185"
          fill="url(#hMain)"
          stroke="#c4b0e0"
          strokeWidth="0.5"
        />

        {/* Bang strands detail */}
        <path d="M168 135 Q170 155 165 178" fill="none" stroke="#d8c8f0" strokeWidth="0.8" opacity="0.5" />
        <path d="M185 126 Q187 148 183 172" fill="none" stroke="#d8c8f0" strokeWidth="0.8" opacity="0.5" />
        <path d="M200 122 Q200 145 200 170" fill="none" stroke="#d8c8f0" strokeWidth="0.6" opacity="0.4" />
        <path d="M215 126 Q213 148 217 172" fill="none" stroke="#d8c8f0" strokeWidth="0.8" opacity="0.5" />
        <path d="M232 135 Q230 155 235 178" fill="none" stroke="#d8c8f0" strokeWidth="0.8" opacity="0.5" />

        {/* Hair shine highlight band */}
        <path
          d="M172 130 Q185 123 200 122 Q215 123 228 130"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M178 136 Q190 131 200 130 Q210 131 222 136"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* Top hair highlight */}
        <ellipse cx="195" cy="126" rx="20" ry="5" fill="url(#hHighlight)" opacity="0.5" />
      </g>

      {/* ═══ HEAD / FACE ═══ */}
      <g>
        <ellipse cx="200" cy="200" rx="52" ry="62" fill="url(#skin)" />
        {/* Chin */}
        <path
          d="M158 220 Q162 260 200 278 Q238 260 242 220"
          fill="url(#skin)"
        />
        {/* Ear left hint */}
        <ellipse cx="148" cy="200" rx="5" ry="8" fill="#f0ccb0" opacity="0.6" />
        {/* Ear right hint */}
        <ellipse cx="252" cy="200" rx="5" ry="8" fill="#f0ccb0" opacity="0.6" />
      </g>

      {/* ═══ EYES ═══ */}
      <g>
        {/* ── Left Eye ── */}
        <g transform="translate(178, 200)">
          {/* Eye white */}
          <ellipse cx="0" cy="0" rx="14" ry="16" fill="white" />
          {/* Iris */}
          <ellipse cx="1" cy="1" rx="10.5" ry="12.5" fill="url(#eyeIris)" />
          {/* Pupil */}
          <ellipse cx="1" cy="2" rx="5" ry="6" fill="#1a0e38" />
          {/* Main shine top-left */}
          <ellipse cx="-4" cy="-4" rx="3.5" ry="3" fill="white" opacity="0.92" />
          {/* Small shine bottom-right */}
          <ellipse cx="3" cy="4" rx="1.8" ry="1.2" fill="white" opacity="0.55" />
          {/* Upper eyelid */}
          <path
            d="M-14 -6 Q-7 -16 0 -16 Q7 -16 14 -6"
            fill="none"
            stroke="#1a0e38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Eyelashes */}
          <path d="M-14 -6 L-16 -10" stroke="#1a0e38" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14 -6 L16 -10" stroke="#1a0e38" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M-11 -11 L-12.5 -14" stroke="#1a0e38" strokeWidth="1.2" strokeLinecap="round" />
          {/* Lower eyelid subtle */}
          <path
            d="M-10 10 Q0 15 10 10"
            fill="none"
            stroke="#d4a08a"
            strokeWidth="0.8"
            opacity="0.4"
          />
        </g>

        {/* ── Right Eye ── */}
        <g transform="translate(222, 200)">
          <ellipse cx="0" cy="0" rx="14" ry="16" fill="white" />
          <ellipse cx="1" cy="1" rx="10.5" ry="12.5" fill="url(#eyeIris)" />
          <ellipse cx="1" cy="2" rx="5" ry="6" fill="#1a0e38" />
          <ellipse cx="-4" cy="-4" rx="3.5" ry="3" fill="white" opacity="0.92" />
          <ellipse cx="3" cy="4" rx="1.8" ry="1.2" fill="white" opacity="0.55" />
          <path
            d="M-14 -6 Q-7 -16 0 -16 Q7 -16 14 -6"
            fill="none"
            stroke="#1a0e38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M-14 -6 L-16 -10" stroke="#1a0e38" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14 -6 L16 -10" stroke="#1a0e38" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 -11 L12.5 -14" stroke="#1a0e38" strokeWidth="1.2" strokeLinecap="round" />
          <path
            d="M-10 10 Q0 15 10 10"
            fill="none"
            stroke="#d4a08a"
            strokeWidth="0.8"
            opacity="0.4"
          />
        </g>

        {/* Eyebrows */}
        <path
          d="M162 180 Q172 174 188 178"
          fill="none"
          stroke="#9070b0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M212 178 Q228 174 238 180"
          fill="none"
          stroke="#9070b0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* ═══ NOSE & MOUTH ═══ */}
      <g>
        <path
          d="M199 215 Q200 219 201 215"
          fill="none"
          stroke="#d4a08a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M192 230 Q197 236 200 236 Q203 236 208 230"
          fill="none"
          stroke="#d4789a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Blush */}
        <ellipse cx="165" cy="220" rx="9" ry="5" fill="#f9a8d4" opacity="0.3" />
        <ellipse cx="235" cy="220" rx="9" ry="5" fill="#f9a8d4" opacity="0.3" />
      </g>

      {/* ═══ WITCH HAT ═══ */}
      <g>
        {/* Brim */}
        <ellipse cx="200" cy="155" rx="72" ry="14" fill="#1a0e38" stroke="#3b2296" strokeWidth="0.5" />
        {/* Cone */}
        <path
          d="M155 155 Q148 120 158 85 Q168 55 192 35 Q197 30 200 28 Q203 30 208 35 Q232 55 242 85 Q252 120 245 155"
          fill="#1a0e38"
          stroke="#3b2296"
          strokeWidth="0.5"
        />
        {/* Hat band */}
        <path
          d="M153 152 Q200 160 247 152"
          fill="none"
          stroke="#c084fc"
          strokeWidth="3.5"
        />
        {/* Star ornament */}
        <g filter="url(#glow)" transform="translate(200, 35)">
          <polygon
            points="0,-9 2.8,-3.5 9,-3.5 4,1 5.5,8 0,4 -5.5,8 -4,1 -9,-3.5 -2.8,-3.5"
            fill="#fbbf24"
            opacity="0.9"
          />
        </g>
        {/* Hat tip curl */}
        <path
          d="M192 35 Q185 28 182 22 Q180 18 183 16"
          fill="none"
          stroke="#3b2296"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Hat shading */}
        <path
          d="M165 120 Q180 100 195 85"
          fill="none"
          stroke="white"
          strokeWidth="1"
          opacity="0.08"
        />
      </g>

      {/* ═══ STAFF ═══ */}
      <g transform="translate(320, 80)">
        {/* Shaft */}
        <line x1="0" y1="35" x2="0" y2="380" stroke="#7050a0" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="0" y1="35" x2="0" y2="380" stroke="#a080d0" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        {/* Orb */}
        <circle cx="0" cy="28" r="22" fill="url(#orbGlow)" filter="url(#softGlow)" />
        <circle cx="0" cy="28" r="13" fill="#c084fc" opacity="0.75" />
        <circle cx="0" cy="28" r="8" fill="#e0d0ff" opacity="0.55" />
        <circle cx="-3" cy="24" r="3" fill="white" opacity="0.75" />
        {/* Prongs */}
        <path d="M-14 20 Q-8 10 0 7 Q8 10 14 20" fill="none" stroke="#8060b0" strokeWidth="2.5" strokeLinecap="round" />
        {/* Staff tip */}
        <path d="M-3 378 L0 392 L3 378" fill="#7050a0" />
      </g>

      {/* ═══ HANDS ═══ */}
      <g>
        {/* Left hand near staff */}
        <ellipse cx="305" cy="280" rx="9" ry="7" fill="url(#skin)" />
        {/* Right hand visible */}
        <ellipse cx="150" cy="290" rx="8" ry="7" fill="url(#skin)" />
        {/* Fingers hint left */}
        <path d="M300 280 Q298 276 296 274" fill="none" stroke="#f0ccb0" strokeWidth="1" strokeLinecap="round" />
        {/* Fingers hint right */}
        <path d="M155 290 Q157 286 159 284" fill="none" stroke="#f0ccb0" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* ═══ BOOTS ═══ */}
      <g>
        <path
          d="M158 510 Q154 530 150 548 Q147 558 142 562 L175 562 Q178 555 175 545 Q172 530 168 510"
          fill="#221450"
          stroke="#3b2296"
          strokeWidth="0.5"
        />
        <path
          d="M232 510 Q236 530 240 548 Q243 558 248 562 L215 562 Q212 555 215 545 Q218 530 222 510"
          fill="#221450"
          stroke="#3b2296"
          strokeWidth="0.5"
        />
        {/* Boot buckles */}
        <rect x="152" y="538" width="14" height="5" rx="1.5" fill="#c084fc" opacity="0.5" />
        <rect x="234" y="538" width="14" height="5" rx="1.5" fill="#c084fc" opacity="0.5" />
      </g>

      {/* ═══ SPARKLE PARTICLES ═══ */}
      <g filter="url(#glow)" opacity="0.65">
        <circle cx="100" cy="160" r="2.5" fill="#fbbf24">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="305" cy="195" r="2" fill="#c084fc">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="85" cy="300" r="1.8" fill="#fbbf24">
          <animate attributeName="opacity" values="0.15;0.75;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="325" cy="340" r="2.2" fill="#a78bfa">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="115" cy="420" r="1.5" fill="#f9a8d4">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="285" cy="460" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.9s" repeatCount="indefinite" begin="1s" />
        </circle>
        {/* Mini stars */}
        <polygon points="92,220 94,215 96,220 92,216 96,216" fill="#fbbf24" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.3s" repeatCount="indefinite" />
        </polygon>
        <polygon points="310,270 312,265 314,270 310,266 314,266" fill="#c084fc" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.9s" repeatCount="indefinite" begin="0.4s" />
        </polygon>
      </g>
    </svg>
  );
}
