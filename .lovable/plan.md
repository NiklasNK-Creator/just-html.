## Änderungen

### 1. Macro-Form vereinfachen (`src/routes/submit.tsx`)
- Macro bekommt dasselbe Schema wie Executor: nur **Titel**, **Description (Markdown)** und **Download-Link**.
- Banner-Toggle (Roblox/Custom) und Luau-Codefeld für Macro entfernen.
- Anzeige in `src/routes/post.$id.tsx`: Macro rendert wie Executor mit Download-Button, kein Code-Block, kein Ban-Risk-Dialog.

### 2. Dropdowns wirklich abrunden (`src/styles.css`)
- Aktuelle `select`-Styles überschreiben mit `border-radius: var(--radius-lg)` (o. ä.) und `!important` wo nötig, damit Browser-Defaults nicht durchschlagen.
- Alle shadcn `Select`-Trigger/Content über Component-Wrapper oder globale Klasse auf gleichen Radius ziehen.
- Chevron-Icon-Padding neu justieren, damit runde Ecken sauber wirken.

### 3. Mehr Motion & Atelier-Vibe
- `src/components/ambient-background.tsx`: zusätzliche Layer — langsam driftende Runenkreise (SVG mit `@keyframes rotate`), Parallax-Sternenstaub, sanftes Vignette-Flackern (Kerzenschein).
- Neue Utility-Klassen in `styles.css`: `.shimmer` (Gradient-Sweep über Cards), `.rune-pulse` (Icon-Puls), `.ink-reveal` (Text fades in wie Tinte).
- Cards (`browse`, `index`) bekommen Hover-Lift + Glow + Border-Shimmer.
- Buttons: Ripple/Glow on click, Icon-Micro-Bounce.
- Route-Transitions: `fade-in` + leichte Y-Translate über Root-`<Outlet />`-Wrapper.

### 4. „Addictive clean" Feeling
- Spacing/Rhythmus: konsistentere vertikale Skala, mehr Breathing-Room in Hero und Card-Grids.
- Sticky-Header mit Backdrop-Blur verstärken, dezente Border-Bottom-Glow.
- Micro-Interactions: Buttons, Tabs, Filter-Chips reagieren mit 150–250ms Easing.
- Dezent geräuschloser Grain-Overlay (SVG-Noise) für Papier-/Pergament-Touch in beiden Modi.

### 5. Markdown-Preview verbessern (`src/components/markdown.tsx`)
- Preview-Panel bekommt gleiche Typo-Skala + Prose-Styles wie Post-Detail (Headings, Lists, Blockquote, Code, Tables via `remark-gfm`).
- Syntax-Highlighting für Codeblocks (`rehype-highlight` oder `shiki`-light) mit Atelier-Farben.
- Live-Split-View-Option (Write | Preview nebeneinander) neben dem bestehenden Toggle.
- Sanfter Fade beim Umschalten Write↔Preview.
- Editor: Monospace-Font, Zeilenhöhe erhöht, Focus-Ring in Cyan.

## Technische Details
- Keine Schema-Migration nötig — Macro nutzt vorhandenes `key_link`-Feld als Download-Link (analog Executor).
- Neue Dependency: `rehype-highlight` + Highlight-CSS für Codeblöcke.
- Alle neuen Animationen als CSS-Keyframes/Utilities (kein neues JS-Framework); prefers-reduced-motion respektieren.
