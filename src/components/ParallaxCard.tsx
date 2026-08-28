import { useRef, useState, type ReactNode } from "react";

/* ═══════════════════════════════════════════
   PARALLAX CARD — 3D depth layers on mouse move
   Each child layer gets different transform depth
   ═══════════════════════════════════════════ */

interface ParallaxCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // max degrees (default 15)
}

export function ParallaxCard({ children, className = "", intensity = 15 }: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * intensity;
    const rotateY = (x - 0.5) * intensity;

    setTransform({ rotateX, rotateY, scale: 1.03 });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
          transition: "transform 0.15s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * ParallaxLayer — wraps a child to move at a different depth
 * depth: -1 = far (moves less), 0 = mid, 1 = close (moves more)
 */
export function ParallaxLayer({
  children,
  depth = 0,
  className = "",
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  // depth 0 = base (no extra transform), ±1 = moves ±10px
  const z = depth * 30;

  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
