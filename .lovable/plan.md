
## Ziel
Seite deutlich dunkler & atmosphärischer, mit Theme-Toggle, echten Witch-Atelier-Icons, mehr Motion/WebGL-Vibe, korrekten Bezeichnungen ("Luau"), Executor/Tutorial nur für Admins, Bannrisiko-Warnung bei Scripts, funktionierendem Dashboard-Link und aktualisierten Buttons/Dropdowns.

## Änderungen

### 1. Theme & Farben (`src/styles.css`)
- Basis noch dunkler: `--base` auf ~`oklch(0.09 0.02 240)` (fast schwarz mit kaltem Stich), `--surface` auf `oklch(0.13 0.02 235)`, `--border` gedämpfter.
- Akzente (cyan/sky/moss) bleiben, aber nur für Details/Ränder/Glows.
- Neuer **Light-Mode** unter `.light` Root-Klasse: warmes Pergament (`--base` cremeweiß, `--ink` tief-tinte, cyan/moss bleiben als Akzent). Toggle setzt Klasse auf `<html>` und persistiert in `localStorage`.
- Dropdowns/Inputs: `border-radius: var(--radius-lg)` (10px) statt eckig, weiche innere Border, leichter Cyan-Focusring.
- Buttons global: neue Utilities `btn-ghost`, `btn-soft`, `btn-arcane` — alle mit runder Kante + Halo statt harter Flächen.

### 2. Theme-Toggle
- Neue Komponente `src/components/theme-toggle.tsx`: Sun/Moon (bespoke SVG — Mondsichel mit Sternenpunkten / Sonnen-Rune), toggelt `.light` auf `document.documentElement`, speichert in `localStorage`, initial via kleinem Inline-Script im `__root.tsx` `head()` gegen FOUC.
- Platzierung: im `SiteShell`-Header rechts neben Dashboard.

### 3. Header / Buttons konsistent aktualisieren
- `site-shell.tsx`: **Dashboard-Link Bug fixen** — aktuell `<Link to="/dashboard">`, prüfen und sicherstellen dass Route registriert ist / Klasse `halo-cyan` nicht Klick blockiert. Falls Route funktioniert, ist es evtl. reiner Style/z-index; explizit als `btn-soft` Button gestalten.
- Alle noch nicht aktualisierten Buttons (Home-Tiles, Post-Card CTA, Auth-Formular Submit, Submit-Formular Buttons, Dashboard-Tabs, Admin-Aktions-Buttons) auf neue Button-Utilities umstellen — dunkler Grund, cyan Border/Glow als Detail, keine großen cyan Flächen.

### 4. Icons neu — echt Witch-Atelier
`src/components/icons/rune-icons.tsx` neu zeichnen, weniger generisch:
- `Astrolabe` → **Pentagram-in-Circle mit Wachs-Tropfen**
- `RuneSigil` → **Auge in Dreieck mit Strahlen** (Sigil)
- `Grimoire` → aufgeschlagenes Buch mit Rune-Seite + Lesebändchen
- `Vial` → bauchiger Kolben mit brodelndem Dampf-Kringel
- `Scroll` → gerollte Pergamentrolle mit hängendem Siegel
- `Chalice` → Kelch mit brennender Flamme
- `PadlockRune` → verschnörkeltes Vorhängeschloss mit Rune-Bogen
- `GildedRune` → verwobene Triqueta
- `WaxSealShape` → organischer, unregelmäßiger Wachsklecks (kein sauberes Polygon)
- `MothWing` → detailliertere Motte mit Augenfleck-Muster
- Neu: `Moon`, `Sun`, `Candle`, `Feather`

### 5. Animierter WebGL-Hintergrund
- Neue Komponente `src/components/atelier-canvas.tsx`: kleiner WebGL-Shader (regl-frei, plain WebGL2 fragment shader) mit **driftendem Rauch/Aurora + subtile Kerzenlicht-Flackern-Blobs**, geringe Opazität, `pointer-events:none`, `<ClientOnly>` in `SiteShell`.
- WebGL-Support-Check → Fallback auf bestehende CSS-Aurora.
- Zusätzlich CSS-Layer: driftende Staubpartikel (SVG animiert) + Vignette.

### 6. Mehr Motion (motion/react)
- Card-Hover: leichter tilt + intensivere cyan Halo-Pulsation.
- Route-Wechsel: fade + 8px slide-up via `AnimatePresence` im `__root`.
- Wax-Seal Vote: bestehende `seal-burst` verstärkt (4 SVG-Funken die rausfliegen).
- Header-Nav Underline: sliding indicator mit `layoutId`.
- Empty States: pulsierendes Sigil + langsam auf-/absteigende Rune-Symbole.

### 7. Text-Copy entschärfen
- „Corny" Sprache reduzieren: „candle-lit grimoire of Lua…" → knapper, ruhiger („A dark archive of Luau for Roblox. Scripts, macros, executors, tutorials.").
- Alle Vorkommen **„Lua" → „Luau"** in UI-Copy (Titel, Beschreibungen, Meta-Descriptions, Placeholder). Datenbank-Feld/Variablen (`luaContent`) bleiben — nur UI-Text.
- „Inscribe" → „Upload", „Bound in cyan & moss" Footer knapper, weniger Adjektive.

### 8. Zugriffsregeln für Kinds
- **Tutorial** und **Executor** dürfen nur von Admins erstellt werden. Aktuell nur Executor.
- `src/lib/posts.functions.ts` `createPost`: Server-Check erweitern — wenn `kind in ('executor','tutorial')` → `has_role('admin')` prüfen.
- Migration: RLS `posts INSERT` Policy `WITH CHECK` erweitert auf beide Kinds.
- Submit-UI (`submit.tsx`): Kind-Dropdown blendet Tutorial/Executor aus wenn kein Admin, mit Hinweis „Nur Admins".

### 9. Bann-Risiko-Popup bei Scripts
- Neue Komponente `src/components/ban-risk-dialog.tsx` (shadcn Dialog): erscheint beim **ersten Besuch von `/browse/script` oder eines Script-Post-Details**, Flag in `localStorage` (`atelier.banRiskAck.v1`).
- Text: knapp und ernst — „Die Verwendung von Scripts in Roblox kann zu Account-Bann führen. Du nutzt sie auf eigenes Risiko."
- Button „Verstanden" schließt und setzt Flag.

### 10. DB Migration (dieses Project)
- Neue Migration im aktuellen Cloud-Project applizieren:
  - Schema aus `plan.md` (falls noch nicht vorhanden): profiles, user_roles, games, posts, post_votes, enums, `has_role`, `handle_new_user`, Score-Trigger, GRANTs, RLS.
  - INSERT Policy für `posts`: `WITH CHECK (kind NOT IN ('executor','tutorial') OR has_role(auth.uid(),'admin'))`.
  - Seed-Rows (2–3 Scripts, 1 Macro, 1 Executor, 1 Tutorial) als literale INSERTs damit die Seiten nicht leer wirken.
- Falls Cloud noch nicht aktiv: erst `supabase--enable`, dann Migration.

### 11. Tutorial- & Executor-Seiten differenzieren
Da dort wenig Content sein wird:
- `/browse/executor`: kein Grid, statt dessen **große Detail-Karten in einer Spalte** mit Version, Download-Button, „Verified by admin"-Banner (GildedRune), grüne Moss-Border.
- `/browse/tutorial`: **magazin-artige Liste** (linkes Icon + Titel + langer Auszug), keine Banner-Bilder — wirkt bibliothekarisch statt Grid.
- Gemeinsame `<BrowseShell>`-Route (`browse.$kind.tsx`) rendert bedingt `<ExecutorList>` / `<TutorialList>` / `<PostGrid>`.

### 12. Dashboard-Button-Fix (konkret)
- Vermutung: `<Link to="/dashboard">` funktioniert; falls nach Klick nichts passiert, prüfen ob `Dashboard`-Route Guards blockieren oder ob `me` initial `undefined` einen `<Navigate>`-Loop macht.
- Falls Loop: `useMe` `isLoading` abwarten und **erst dann** navigieren; sonst redirect `/auth`.
- Sicherstellen dass Link ein echter Router-Link mit `to`-Prop bleibt und keine überliegende Fläche Clicks abfängt.

## Technischer Bereich
- Keine neuen Deps außer ggf. `motion` (falls noch nicht drin). WebGL via plain API, kein three.js.
- WebGL-Shader klein halten (~40 Zeilen GLSL), Frame-Rate throttled auf 30fps via `requestAnimationFrame` + Skip.
- Theme-Toggle FOUC-Vermeidung via `<script>` in `__root.tsx` `head().scripts`, das vor Hydration `localStorage.getItem('atelier.theme')` liest.
- Migration in einer einzigen SQL-Datei, inkl. GRANTs für `authenticated`/`anon`/`service_role`.
- Alle Files nur Frontend + Migration; Business-Logik-Change nur Server-Check + Policy für tutorial/executor.

## Baureihenfolge
1. Migration + Cloud-Check
2. Icons neu zeichnen
3. Farbtokens dunkler + Light-Mode + Radius + Dropdown-Styles
4. Theme-Toggle + FOUC-Script
5. WebGL-Canvas Hintergrund + Fallback
6. SiteShell/Header inkl. Dashboard-Fix, alle Buttons auf neue Utilities
7. Home / Post-Card / Auth / Submit / Dashboard Texte + Buttons + „Luau"
8. Tutorial/Admin-Check server + UI
9. Executor- und Tutorial-Layout differenzieren
10. Ban-Risk-Dialog
11. Motion-Polish (route transitions, hover, seal burst)
