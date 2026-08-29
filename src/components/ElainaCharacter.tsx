/* ═══════════════════════════════════════════
   ELAINA CHARACTER — Anime portrait SVG
   Large expressive eyes, flowing silver hair,
   soft shading, chibi-to-medium proportions.
   Original art, no copyrighted assets.
   ═══════════════════════════════════════════ */

export function ElainaCharacter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Hair */}
        <linearGradient id="ec_hair" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f0eaf8" />
          <stop offset="40%" stopColor="#ddd0ee" />
          <stop offset="80%" stopColor="#c4b0de" />
          <stop offset="100%" stopColor="#a890c8" />
        </linearGradient>
        <linearGradient id="ec_hairShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4c4e8" />
          <stop offset="100%" stopColor="#9880b8" />
        </linearGradient>
        {/* Skin */}
        <radialGradient id="ec_skin" cx="0.5" cy="0.38" r="0.55">
          <stop offset="0%" stopColor="#ffe8d6" />
          <stop offset="60%" stopColor="#f8dcc8" />
          <stop offset="100%" stopColor="#f0ccb0" />
        </radialGradient>
        <radialGradient id="ec_cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f9a8d4" stopOpacity="0" />
        </radialGradient>
        {/* Eyes */}
        <radialGradient id="ec_eyeL" cx="0.42" cy="0.32" r="0.58">
          <stop offset="0%" stopColor="#d4b8f8" />
          <stop offset="25%" stopColor="#a880e8" />
          <stop offset="55%" stopColor="#7850d0" />
          <stop offset="100%" stopColor="#3a1880" />
        </radialGradient>
        <radialGradient id="ec_eyeR" cx="0.42" cy="0.32" r="0.58">
          <stop offset="0%" stopColor="#d4b8f8" />
          <stop offset="25%" stopColor="#a880e8" />
          <stop offset="55%" stopColor="#7850d0" />
          <stop offset="100%" stopColor="#3a1880" />
        </radialGradient>
        {/* Cloak */}
        <linearGradient id="ec_cloak" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#180c35" />
          <stop offset="40%" stopColor="#201450" />
          <stop offset="100%" stopColor="#2e1c70" />
        </linearGradient>
        <linearGradient id="ec_cloakInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a0e0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a070c8" stopOpacity="0.2" />
        </linearGradient>
        {/* Dress white */}
        <linearGradient id="ec_dress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f4fc" />
          <stop offset="100%" stopColor="#ece4f4" />
        </linearGradient>
        {/* Orb */}
        <radialGradient id="ec_orb" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#e8d4ff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#b888f0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        {/* Filters */}
        <filter id="ec_glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="ec_softGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="ec_shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1a0e38" floodOpacity="0.3"/></filter>
      </defs>

      {/* ═══ HAIR BACK (long flowing) ═══ */}
      <g>
        {/* Left flow */}
        <path d="M130 180 Q110 250 100 340 Q95 420 105 480 Q112 495 125 485 Q130 440 135 370 Q140 300 148 230 Z" fill="url(#ec_hair)" opacity="0.85"/>
        {/* Right flow */}
        <path d="M270 180 Q290 250 300 340 Q305 420 295 480 Q288 495 275 485 Q270 440 265 370 Q260 300 252 230 Z" fill="url(#ec_hair)" opacity="0.85"/>
        {/* Strands */}
        <path d="M118 350 Q115 420 120 475" fill="none" stroke="#c4b0de" strokeWidth="1" opacity="0.35"/>
        <path d="M282 350 Q285 420 280 475" fill="none" stroke="#c4b0de" strokeWidth="1" opacity="0.35"/>
        <path d="M140 280 Q135 350 138 420" fill="none" stroke="#d8c8f0" strokeWidth="0.7" opacity="0.25"/>
        <path d="M260 280 Q265 350 262 420" fill="none" stroke="#d8c8f0" strokeWidth="0.7" opacity="0.25"/>
      </g>

      {/* ═══ CLOAK ═══ */}
      <g filter="url(#ec_shadow)">
        {/* Left wing */}
        <path d="M135 220 Q110 300 95 400 Q88 460 100 490 Q120 475 135 430 Q145 370 152 300 Z" fill="url(#ec_cloak)"/>
        {/* Right wing */}
        <path d="M265 220 Q290 300 305 400 Q312 460 300 490 Q280 475 265 430 Q255 370 248 300 Z" fill="url(#ec_cloak)"/>
        {/* Lining visible */}
        <path d="M138 225 Q115 310 100 410" fill="none" stroke="url(#ec_cloakInner)" strokeWidth="4"/>
        <path d="M262 225 Q285 310 300 410" fill="none" stroke="url(#ec_cloakInner)" strokeWidth="4"/>
      </g>

      {/* ═══ BODY / DRESS ═══ */}
      <g>
        {/* Inner white dress center */}
        <path d="M172 240 Q175 310 178 380 Q180 430 182 490 L218 490 Q220 430 222 380 Q225 310 228 240 Z" fill="url(#ec_dress)" opacity="0.9"/>
        {/* Collar */}
        <path d="M178 232 Q200 242 222 232" fill="none" stroke="#d0c0e4" strokeWidth="1.8" strokeLinecap="round"/>
      </g>

      {/* ═══ GOLD BOW ═══ */}
      <g>
        <path d="M192 237 Q180 226 175 233 Q178 244 192 237" fill="#d4a830" stroke="#b89020" strokeWidth="0.7"/>
        <path d="M208 237 Q220 226 225 233 Q222 244 208 237" fill="#d4a830" stroke="#b89020" strokeWidth="0.7"/>
        <path d="M194 240 Q188 252 185 262" fill="none" stroke="#d4a830" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M206 240 Q212 252 215 262" fill="none" stroke="#d4a830" strokeWidth="2.2" strokeLinecap="round"/>
        <ellipse cx="200" cy="237" rx="4.5" ry="3.5" fill="#c89828"/>
        <ellipse cx="198" cy="234" rx="1.5" ry="1" fill="white" opacity="0.35"/>
      </g>

      {/* ═══ HEAD ═══ */}
      <g>
        {/* Face - large anime proportions */}
        <ellipse cx="200" cy="185" rx="58" ry="68" fill="url(#ec_skin)"/>
        {/* Chin */}
        <path d="M150 208 Q155 255 200 275 Q245 255 250 208" fill="url(#ec_skin)"/>
      </g>

      {/* ═══ HAIR FRONT (bangs + sides) ═══ */}
      <g>
        {/* Main bangs - fluffy, overlapping */}
        <path d="M145 165 Q142 130 158 115 Q175 102 200 100 Q225 102 242 115 Q258 130 255 165" fill="url(#ec_hair)"/>
        {/* Bang center part detail */}
        <path d="M195 108 Q198 95 202 108" fill="url(#ec_hair)"/>
        {/* Left side locks */}
        <path d="M142 162 Q136 190 132 225 Q130 255 128 280 Q126 265 130 238 Q135 200 140 172" fill="url(#ec_hair)"/>
        {/* Right side locks */}
        <path d="M258 162 Q264 190 268 225 Q270 255 272 280 Q274 265 270 238 Q265 200 260 172" fill="url(#ec_hair)"/>

        {/* Strand details */}
        <path d="M162 120 Q165 142 160 168" fill="none" stroke="#d8c8f0" strokeWidth="0.9" opacity="0.45"/>
        <path d="M180 110 Q183 135 178 162" fill="none" stroke="#d8c8f0" strokeWidth="0.9" opacity="0.45"/>
        <path d="M200 105 Q200 130 200 158" fill="none" stroke="#d8c8f0" strokeWidth="0.7" opacity="0.35"/>
        <path d="M220 110 Q217 135 222 162" fill="none" stroke="#d8c8f0" strokeWidth="0.9" opacity="0.45"/>
        <path d="M238 120 Q235 142 240 168" fill="none" stroke="#d8c8f0" strokeWidth="0.9" opacity="0.45"/>

        {/* Hair shine band */}
        <path d="M168 112 Q183 105 200 103 Q217 105 232 112" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.45"/>
        <path d="M174 119 Q188 113 200 112 Q212 113 226 119" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.25"/>

        {/* Hair outline softening */}
        <path d="M148 168 Q145 140 160 120 Q175 108 200 105 Q225 108 240 120 Q255 140 252 168" fill="none" stroke="#b8a0d4" strokeWidth="0.6" opacity="0.3"/>
      </g>

      {/* ═══ EYES (large anime style) ═══ */}
      <g>
        {/* ── Left Eye ── */}
        <g transform="translate(175, 188)">
          {/* White */}
          <ellipse cx="0" cy="0" rx="16" ry="18" fill="white"/>
          {/* Iris - large, detailed */}
          <ellipse cx="1.5" cy="1" rx="12" ry="14" fill="url(#ec_eyeL)"/>
          {/* Pupil */}
          <ellipse cx="1.5" cy="2.5" rx="5.5" ry="7" fill="#1a0e38"/>
          {/* Iris detail ring */}
          <ellipse cx="1.5" cy="1" rx="10" ry="12" fill="none" stroke="#9060d0" strokeWidth="0.8" opacity="0.3"/>
          {/* Main shine - large */}
          <ellipse cx="-4.5" cy="-5" rx="4.5" ry="3.8" fill="white" opacity="0.93"/>
          {/* Secondary shine */}
          <ellipse cx="4" cy="5" rx="2" ry="1.5" fill="white" opacity="0.5"/>
          {/* Tiny sparkle */}
          <circle cx="-2" cy="-2" r="0.8" fill="white" opacity="0.6"/>
          {/* Upper eyelid - thick, curved */}
          <path d="M-16 -7 Q-8 -18 0 -18 Q8 -18 16 -7" fill="none" stroke="#1a0e38" strokeWidth="3" strokeLinecap="round"/>
          {/* Eyelashes - 3 per side */}
          <path d="M-16 -7 L-18.5 -11" stroke="#1a0e38" strokeWidth="2" strokeLinecap="round"/>
          <path d="M-13 -13 L-15 -16" stroke="#1a0e38" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 -7 L18.5 -11" stroke="#1a0e38" strokeWidth="2" strokeLinecap="round"/>
          {/* Lower eyelid */}
          <path d="M-12 12 Q0 17 12 12" fill="none" stroke="#d4a08a" strokeWidth="0.9" opacity="0.35"/>
        </g>

        {/* ── Right Eye ── */}
        <g transform="translate(225, 188)">
          <ellipse cx="0" cy="0" rx="16" ry="18" fill="white"/>
          <ellipse cx="1.5" cy="1" rx="12" ry="14" fill="url(#ec_eyeR)"/>
          <ellipse cx="1.5" cy="2.5" rx="5.5" ry="7" fill="#1a0e38"/>
          <ellipse cx="1.5" cy="1" rx="10" ry="12" fill="none" stroke="#9060d0" strokeWidth="0.8" opacity="0.3"/>
          <ellipse cx="-4.5" cy="-5" rx="4.5" ry="3.8" fill="white" opacity="0.93"/>
          <ellipse cx="4" cy="5" rx="2" ry="1.5" fill="white" opacity="0.5"/>
          <circle cx="-2" cy="-2" r="0.8" fill="white" opacity="0.6"/>
          <path d="M-16 -7 Q-8 -18 0 -18 Q8 -18 16 -7" fill="none" stroke="#1a0e38" strokeWidth="3" strokeLinecap="round"/>
          <path d="M-16 -7 L-18.5 -11" stroke="#1a0e38" strokeWidth="2" strokeLinecap="round"/>
          <path d="M13 -13 L15 -16" stroke="#1a0e38" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 -7 L18.5 -11" stroke="#1a0e38" strokeWidth="2" strokeLinecap="round"/>
          <path d="M-12 12 Q0 17 12 12" fill="none" stroke="#d4a08a" strokeWidth="0.9" opacity="0.35"/>
        </g>

        {/* Eyebrows */}
        <path d="M158 166 Q170 160 188 164" fill="none" stroke="#9070b0" strokeWidth="2" strokeLinecap="round"/>
        <path d="M212 164 Q230 160 242 166" fill="none" stroke="#9070b0" strokeWidth="2" strokeLinecap="round"/>
      </g>

      {/* ═══ NOSE & MOUTH ═══ */}
      <g>
        <path d="M199 205 Q200 209 201 205" fill="none" stroke="#d4a08a" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Smile */}
        <path d="M190 222 Q195 228 200 228 Q205 228 210 222" fill="none" stroke="#d4789a" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Blush - soft circles */}
        <circle cx="160" cy="210" r="10" fill="url(#ec_cheek)"/>
        <circle cx="240" cy="210" r="10" fill="url(#ec_cheek)"/>
      </g>

      {/* ═══ WITCH HAT ═══ */}
      <g>
        {/* Brim */}
        <ellipse cx="200" cy="140" rx="78" ry="16" fill="#180c35" stroke="#2e1c70" strokeWidth="0.8"/>
        {/* Cone */}
        <path d="M148 140 Q140 105 152 70 Q165 40 192 22 Q197 18 200 16 Q203 18 208 22 Q235 40 248 70 Q260 105 252 140" fill="#180c35" stroke="#2e1c70" strokeWidth="0.5"/>
        {/* Hat band */}
        <path d="M146 137 Q200 146 254 137" fill="none" stroke="#c084fc" strokeWidth="4"/>
        {/* Star */}
        <g filter="url(#ec_glow)" transform="translate(200,22)">
          <polygon points="0,-10 3,-4 10,-4 4.5,1 6,8 0,4.5 -6,8 -4.5,1 -10,-4 -3,-4" fill="#fbbf24" opacity="0.92"/>
        </g>
        {/* Curl */}
        <path d="M192 22 Q185 15 182 10 Q180 6 183 4" fill="none" stroke="#2e1c70" strokeWidth="2" strokeLinecap="round"/>
        {/* Hat highlight */}
        <path d="M162 105 Q178 85 192 70" fill="none" stroke="white" strokeWidth="1.2" opacity="0.08"/>
      </g>

      {/* ═══ STAFF (right side) ═══ */}
      <g transform="translate(330, 60)">
        <line x1="0" y1="30" x2="0" y2="400" stroke="#7050a0" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="0" y1="30" x2="0" y2="400" stroke="#a080d0" strokeWidth="1.5" strokeLinecap="round" opacity="0.25"/>
        <circle cx="0" cy="22" r="20" fill="url(#ec_orb)" filter="url(#ec_softGlow)"/>
        <circle cx="0" cy="22" r="12" fill="#c084fc" opacity="0.7"/>
        <circle cx="0" cy="22" r="7" fill="#e0d0ff" opacity="0.5"/>
        <circle cx="-3" cy="18" r="3" fill="white" opacity="0.7"/>
        <path d="M-12 15 Q-6 6 0 4 Q6 6 12 15" fill="none" stroke="#8060b0" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M-3 398 L0 410 L3 398" fill="#7050a0"/>
      </g>

      {/* ═══ HANDS ═══ */}
      <g>
        <ellipse cx="315" cy="260" rx="8" ry="6.5" fill="url(#ec_skin)"/>
        <ellipse cx="148" cy="268" rx="7.5" ry="6" fill="url(#ec_skin)"/>
      </g>

      {/* ═══ SPARKLES ═══ */}
      <g filter="url(#ec_glow)" opacity="0.6">
        <circle cx="88" cy="145" r="2.5" fill="#fbbf24"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="320" cy="175" r="2" fill="#c084fc"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite"/></circle>
        <circle cx="72" cy="290" r="1.8" fill="#fbbf24"><animate attributeName="opacity" values="0.15;0.75;0.15" dur="3s" repeatCount="indefinite"/></circle>
        <circle cx="340" cy="320" r="2.2" fill="#a78bfa"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.6s" repeatCount="indefinite"/></circle>
        <circle cx="100" cy="410" r="1.5" fill="#f9a8d4"><animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" begin="0.5s"/></circle>
        <circle cx="300" cy="440" r="2" fill="#fbbf24"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.9s" repeatCount="indefinite" begin="1s"/></circle>
        <polygon points="80,210 82,205 84,210 80,206 84,206" fill="#fbbf24" opacity="0.5"><animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.3s" repeatCount="indefinite"/></polygon>
        <polygon points="325,255 327,250 329,255 325,251 329,251" fill="#c084fc" opacity="0.5"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.9s" repeatCount="indefinite" begin="0.4s"/></polygon>
      </g>
    </svg>
  );
}
