import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useMe } from "@/lib/session";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPost, fetchRobloxGame } from "@/lib/posts.functions";
import { POST_KINDS, KIND_SINGULAR, type PostKind } from "@/lib/post-schema";
import { PadlockRune, Vial, Scroll, RuneSigil, Grimoire } from "@/components/icons/rune-icons";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Inscribe — Atelier of Scripts" },
      { name: "description", content: "Add a script, macro, executor, or tutorial to the Atelier of Scripts." },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const { data: me, isLoading } = useMe();
  const navigate = useNavigate();
  const [kind, setKind] = useState<PostKind>("script");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [robloxGameId, setRobloxGameId] = useState("");
  const [customBannerUrl, setCustomBannerUrl] = useState("");
  const [keySystem, setKeySystem] = useState(false);
  const [keyLink, setKeyLink] = useState("");
  const [luaContent, setLuaContent] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const fetchGame = useServerFn(fetchRobloxGame);
  const submitPost = useServerFn(createPost);

  const gamePreview = useQuery({
    queryKey: ["preview-game", robloxGameId],
    queryFn: () => fetchGame({ data: { gameId: robloxGameId } }),
    enabled: /^\d+$/.test(robloxGameId),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const create = useMutation({
    mutationFn: () =>
      submitPost({
        data: {
          kind,
          title,
          description,
          robloxGameId: robloxGameId || undefined,
          customBannerUrl: customBannerUrl || undefined,
          keySystem,
          keyLink: keyLink || undefined,
          luaContent,
        },
      }),
    onError: (e: Error) => setErr(e.message),
    onSuccess: (r) => navigate({ to: "/post/$id", params: { id: r.id } }),
  });

  if (isLoading) {
    return (
      <SiteShell>
        <div className="h-96 animate-pulse rounded-lg bg-card/30" />
      </SiteShell>
    );
  }
  if (!me) return <Navigate to="/auth" />;

  const canPickKind = (k: PostKind) => (k === "executor" || k === "tutorial" ? me.isAdmin : true);
  const needsGame = kind === "script" || kind === "macro";

  const KindIcon = { script: Scroll, macro: RuneSigil, executor: Vial, tutorial: Grimoire }[kind];

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl animate-paper-in">
        <p className="text-[11px] uppercase tracking-[0.35em] text-cyan/80">Inscribe</p>
        <h1 className="mt-1 font-serif text-4xl text-ink">A new page</h1>
        <p className="mt-2 max-w-xl text-sm text-faded">
          Choose the sort of writing, then dip the quill. The atelier's admins may remove pages that break the rites.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            create.mutate();
          }}
          className="mt-8 space-y-6"
        >
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-faded">Kind</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {POST_KINDS.map((k) => {
                const disabled = !canPickKind(k);
                const active = k === kind;
                const Icon = { script: Scroll, macro: RuneSigil, executor: Vial, tutorial: Grimoire }[k];
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={disabled}
                    onClick={() => setKind(k)}
                    className={
                      "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors disabled:opacity-40 " +
                      (active
                        ? "border-cyan/60 bg-cyan/10 text-cyan"
                        : "border-border/70 bg-card/40 text-ink hover:border-cyan/40")
                    }
                  >
                    <Icon size={22} />
                    <span>{KIND_SINGULAR[k]}</span>
                    {(k === "executor" || k === "tutorial") && !me.isAdmin && (
                      <span className="text-[10px] text-faded">admin only</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-faded">Title</span>
            <input
              required
              minLength={3}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border/70 bg-card/50 px-3 py-2 text-ink outline-none focus:border-cyan"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-faded">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border/70 bg-card/50 px-3 py-2 text-ink outline-none focus:border-cyan"
            />
          </label>

          {kind !== "executor" && (
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-faded">
                Roblox game / place ID{needsGame ? "" : " (optional)"}
              </span>
              <input
                inputMode="numeric"
                pattern="\d*"
                value={robloxGameId}
                onChange={(e) => setRobloxGameId(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 920587237"
                className="w-full rounded-md border border-border/70 bg-card/50 px-3 py-2 text-ink outline-none focus:border-cyan"
              />
              {gamePreview.isFetching && <p className="mt-2 text-xs text-faded">Divining the game…</p>}
              {gamePreview.data && (
                <div className="mt-3 flex items-center gap-3 rounded-md border border-border/60 bg-base/40 p-3">
                  {gamePreview.data.banner_url && (
                    <img src={gamePreview.data.banner_url} alt="" className="h-14 w-14 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-serif text-ink">{gamePreview.data.name}</p>
                    <p className="line-clamp-2 text-xs text-faded">{gamePreview.data.description}</p>
                  </div>
                </div>
              )}
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-faded">
              Custom banner URL (optional — overrides the game banner)
            </span>
            <input
              type="url"
              value={customBannerUrl}
              onChange={(e) => setCustomBannerUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-border/70 bg-card/50 px-3 py-2 text-ink outline-none focus:border-cyan"
            />
          </label>

          <div className="rounded-md border border-border/70 bg-card/40 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={keySystem}
                onChange={(e) => setKeySystem(e.target.checked)}
                className="h-4 w-4 accent-cyan"
              />
              <PadlockRune size={18} className="text-sky" />
              <span className="text-sm text-ink">Uses a key system</span>
            </label>
            {keySystem && (
              <input
                type="url"
                required
                value={keyLink}
                onChange={(e) => setKeyLink(e.target.value)}
                placeholder="https://linkvertise…"
                className="mt-3 w-full rounded-md border border-border/70 bg-base/40 px-3 py-2 text-ink outline-none focus:border-cyan"
              />
            )}
          </div>

          {kind !== "tutorial" && (
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-faded">Lua incantation</span>
              <textarea
                value={luaContent}
                onChange={(e) => setLuaContent(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full rounded-md border border-border/70 bg-base/60 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-cyan"
                placeholder="-- getgenv().Settings = { … }"
              />
            </label>
          )}

          {err && <p className="text-sm text-destructive">{err}</p>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => history.back()}
              className="rounded-md border border-border/70 px-4 py-2 text-sm text-ink"
            >
              Cancel
            </button>
            <button
              disabled={create.isPending}
              className="btn-arcane flex items-center gap-2 rounded-md px-5 py-2.5 font-medium disabled:opacity-60"
            >
              <KindIcon size={16} /> Inscribe
            </button>
          </div>
        </form>
      </div>
    </SiteShell>
  );
}
