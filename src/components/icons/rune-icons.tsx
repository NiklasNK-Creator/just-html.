import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 24, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...rest,
});

// A witch's pentacle sigil — pentagram inside twin rings
export const RuneSigil = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="7.5" opacity="0.35" />
    <path d="M12 4.5 L19 17 L4.5 9.7 L19.5 9.7 L5 17 Z" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

// Dripping wax seal with cracked interior
export const WaxSealShape = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 2 C15 2 17 4 18 6 C21 7 22 10 21 13 C22 16 19 19 16 19 C14 22 10 22 8 19 C5 19 2 16 3 13 C2 10 3 7 6 6 C7 4 9 2 12 2 Z" />
    <path d="M12 7 L14 11 L12 15 L10 11 Z" opacity="0.55" />
    <path d="M12 15 L12 21" opacity="0.4" strokeDasharray="1 2" />
  </svg>
);

// Skeleton key with a rune bit
export const PadlockRune = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="8" cy="8" r="4" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <path d="M11 10 L20 19" />
    <path d="M17 16 L19 14" />
    <path d="M19 18 L21 16" />
    <path d="M15 18 L18 21" />
  </svg>
);

// Trusted witch — moth with sigil body
export const GildedRune = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 3 L12 21" opacity="0.7" />
    <path d="M12 6 C8 5 3 7 2 12 C4 14 8 14 12 12 Z" />
    <path d="M12 6 C16 5 21 7 22 12 C20 14 16 14 12 12 Z" />
    <path d="M12 12 C9 13 5 16 4 19 C7 19 10 17 12 15 Z" opacity="0.6" />
    <path d="M12 12 C15 13 19 16 20 19 C17 19 14 17 12 15 Z" opacity="0.6" />
    <circle cx="6" cy="10" r="0.8" fill="currentColor" stroke="none" opacity="0.7" />
    <circle cx="18" cy="10" r="0.8" fill="currentColor" stroke="none" opacity="0.7" />
    <circle cx="12" cy="4" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

// Crescent moon with orbit dots — dashboard
export const Astrolabe = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M16 4 A9 9 0 1 0 20 15 A7 7 0 0 1 16 4 Z" />
    <circle cx="4" cy="8" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="6" cy="20" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="19" cy="20" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="2" cy="14" r="0.6" fill="currentColor" stroke="none" opacity="0.6" />
  </svg>
);

// Open spellbook with pentacle
export const Grimoire = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3 5 L11 4 C11.5 4 12 4.3 12 4.9 L12 20 C12 20.5 11.5 20.8 11 20.8 L3 20 Z" />
    <path d="M21 5 L13 4 C12.5 4 12 4.3 12 4.9 L12 20 C12 20.5 12.5 20.8 13 20.8 L21 20 Z" />
    <path d="M12 4.9 L12 20" />
    <path d="M6 9 L9 9 M6 12 L9 12" opacity="0.6" />
    <path d="M15 9 L18 9 M15 12 L18 12" opacity="0.6" />
    <path d="M14.5 16 L17 14 L17.6 17 L15 17.5 L18 15.5 Z" opacity="0.7" />
  </svg>
);

// Bubbling cauldron — macros
export const Vial = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3 10 L21 10 L19 20 C18.8 20.6 18.3 21 17.7 21 L6.3 21 C5.7 21 5.2 20.6 5 20 Z" />
    <path d="M2 10 L22 10" />
    <path d="M8 6 C8 4 10 3 12 4 M14 6 C14 4 16 4 17 6" opacity="0.7" />
    <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none" opacity="0.8" />
    <circle cx="13" cy="16" r="0.5" fill="currentColor" stroke="none" opacity="0.6" />
    <circle cx="15" cy="13" r="0.4" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

// Chalice with rune eye — executors
export const Chalice = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M5 4 L19 4 C19 8 17 12 12 12 C7 12 5 8 5 4 Z" />
    <path d="M12 12 V19" />
    <path d="M8 21 L16 21 L16 19 L8 19 Z" />
    <path d="M9 7 Q12 5 15 7" opacity="0.6" />
    <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

// Rolled scroll with wax dot — tutorials
export const Scroll = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M7 3 L18 3 A3 3 0 0 1 21 6 L21 18 A3 3 0 0 1 18 21 L7 21 A3 3 0 0 1 4 18 L4 6 A3 3 0 0 1 7 3 Z" />
    <path d="M4 6 A2 2 0 0 1 6 4 M21 18 A2 2 0 0 1 19 20" opacity="0.5" />
    <path d="M8 8 L17 8 M8 11 L17 11 M8 14 L14 14" opacity="0.6" />
    <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

// Moth wing — sign-out / marginalia
export const MothWing = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 3 L12 21" />
    <path d="M12 5 C7 5 3 8 2 13 C5 14 9 13 12 11 Z" />
    <path d="M12 5 C17 5 21 8 22 13 C19 14 15 13 12 11 Z" />
    <path d="M12 11 C9 12 5 15 4 19 C7 19 10 17 12 15 Z" opacity="0.7" />
    <path d="M12 11 C15 12 19 15 20 19 C17 19 14 17 12 15 Z" opacity="0.7" />
    <circle cx="12" cy="4" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="6" cy="10" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
    <circle cx="18" cy="10" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

// Sun (light-mode) — witch's daystar
export const Daystar = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" />
    <path d="M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5" opacity="0.7" />
  </svg>
);

// Moon (dark-mode) — witch's night eye
export const Nightmoon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M20 14 A8 8 0 1 1 10 4 A6 6 0 0 0 20 14 Z" />
    <circle cx="16" cy="6" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="19" cy="10" r="0.5" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);
