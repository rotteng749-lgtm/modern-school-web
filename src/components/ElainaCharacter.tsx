/* ═══════════════════════════════════════════
   ELAINA CHARACTER — Original anime witch SVG
   Pure CSS/SVG art, no copyrighted assets
   Inspired by generic "cute witch" archetype
   ═══════════════════════════════════════════ */

export function ElainaCharacter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Anime witch character illustration"
    >
      <defs>
        {/* Hair gradient */}
        <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8e0f0" />
          <stop offset="50%" stopColor="#d4c4e8" />
          <stop offset="100%" stopColor="#b8a0d4" />
        </linearGradient>
        {/* Skin */}
        <radialGradient id="skin" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#ffe8d6" />
          <stop offset="100%" stopColor="#f5d5c0" />
        </radialGradient>
        {/* Eye gradient */}
        <radialGradient id="eyeL" cx="0.4" cy="0.35" r="0.5">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <radialGradient id="eyeR" cx="0.4" cy="0.35" r="0.5">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        {/* Hat gradient */}
        <linearGradient id="hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1040" />
          <stop offset="100%" stopColor="#2d1b69" />
        </linearGradient>
        {/* Cape gradient */}
        <linearGradient id="cape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1040" />
          <stop offset="40%" stopColor="#2d1b69" />
          <stop offset="100%" stopColor="#3b2296" />
        </linearGradient>
        {/* Staff orb glow */}
        <radialGradient id="orbGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        {/* Star glow */}
        <filter id="starGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── CAPE (back layer) ── */}
      <g opacity="0.9">
        {/* Left cape wing */}
        <path
          d="M140 200 Q100 260 80 360 Q90 400 130 420 Q150 380 160 340 Q165 300 160 260 Z"
          fill="url(#cape)"
          stroke="#4c1d95"
          strokeWidth="0.5"
        />
        {/* Right cape wing */}
        <path
          d="M260 200 Q300 260 320 360 Q310 400 270 420 Q250 380 240 340 Q235 300 240 260 Z"
          fill="url(#cape)"
          stroke="#4c1d95"
          strokeWidth="0.5"
        />
        {/* Cape inner lining hint */}
        <path
          d="M140 200 Q100 260 80 360 Q90 400 130 420 Q140 390 148 350"
          fill="none"
          stroke="#6d28d9"
          strokeWidth="1"
          opacity="0.4"
        />
        <path
          d="M260 200 Q300 260 320 360 Q310 400 270 420 Q260 390 252 350"
          fill="none"
          stroke="#6d28d9"
          strokeWidth="1"
          opacity="0.4"
        />
      </g>

      {/* ── BODY / DRESS ── */}
      <g>
        {/* Dress body */}
        <path
          d="M170 220 Q165 260 155 320 Q150 360 140 420 L260 420 Q250 360 245 320 Q235 260 230 220 Z"
          fill="#1e1040"
          stroke="#4c1d95"
          strokeWidth="0.5"
        />
        {/* Dress top / collar area */}
        <path
          d="M175 210 Q180 220 200 225 Q220 220 225 210 L230 220 Q235 260 245 300 L155 300 Q165 260 170 220 Z"
          fill="#2d1b69"
        />
        {/* Collar / ribbon */}
        <path
          d="M185 215 Q200 225 215 215"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Bow at collar */}
        <path
          d="M195 218 Q188 212 185 218 Q188 224 195 218"
          fill="#c084fc"
        />
        <path
          d="M205 218 Q212 212 215 218 Q212 224 205 218"
          fill="#c084fc"
        />
        <circle cx="200" cy="218" r="2" fill="#a855f7" />
        {/* Belt */}
        <rect x="160" y="290" width="80" height="5" rx="2" fill="#4c1d95" />
        <circle cx="200" cy="292" r="4" fill="#a78bfa" opacity="0.8" />
      </g>

      {/* ── HAIR (back) ── */}
      <g>
        {/* Long flowing hair back */}
        <path
          d="M145 165 Q130 200 125 280 Q122 340 130 400 Q135 420 140 430"
          fill="url(#hair)"
          stroke="#b8a0d4"
          strokeWidth="0.5"
          opacity="0.8"
        />
        <path
          d="M255 165 Q270 200 275 280 Q278 340 270 400 Q265 420 260 430"
          fill="url(#hair)"
          stroke="#b8a0d4"
          strokeWidth="0.5"
          opacity="0.8"
        />
        {/* Hair flowing strands */}
        <path
          d="M140 300 Q135 350 138 400"
          fill="none"
          stroke="#c4b0e0"
          strokeWidth="1"
          opacity="0.5"
        />
        <path
          d="M260 300 Q265 350 262 400"
          fill="none"
          stroke="#c4b0e0"
          strokeWidth="1"
          opacity="0.5"
        />
      </g>

      {/* ── HEAD / FACE ── */}
      <g>
        {/* Face shape */}
        <ellipse cx="200" cy="170" rx="48" ry="55" fill="url(#skin)" />
        {/* Chin refinement */}
        <path
          d="M162 185 Q165 215 200 228 Q235 215 238 185"
          fill="url(#skin)"
        />
      </g>

      {/* ── HAIR (front) ── */}
      <g>
        {/* Bangs */}
        <path
          d="M155 155 Q155 130 175 120 Q190 115 200 118 Q210 115 225 120 Q245 130 245 155"
          fill="url(#hair)"
          stroke="#b8a0d4"
          strokeWidth="0.5"
        />
        {/* Side hair left */}
        <path
          d="M152 155 Q148 175 145 200 Q142 225 140 245 Q138 230 140 210 Q143 185 148 165"
          fill="url(#hair)"
          stroke="#b8a0d4"
          strokeWidth="0.5"
        />
        {/* Side hair right */}
        <path
          d="M248 155 Q252 175 255 200 Q258 225 260 245 Q262 230 260 210 Q257 185 252 165"
          fill="url(#hair)"
          stroke="#b8a0d4"
          strokeWidth="0.5"
        />
        {/* Bangs detail strands */}
        <path
          d="M170 135 Q172 150 168 170"
          fill="none"
          stroke="#c4b0e0"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <path
          d="M190 128 Q192 145 188 165"
          fill="none"
          stroke="#c4b0e0"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <path
          d="M210 128 Q208 145 212 165"
          fill="none"
          stroke="#c4b0e0"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <path
          d="M230 135 Q228 150 232 170"
          fill="none"
          stroke="#c4b0e0"
          strokeWidth="0.8"
          opacity="0.6"
        />
        {/* Hair highlight / shine */}
        <path
          d="M175 125 Q185 120 195 122"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M210 122 Q220 120 230 125"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>

      {/* ── EYES ── */}
      <g>
        {/* Left eye */}
        <g transform="translate(180, 172)">
          {/* Eye white */}
          <ellipse cx="0" cy="0" rx="12" ry="14" fill="white" />
          {/* Iris */}
          <ellipse cx="1" cy="1" rx="9" ry="11" fill="url(#eyeL)" />
          {/* Pupil */}
          <ellipse cx="1" cy="2" rx="4" ry="5" fill="#1e1040" />
          {/* Eye shine (top) */}
          <ellipse cx="-3" cy="-3" rx="3" ry="2.5" fill="white" opacity="0.9" />
          {/* Eye shine (bottom small) */}
          <ellipse cx="3" cy="3" rx="1.5" ry="1" fill="white" opacity="0.6" />
          {/* Upper eyelid line */}
          <path
            d="M-12 -5 Q-6 -14 0 -14 Q6 -14 12 -5"
            fill="none"
            stroke="#2d1b69"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Eyelashes */}
          <path d="M-12 -5 L-14 -8" stroke="#2d1b69" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 -5 L14 -8" stroke="#2d1b69" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        {/* Right eye */}
        <g transform="translate(220, 172)">
          <ellipse cx="0" cy="0" rx="12" ry="14" fill="white" />
          <ellipse cx="1" cy="1" rx="9" ry="11" fill="url(#eyeR)" />
          <ellipse cx="1" cy="2" rx="4" ry="5" fill="#1e1040" />
          <ellipse cx="-3" cy="-3" rx="3" ry="2.5" fill="white" opacity="0.9" />
          <ellipse cx="3" cy="3" rx="1.5" ry="1" fill="white" opacity="0.6" />
          <path
            d="M-12 -5 Q-6 -14 0 -14 Q6 -14 12 -5"
            fill="none"
            stroke="#2d1b69"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M-12 -5 L-14 -8" stroke="#2d1b69" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 -5 L14 -8" stroke="#2d1b69" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Eyebrows */}
        <path
          d="M167 155 Q175 150 188 153"
          fill="none"
          stroke="#8b6cb0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M213 153 Q226 150 234 155"
          fill="none"
          stroke="#8b6cb0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* ── NOSE & MOUTH ── */}
      <g>
        {/* Nose */}
        <path
          d="M199 185 Q200 188 201 185"
          fill="none"
          stroke="#d4a08a"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Mouth - gentle smile */}
        <path
          d="M192 198 Q197 204 200 204 Q203 204 208 198"
          fill="none"
          stroke="#d4789a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Blush */}
        <ellipse cx="168" cy="190" rx="8" ry="4" fill="#f9a8d4" opacity="0.35" />
        <ellipse cx="232" cy="190" rx="8" ry="4" fill="#f9a8d4" opacity="0.35" />
      </g>

      {/* ── WITCH HAT ── */}
      <g>
        {/* Hat brim */}
        <ellipse cx="200" cy="130" rx="65" ry="12" fill="url(#hat)" stroke="#4c1d95" strokeWidth="0.5" />
        {/* Hat cone */}
        <path
          d="M160 130 Q155 100 165 70 Q175 45 195 30 Q198 28 200 27 Q202 28 205 30 Q225 45 235 70 Q245 100 240 130"
          fill="url(#hat)"
          stroke="#4c1d95"
          strokeWidth="0.5"
        />
        {/* Hat band */}
        <path
          d="M158 128 Q200 135 242 128"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="3"
        />
        {/* Hat buckle */}
        <rect x="193" y="122" width="14" height="10" rx="2" fill="#c084fc" stroke="#7c3aed" strokeWidth="1" />
        <rect x="197" y="124" width="6" height="6" rx="1" fill="none" stroke="#7c3aed" strokeWidth="0.5" />

        {/* Star on hat tip */}
        <g filter="url(#starGlow)" transform="translate(200, 30)">
          <polygon
            points="0,-8 2.5,-3 8,-3 3.5,1 5,7 0,3.5 -5,7 -3.5,1 -8,-3 -2.5,-3"
            fill="#fbbf24"
            opacity="0.9"
          />
        </g>

        {/* Hat tip curl */}
        <path
          d="M195 30 Q188 25 185 20 Q183 16 186 14"
          fill="none"
          stroke="#4c1d95"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* ── STAFF ── */}
      <g transform="translate(310, 100)">
        {/* Staff pole */}
        <line x1="0" y1="30" x2="0" y2="320" stroke="#8b6cb0" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="30" x2="0" y2="320" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        {/* Staff top ornament */}
        <circle cx="0" cy="25" r="18" fill="url(#orbGlow)" filter="url(#softGlow)" />
        <circle cx="0" cy="25" r="10" fill="#c084fc" opacity="0.8" />
        <circle cx="0" cy="25" r="6" fill="#e9d5ff" opacity="0.6" />
        <circle cx="-2" cy="22" r="2.5" fill="white" opacity="0.8" />
        {/* Staff prongs */}
        <path d="M-12 18 Q-8 10 0 8 Q8 10 12 18" fill="none" stroke="#8b6cb0" strokeWidth="2" strokeLinecap="round" />
        {/* Staff bottom tip */}
        <path d="M-3 318 L0 330 L3 318" fill="#8b6cb0" />
      </g>

      {/* ── HANDS ── */}
      <g>
        {/* Left hand holding staff area */}
        <ellipse cx="295" cy="240" rx="8" ry="6" fill="url(#skin)" />
        {/* Right hand */}
        <ellipse cx="155" cy="250" rx="7" ry="6" fill="url(#skin)" />
      </g>

      {/* ── BOOTS ── */}
      <g>
        {/* Left boot */}
        <path
          d="M155 415 Q152 430 148 445 Q145 455 140 458 L170 458 Q172 450 170 440 Q168 430 165 415"
          fill="#2d1b69"
          stroke="#4c1d95"
          strokeWidth="0.5"
        />
        {/* Right boot */}
        <path
          d="M235 415 Q238 430 242 445 Q245 455 250 458 L220 458 Q218 450 220 440 Q222 430 225 415"
          fill="#2d1b69"
          stroke="#4c1d95"
          strokeWidth="0.5"
        />
        {/* Boot buckles */}
        <rect x="152" y="435" width="12" height="4" rx="1" fill="#a78bfa" opacity="0.6" />
        <rect x="236" y="435" width="12" height="4" rx="1" fill="#a78bfa" opacity="0.6" />
      </g>

      {/* ── MAGIC SPARKLES around character ── */}
      <g filter="url(#starGlow)" opacity="0.7">
        <circle cx="120" cy="150" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="290" cy="180" r="1.5" fill="#c084fc">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="280" r="1.5" fill="#fbbf24">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="310" cy="300" r="2" fill="#a78bfa">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="130" cy="350" r="1" fill="#f9a8d4">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="275" cy="380" r="1.5" fill="#fbbf24">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" begin="1s" />
        </circle>

        {/* Small star decorations */}
        <polygon
          points="105,200 107,196 109,200 105,197 109,197"
          fill="#fbbf24"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite" />
        </polygon>
        <polygon
          points="295,250 297,246 299,250 295,247 299,247"
          fill="#c084fc"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" begin="0.3s" />
        </polygon>
      </g>
    </svg>
  );
}
