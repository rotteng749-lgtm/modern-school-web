import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // max tilt degrees (default 6)
  onClick?: () => void;
}

/**
 * 3D CSS card — applies subtle rotateX/rotateY on mouse move (desktop).
 * On mobile / touch devices: no tilt, just normal card.
 */
export function Card3D({ children, className, intensity = 6, onClick }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    // Only tilt on fine pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * intensity * 2;
    const rotateY = (x - 0.5) * intensity * 2;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.classList.add("tilt-active");
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className="card-3d-wrapper">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "card-3d rounded-xl border bg-card text-card-foreground",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
}
