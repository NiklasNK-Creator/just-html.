import { useEffect, useState } from "react";
import { Daystar, Nightmoon } from "@/components/icons/rune-icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("atelier-theme")) as
      | "dark"
      | "light"
      | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("atelier-theme", next); } catch { /* ignore */ }
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Kindle the daystar" : "Draw the night down"}
      title={theme === "dark" ? "Light" : "Dark"}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/40 text-cyan halo-cyan"
    >
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 animate-rune" aria-hidden />
      {theme === "dark" ? <Nightmoon size={16} /> : <Daystar size={16} />}
    </button>
  );
}
