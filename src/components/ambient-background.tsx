import { useEffect, useState } from "react";

// Pure-CSS "witch smoke" atmosphere plus rising cyan embers.
// No WebGL dependency — cheap, works on every device, respects reduced motion.
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
      {!reduced && (
        <div className="embers -z-10" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => {
            const left = (i * 7.13) % 100;
            const delay = (i * 1.3) % 12;
            const dur = 10 + ((i * 3.7) % 14);
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
