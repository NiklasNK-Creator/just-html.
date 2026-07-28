import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 24, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...rest,
});

export const RuneSigil = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3 L12 21 M3 12 L21 12" opacity="0.4" />
    <path d="M12 5 L19 12 L12 19 L5 12 Z" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

export const WaxSealShape = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 2 L17 4 L21 8 L21 16 L17 20 L12 22 L7 20 L3 16 L3 8 L7 4 Z" />
    <circle cx="12" cy="12" r="4" opacity="0.5" />
  </svg>
);

export const PadlockRune = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="5" y="10" width="14" height="10" rx="1.5" />
    <path d="M8 10 V7 a4 4 0 0 1 8 0 v3" />
    <path d="M12 14 v2" />
    <circle cx="12" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export const GildedRune = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 2 L22 8 L18 20 L6 20 L2 8 Z" />
    <path d="M12 6 L18 10 L15.5 18 L8.5 18 L6 10 Z" opacity="0.5" />
    <path d="M12 10 L14 14 L10 14 Z" fill="currentColor" stroke="none" />
  </svg>
);

export const Astrolabe = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" opacity="0.5" />
    <path d="M3 12 h18 M12 3 v18" opacity="0.4" />
    <path d="M6 6 L18 18 M18 6 L6 18" opacity="0.3" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const Grimoire = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 4 h13 a3 3 0 0 1 3 3 v13 a1 1 0 0 1 -1 1 H6 a2 2 0 0 1 -2 -2 Z" />
    <path d="M4 18 a2 2 0 0 1 2 -2 h14" />
    <path d="M9 8 L15 8 M9 11 L13 11" opacity="0.6" />
    <circle cx="12" cy="14" r="0.8" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

export const Vial = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M9 2 h6 M10 2 v8 a5 5 0 1 0 4 0 V2" />
    <path d="M9 15 a5 5 0 0 0 6 0" opacity="0.5" />
    <circle cx="11" cy="17" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="13" cy="15" r="0.4" fill="currentColor" stroke="none" />
  </svg>
);

export const Chalice = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M5 4 h14 v3 a7 7 0 0 1 -7 7 a7 7 0 0 1 -7 -7 Z" />
    <path d="M12 14 v6" />
    <path d="M8 20 h8" />
    <path d="M8 7 h8" opacity="0.5" />
  </svg>
);

export const Scroll = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 3 h11 a3 3 0 0 1 3 3 v12 a3 3 0 0 1 -3 3 H7 a3 3 0 0 1 -3 -3 V6 a3 3 0 0 1 3 -3 Z" />
    <path d="M4 6 a2 2 0 0 0 2 -2 M20 18 a2 2 0 0 1 -2 2" opacity="0.5" />
    <path d="M9 9 h6 M9 12 h6 M9 15 h4" opacity="0.6" />
  </svg>
);

export const MothWing = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 4 v16" />
    <path d="M12 6 C8 6 4 8 3 12 C4 14 8 14 12 12 Z" />
    <path d="M12 6 C16 6 20 8 21 12 C20 14 16 14 12 12 Z" />
    <path d="M12 12 C9 13 5 15 4 18 C7 18 10 16 12 14 Z" opacity="0.7" />
    <path d="M12 12 C15 13 19 15 20 18 C17 18 14 16 12 14 Z" opacity="0.7" />
  </svg>
);
