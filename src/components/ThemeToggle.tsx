import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Reads the current theme from <html> or localStorage. */
function getTheme(): "dark" | "light" {
  const stored = localStorage.getItem("scholaris-theme");
  if (stored === "light" || stored === "dark") return stored;
  // Respect system preference, but default to dark (obsidian)
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

/** Apply theme to <html> and persist. */
function applyTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("scholaris-theme", theme);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Sync on mount — runs only client-side
  useEffect(() => {
    const initial = getTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <Sun className="size-[18px] text-accent" />
      ) : (
        <Moon className="size-[18px] text-accent" />
      )}
    </Button>
  );
}
