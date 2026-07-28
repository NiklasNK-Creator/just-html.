import { useEffect, useState } from "react";

// Witch atelier atmosphere: aurora, smoke orbs, drifting rune circles,
// candle-flicker vignette, and rising cyan embers. All pure CSS/SVG.
export function AmbientBackground() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 aurora animate-aurora" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-20 smoke-orbs animate-smoke" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-10 parchment-grain opacity-[0.05] mix-blend-overlay" aria-hidden />

      {/* Drifting rune circles */}
      {!reduced && (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
          <RuneCircle className="absolute -left-40 top-10 h-[520px] w-[520px] animate-orbit opacity-[0.07]" />
          <RuneCircle
            className="absolute -right-52 bottom-0 h-[640px] w-[640px] animate-orbit opacity-[0.06]"
            style={{ animationDirection: "reverse", animationDuration: "90s" }}
          />
          <RuneCircle
            className="absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 animate-orbit opacity-[0.05]"
            style={{ animationDuration: "120s" }}
          />
        </div>
      )}

      {/* Candle-flicker vignette */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-flicker"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, color-mix(in oklch, var(--base) 55%, transparent) 85%, var(--base) 100%)",
        }}
        aria-hidden
      />

      {!reduced && (
        <div className="embers -z-10" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => {
            const left = (i * 5.71) % 100;
            const delay = (i * 1.1) % 14;
            const dur = 12 + ((i * 3.3) % 16);
            return (
              <span
                key={i}
                style={{ left: `${left}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function RuneCircle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} fill="none" stroke="currentColor" aria-hidden>
      <g className="text-cyan">
        <circle cx="100" cy="100" r="96" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="80" strokeWidth="0.3" strokeDasharray="1 4" />
        <circle cx="100" cy="100" r="60" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="44" strokeWidth="0.3" strokeDasharray="0.5 3" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 12;
          const x1 = 100 + Math.cos(a) * 60;
          const y1 = 100 + Math.sin(a) * 60;
          const x2 = 100 + Math.cos(a) * 96;
          const y2 = 100 + Math.sin(a) * 96;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.3" />;
        })}
        {/* Pentacle */}
        <polygon
          points="100,52 128,140 54,86 146,86 72,140"
          strokeWidth="0.4"
        />
        {/* Small glyph dots */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 8 + 0.2;
          const cx = 100 + Math.cos(a) * 80;
          const cy = 100 + Math.sin(a) * 80;
          return <circle key={i} cx={cx} cy={cy} r="0.9" fill="currentColor" />;
        })}
      </g>
    </svg>
  );
}
