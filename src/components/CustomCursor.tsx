import { useEffect, useRef } from "react";

/**
 * Custom cursor: a small dot + expanding ring.
 * Disabled entirely on touch / pointer:coarse devices.
 * No cursor:none is applied globally — only visible on desktop.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Bail on touch devices
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
      }
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("button, a, [role='button'], input, select, textarea, label")
      ) {
        ringRef.current?.classList.add("hovering");
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("button, a, [role='button'], input, select, textarea, label")
      ) {
        ringRef.current?.classList.remove("hovering");
      }
    };

    // Smooth ring follow (lerp)
    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    rafId = requestAnimationFrame(animate);

    // Hide system cursor on desktop only
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.id = "custom-cursor-hidden";
    style.textContent = "a, button, [role='button'], input, select, textarea, label { cursor: none !important; }";
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      cancelAnimationFrame(rafId);
      document.body.style.cursor = "";
      style.remove();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
