import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteShell } from "@/components/site-shell";
import { PostCard } from "@/components/post-card";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPosts, listGamesForKind } from "@/lib/posts.functions";
import { POST_KINDS, KIND_LABEL, KIND_SINGULAR, type PostKind } from "@/lib/post-schema";
import { RuneSigil, Astrolabe } from "@/components/icons/rune-icons";
import { useState } from "react";

const searchSchema = z.object({
  q: z.string().optional(),
  sort: z.enum(["latest", "top"]).optional(),
  key: z.enum(["any", "required", "none"]).optional(),
  trusted: z.boolean().optional(),
  game: z.string().uuid().optional(),
});

export const Route = createFileRoute("/browse/$kind")({
  validateSearch: (s) => searchSchema.parse(s),
  parseParams: (p) => ({ kind: p.kind as PostKind }),
  beforeLoad: ({ params }) => {
    if (!POST_KINDS.includes(params.kind as PostKind)) {
      throw new Error("Unknown category");
    }
  },
  head: ({ params }) => {
    const label = KIND_LABEL[params.kind as PostKind];
    return {
      meta: [
        { title: `${label} — Atelier of Scripts` },
        { name: "description", content: `Browse ${label.toLowerCase()} in the Atelier of Scripts grimoire for Roblox.` },
        { property: "og:title", content: `${label} — Atelier of Scripts` },
        { property: "og:description", content: `Roblox ${label.toLowerCase()}, curated by trusted authors.` },
      ],
    };
  },
  component: Browse,
});

function Browse() {
  const params = Route.useParams();
  const kind = params.kind as PostKind;
  const search = useSearch({ from: "/browse/$kind" });
  const navigate = useNavigate({ from: "/browse/$kind" });
  const [qLocal, setQLocal] = useState(search.q ?? "");

  const q = search.q ?? "";
  const sort = search.sort ?? "latest";
  const key = search.key ?? "any";
  const trusted = search.trusted ?? false;
  const game = search.game;

  const fetchPosts = useServerFn(listPosts);
  const fetchGames = useServerFn(listGamesForKind);

  const posts = useQuery({
    queryKey: ["posts", kind, q, sort, key, trusted, game ?? null],
    queryFn: () =>
      fetchPosts({
        data: { kind, sort, key, trusted, search: q, gameId: game, limit: 60 },
      }),
    staleTime: 15_000,
  });
  const games = useQuery({
    queryKey: ["games-for", kind],
    queryFn: () => fetchGames({ data: { kind } }),
    staleTime: 60_000,
  });

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (s: typeof search) => ({ ...s, ...patch }) });

  return (
    <SiteShell>
      <div className="animate-paper-in mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan/80">Category</p>
          <h1 className="font-serif text-4xl text-ink">{KIND_LABEL[kind]}</h1>
        </div>
        <div className="hidden text-faded md:block">
          <RuneSigil size={36} className="animate-rune" />
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: qLocal || undefined });
          }}
          className="relative"
        >
          <input
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
            placeholder={`Search ${KIND_LABEL[kind].toLowerCase()} — title, description, or game…`}
            className="w-full rounded-md border border-border/70 bg-card/60 px-4 py-2.5 pr-10 text-ink outline-none placeholder:text-faded/70 focus:border-cyan"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-faded hover:text-cyan" aria-label="Search">
            <Astrolabe size={18} />
          </button>
        </form>

        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value as "latest" | "top" })}
          className="rounded-md border border-border/70 bg-card/60 px-3 py-2.5 text-sm text-ink"
        >
          <option value="latest">Latest</option>
          <option value="top">Most reacted</option>
        </select>
        <select
          value={key}
          onChange={(e) => update({ key: e.target.value as "any" | "required" | "none" })}
          className="rounded-md border border-border/70 bg-card/60 px-3 py-2.5 text-sm text-ink"
        >
          <option value="any">Any key</option>
          <option value="required">Key system</option>
          <option value="none">No key</option>
        </select>
        <button
          onClick={() => update({ trusted: !trusted ? true : undefined })}
          className={
            "rounded-md border px-3 py-2.5 text-sm transition-colors " +
            (trusted ? "border-moss/60 bg-moss/10 text-moss" : "border-border/70 bg-card/60 text-ink hover:border-moss/60")
          }
        >
          Trusted only
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-faded">Games</p>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => update({ game: undefined })}
                className={
                  "w-full rounded px-2 py-1.5 text-left text-sm " +
                  (!game ? "bg-card/70 text-cyan" : "text-faded hover:text-ink")
                }
              >
                All games
              </button>
            </li>
            {(games.data ?? []).map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => update({ game: g.id })}
                  className={
                    "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm " +
                    (game === g.id ? "bg-card/70 text-cyan" : "text-faded hover:text-ink")
                  }
                >
                  <span className="truncate">{g.name}</span>
                  <span className="text-[10px] text-faded">{g.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          {posts.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg border border-border/40 bg-card/30" />
              ))}
            </div>
          ) : posts.data && posts.data.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {posts.data.map((p, i) => (
                <PostCard key={p.id} post={p} idx={i} />
              ))}
            </div>
          ) : (
            <div className="animate-paper-in rounded-lg border border-dashed border-border/70 bg-card/30 p-16 text-center">
              <RuneSigil size={40} className="mx-auto text-cyan/60" />
              <p className="mt-4 font-serif text-lg text-ink">The page is bare.</p>
              <p className="mt-1 text-sm text-faded">
                No {KIND_SINGULAR[kind].toLowerCase()}s match yet.{" "}
                <Link to="/submit" className="text-cyan underline-offset-4 hover:underline">Inscribe one</Link>.
              </p>
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
