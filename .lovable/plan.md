
# Atelier Archive — Build Plan

A mystical, candlelit-atelier hub where the community shares Lua scripts, macros, executors, and tutorials for Roblox games. Guests browse and download; signed-in users upload and react; admins moderate and publish executors.

## Visual identity

**Palette — cyan / light-blue / light-green arcane glow on deep night:**
- `--base`  deep midnight `oklch(0.16 0.03 230)` (near-black with a cool blue cast)
- `--surface` `oklch(0.21 0.03 220)`
- `--border` `oklch(0.32 0.04 210)`
- `--ink` `oklch(0.94 0.02 190)` (soft cyan-white body text)
- `--faded` `oklch(0.66 0.03 200)`
- `--cyan` `oklch(0.82 0.14 205)` — primary accent (runes, links, active state)
- `--sky`  `oklch(0.86 0.09 230)` — secondary accent (icons, glows)
- `--moss` `oklch(0.83 0.15 165)` — tertiary accent (trusted badge, upvote seal)
- `--wax`  `oklch(0.78 0.16 175)` — downvote / warning-cool

**Typography** (loaded via `<link>` in `__root.tsx`): Crimson Pro (serif display, italic titles), Inter (sans body).

**Iconography — bespoke SVG first, Lucide second.** Ship a small in-house set under `src/components/icons/` built as React SVG components with `currentColor`:
- `RuneSigil` (six-point star inside a circle) — brand mark
- `WaxSeal` (organic 10-point polygon w/ inner ring) — upvote/downvote button chrome
- `PadlockRune` — key-required indicator
- `GildedRune` — trusted uploader badge (interlocking triangles)
- `Astrolabe` — dashboard mark
- `Grimoire` — scripts tab
- `Vial` — macros tab
- `Chalice` — executors tab
- `Scroll` — tutorials tab
- `MothWing` — decorative marginalia
Everything else (search, chevrons, close, upload, ban, trash, edit) comes from **lucide-react**. **No emoji anywhere in UI copy**; if a glyph is needed inline it's an SVG. Roman-numeral counts stay (they're type, not emoji).

**Magical effects:**
- Ambient candle-glow radial gradient overlay swapped for a slow-drifting cyan-to-moss aurora at the top; SVG grain overlay for parchment feel
- Hover on cards emits a soft cyan halo (`box-shadow: 0 0 40px -6px var(--cyan)/40`) and border shifts cyan
- Wax-seal upvote animation: press → scale 1.15 with a burst of 4 short cyan stroke-lines fanning out (SVG, motion), then settle to 1.0
- Route/tab transitions: cross-fade + 1px cyan underline sliding beneath the active tab
- Rune sigils on empty states pulse a slow luminous breathing at 3s intervals
- Cursor-follow parallax on the aurora, throttled
- Card mount: `paper-in` (opacity 0→1, y 10→0, rotate ±0.4deg), staggered 40ms
- All motion via **motion/react**, timings 200–500ms, no springy overshoot

Ported from the chosen "Atelier Archive" direction: composition (top header, left codex sidebar, ornate search cartouche, 2-col post grid, sticky sidebar), wax-seal vote chrome, Crimson Pro italic titles, gilded-rune trust badge, padlock key-required chip. Only the palette and iconography change.

## Routes (TanStack Start)

```
src/routes/
  __root.tsx                       header + font links + aurora overlay + Outlet
  index.tsx                        redirects to /scripts
  scripts.tsx                      main browse (default tab)
  macros.tsx
  executors.tsx
  tutorials.tsx
  post.$id.tsx                     public post detail (Lua viewer, download, votes)
  auth.tsx                         sign-in / sign-up (email+password + Google)
  _authenticated/route.tsx         integration-managed gate
  _authenticated/upload.tsx        upload flow (game-ID fetch, form)
  _authenticated/dashboard.tsx     my uploads, my votes
  _authenticated/admin.tsx         admin-only: ban/unban, role edit, delete
  api/public/roblox-game.$id.ts    optional cached fetch endpoint
```

Each browse tab shares one `<BrowseShell>` component: sidebar codex index (auto-generated Roblox game categories with counts), search cartouche, filter chips (Latest, Most Reacted, Trusted, Key-System, Keyless), post grid. Active tab and filter chip use the cyan underline + halo.

## Data model (Lovable Cloud)

One migration creates schema, GRANTs, RLS, triggers, and demo seed rows:

- `app_role` enum: `admin`, `trusted`, `user`
- `post_kind` enum: `script`, `macro`, `executor`, `tutorial`
- `profiles(id → auth.users, username, avatar_url, banned_at, banned_reason)` — auto-created via `handle_new_user()` trigger
- `user_roles(id, user_id, role)` — separate table, `has_role()` security-definer function
- `games(id, roblox_game_id bigint UNIQUE nullable, name, banner_url, description, indexed_at)`
- `posts(id, kind, title, description, game_id nullable, custom_banner_url nullable, key_system boolean, key_link nullable, lua_content text, author_id, created_at, updated_at, deleted_at)`
- `post_votes(post_id, user_id, value smallint check in (-1,1), PK(post_id,user_id))`
- `posts.score` maintained via trigger on `post_votes`

RLS:
- `posts` — public SELECT where `deleted_at IS NULL`; INSERT by authenticated non-banned users; executors require `has_role('admin')` in the `WITH CHECK`; UPDATE/DELETE by author or admin
- `post_votes` — INSERT/UPDATE/DELETE by owner; SELECT authenticated
- `user_roles` — SELECT authenticated; admin-only writes
- `games` — SELECT public; INSERT by authenticated; UPDATE by admin
- `profiles` — SELECT public; UPDATE own; admin updates `banned_at`

Storage bucket `banners` (public) for custom banner uploads. Lua stored as text on `posts`.

## Server functions

- `fetchRobloxGame({ gameId })` — public, calls Roblox `games.roblox.com/v1/games` + `thumbnails.roblox.com/v1/games/icons`, caches to `games` (24h `indexed_at`), returns `{ name, description, banner_url }`
- `createPost` — auth-required; executor kind requires admin role in server-side check
- `votePost({ postId, value })` — auth-required upsert
- `listPosts({ kind, sort, filters, search, gameId })` — public, via server publishable client
- Admin: `banUser`, `unbanUser`, `setRole`, `deletePost` — auth + `has_role('admin')`

Public routes read via `ensureQueryData` + `useSuspenseQuery`; protected calls via `useServerFn` under the managed `_authenticated/` gate. Zod validates every input (title ≤200, description ≤2000, Lua ≤500KB, key_link is URL).

## Auth

Email/password + Google (via `lovable.auth.signInWithOAuth('google', …)`) on public `/auth`. Header shows "Sign In" text link when signed out; when signed in, a `RuneSigil` avatar dropdown (Dashboard, Admin if role, Sign out). Root `onAuthStateChange` filtered to SIGNED_IN/SIGNED_OUT/USER_UPDATED. Sign-out follows cache-teardown hygiene.

Access matrix:
- Guest: read + download + copy Lua
- Signed-in: also upload scripts/macros/tutorials + vote
- Admin: also upload executors + moderate

## Search & filters

- Debounced search bar; queries `title` / `description` / game name / category, scoped to the current tab's `kind`
- Filter chips write to URL search params (`validateSearch` + `fallback`): `sort` (latest | top), `trusted`, `key` (any | required | none)
- Sidebar "Codex Index" lists games (via `has post of this kind` count) for the current tab; clicking narrows to that game

## SEO / head metadata

Every route defines its own `head()`:
- `/scripts` — "Scripts — Atelier Archive"
- `/macros` — "Macros — Atelier Archive"
- `/executors` — "Executors — Atelier Archive"
- `/tutorials` — "Tutorials — Atelier Archive"
- `/post/$id` — post title + description; og:image = banner URL

Root drops the "Lovable App" placeholder.

## Technical notes

- Tailwind v4 tokens in `src/styles.css` under `@theme`; `wax-seal` clip-path and `aurora-drift` keyframes as `@utility`/`@keyframes`
- Roblox API called only server-side, cached in DB
- Lua syntax-highlighted with `shiki` (WASM) on detail page, lazy-loaded behind `<ClientOnly>`
- Trusted badge (`GildedRune`) shown when author has `trusted` or `admin` role
- No emoji in source; icons are SVG components or `lucide-react`

## Build order

1. Enable Lovable Cloud; apply schema migration + demo seed
2. Design tokens, root layout, header, aurora overlay, font links, in-house SVG icon set
3. Auth route + protected layout composition
4. `<BrowseShell>` + card + wax-seal + filters + URL search params
5. `/scripts`, `/macros`, `/executors`, `/tutorials` wired to `listPosts`
6. Roblox game fetch server fn + upload page
7. Post detail (Lua viewer, votes, download)
8. Dashboard (my uploads / votes)
9. Admin page (ban/unban, role, delete)
10. Motion polish (aurora, seal burst, halos) + SEO head() per route
