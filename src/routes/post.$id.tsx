import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPost, votePost, getMyVote, deletePost, adminDeletePost } from "@/lib/posts.functions";
import { useMe } from "@/lib/session";
import { WaxSealShape, PadlockRune, GildedRune, Scroll, RuneSigil, Vial } from "@/components/icons/rune-icons";
import { BanRiskDialog } from "@/components/ban-risk-dialog";
import { useState } from "react";
import { KIND_LABEL } from "@/lib/post-schema";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/post/$id")({
  head: () => ({
    meta: [
      { title: "Grimoire page — Atelier of Scripts" },
      { name: "description", content: "A page from the Atelier of Scripts grimoire." },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();

  const fetchPost = useServerFn(getPost);
  const fetchMyVote = useServerFn(getMyVote);
  const mutateVote = useServerFn(votePost);
  const mutateDelete = useServerFn(deletePost);
  const mutateAdminDelete = useServerFn(adminDeletePost);

  const post = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost({ data: { id } }),
  });
  const myVote = useQuery({
    queryKey: ["post-vote", id, me?.userId ?? null],
    queryFn: () => fetchMyVote({ data: { postId: id } }),
    enabled: !!me,
  });

  const [sealBurst, setSealBurst] = useState(false);

  const vote = useMutation({
    mutationFn: (value: -1 | 0 | 1) => mutateVote({ data: { postId: id, value } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post", id] });
      qc.invalidateQueries({ queryKey: ["post-vote", id] });
    },
  });

  const removePost = useMutation({
    mutationFn: async () => {
      if (me?.isAdmin) await mutateAdminDelete({ data: { postId: id } });
      else await mutateDelete({ data: { postId: id } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      navigate({ to: "/" });
    },
  });

  if (post.isLoading) {
    return (
      <SiteShell>
        <div className="h-96 animate-pulse rounded-lg border border-border/40 bg-card/30" />
      </SiteShell>
    );
  }
  const p = post.data;
  if (!p) {
    return (
      <SiteShell>
        <div className="rounded-lg border border-dashed border-border/70 bg-card/30 p-16 text-center">
          <p className="font-serif text-2xl text-ink">This page has been torn from the grimoire.</p>
          <Link to="/" className="mt-4 inline-block text-cyan underline-offset-4 hover:underline">Return home</Link>
        </div>
      </SiteShell>
    );
  }

  const banner = p.custom_banner_url ?? p.games?.banner_url ?? null;
  const mine = me?.userId === p.author_id;
  const canDelete = mine || me?.isAdmin;
  const myV = myVote.data?.value ?? 0;

  const seal = async (value: -1 | 0 | 1) => {
    if (!me) return navigate({ to: "/auth" });
    const next = myV === value ? 0 : value;
    setSealBurst(true);
    setTimeout(() => setSealBurst(false), 500);
    vote.mutate(next);
  };

  return (
    <SiteShell>
      {p.kind === "script" && <BanRiskDialog />}
      <article className="animate-paper-in">
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-lg border border-border/70">
          {banner ? (
            <img src={banner} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-base">
              <GildedRune size={80} className="text-cyan/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
              <span className="rounded-full border border-border/70 bg-base/60 px-2.5 py-1 text-cyan backdrop-blur-sm">
                {KIND_LABEL[p.kind]}
              </span>
              {p.games && (
                <span className="rounded-full border border-border/70 bg-base/60 px-2.5 py-1 text-ink backdrop-blur-sm">
                  {p.games.name}
                </span>
              )}
              {p.key_system && (
                <span className="flex items-center gap-1 rounded-full border border-sky/50 bg-base/60 px-2.5 py-1 text-sky backdrop-blur-sm">
                  <PadlockRune size={12} /> Key system
                </span>
              )}
              {p.author_trusted && (
                <span className="flex items-center gap-1 rounded-full border border-moss/60 bg-base/60 px-2.5 py-1 text-moss backdrop-blur-sm">
                  <WaxSealShape size={12} /> Trusted witch
                </span>
              )}
            </div>
            <h1 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-5xl">{p.title}</h1>
            <p className="mt-2 text-sm text-faded">
              By {p.profiles?.username ?? "unknown scribe"} · {new Date(p.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="space-y-6">
            {p.description && (
              <section className="rounded-lg border border-border/60 bg-card/40 p-6">
                <Markdown>{p.description}</Markdown>
              </section>
            )}

            {p.kind === "executor" && p.key_link && (
              <section className="flex items-center justify-between rounded-lg border border-cyan/40 bg-cyan/5 p-4">
                <div className="flex items-center gap-3 text-cyan">
                  <Vial size={20} />
                  <div>
                    <p className="font-serif text-lg">Executor download</p>
                    <p className="text-xs text-faded">Fetch the tool from its home page.</p>
                  </div>
                </div>
                <a href={p.key_link} target="_blank" rel="noreferrer" className="btn-arcane rounded-md px-4 py-2 text-sm">
                  Download
                </a>
              </section>
            )}

            {p.kind !== "executor" && p.key_system && p.key_link && (
              <section className="flex items-center justify-between rounded-lg border border-sky/40 bg-sky/5 p-4">
                <div className="flex items-center gap-3 text-sky">
                  <PadlockRune size={20} />
                  <div>
                    <p className="font-serif text-lg">Key required</p>
                    <p className="text-xs text-faded">Retrieve a key before invoking the incantation.</p>
                  </div>
                </div>
                <a href={p.key_link} target="_blank" rel="noreferrer" className="rounded-md border border-sky/50 px-4 py-2 text-sm text-sky halo-cyan">
                  Get key
                </a>
              </section>
            )}

            {p.lua_content && (
              <section className="rounded-lg border border-border/60 bg-card/40">
                <header className="flex items-center justify-between border-b border-border/60 px-4 py-2 text-xs">
                  <span className="flex items-center gap-2 text-faded">
                    <Scroll size={14} /> Incantation
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(p.lua_content ?? "")}
                    className="rounded px-2 py-1 text-faded hover:text-cyan"
                  >
                    Copy
                  </button>
                </header>
                <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-relaxed text-ink/90">
                  <code>{p.lua_content}</code>
                </pre>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-card/40 p-5">
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-faded">Press wax</p>
              <div className="mt-4 flex items-center justify-around">
                <button
                  onClick={() => seal(1)}
                  className={
                    "group flex flex-col items-center gap-1 rounded-md p-3 transition-transform " +
                    (myV === 1 ? "text-wax" : "text-faded hover:text-wax")
                  }
                  aria-label="Approve"
                >
                  <span className={sealBurst && myV === 1 ? "animate-seal" : ""}>
                    <WaxSealShape size={36} />
                  </span>
                  <span className="text-xs">{p.upvotes}</span>
                </button>
                <div className="flex flex-col items-center">
                  <p className="font-serif text-3xl text-ink">{p.score}</p>
                  <p className="text-[10px] uppercase tracking-widest text-faded">standing</p>
                </div>
                <button
                  onClick={() => seal(-1)}
                  className={
                    "group flex flex-col items-center gap-1 rounded-md p-3 transition-transform " +
                    (myV === -1 ? "text-destructive" : "text-faded hover:text-destructive")
                  }
                  aria-label="Disapprove"
                >
                  <span className={sealBurst && myV === -1 ? "animate-seal" : ""}>
                    <WaxSealShape size={28} className="rotate-180" />
                  </span>
                  <span className="text-xs">{p.downvotes}</span>
                </button>
              </div>
            </div>

            {p.games && (
              <div className="rounded-lg border border-border/60 bg-card/40 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-faded">Bound to game</p>
                <p className="mt-2 font-serif text-lg text-ink">{p.games.name}</p>
                {p.games.description && (
                  <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-faded">{p.games.description}</p>
                )}
              </div>
            )}

            {canDelete && (
              <button
                onClick={() => {
                  if (confirm("Tear this page from the grimoire?")) removePost.mutate();
                }}
                className="w-full rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive/90 hover:bg-destructive/10"
              >
                {me?.isAdmin && !mine ? "Remove (admin)" : "Delete post"}
              </button>
            )}
          </aside>
        </div>
      </article>
    </SiteShell>
  );
}
