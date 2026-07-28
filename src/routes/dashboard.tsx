import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useMe } from "@/lib/session";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  listMyPosts,
  adminBanUser,
  adminUnbanUser,
  adminSetRole,
  adminDeletePost,
} from "@/lib/posts.functions";
import { useState } from "react";
import { KIND_SINGULAR } from "@/lib/post-schema";
import { WaxSealShape, PadlockRune, Grimoire } from "@/components/icons/rune-icons";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atelier of Scripts" },
      { name: "description", content: "Your scribe's dashboard in the Atelier of Scripts." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: me, isLoading } = useMe();
  const [tab, setTab] = useState<"mine" | "admin">("mine");

  if (isLoading) {
    return (
      <SiteShell>
        <div className="h-96 animate-pulse rounded-lg bg-card/30" />
      </SiteShell>
    );
  }
  if (!me) return <Navigate to="/auth" />;

  return (
    <SiteShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan/80">Scribe</p>
          <h1 className="font-serif text-4xl text-ink">{me.profile?.username ?? "Anonymous"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {me.isAdmin && (
              <span className="rounded-full border border-cyan/50 bg-cyan/10 px-2 py-0.5 text-cyan">Admin</span>
            )}
            {me.isTrusted && !me.isAdmin && (
              <span className="rounded-full border border-moss/50 bg-moss/10 px-2 py-0.5 text-moss">Trusted</span>
            )}
            {me.banned && (
              <span className="rounded-full border border-destructive/60 bg-destructive/10 px-2 py-0.5 text-destructive">
                Banned
              </span>
            )}
          </div>
        </div>
        <Link to="/submit" className="btn-arcane rounded-md px-4 py-2 text-sm font-medium">
          Inscribe
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border/60">
        <TabBtn active={tab === "mine"} onClick={() => setTab("mine")}>
          <Grimoire size={14} /> My pages
        </TabBtn>
        {me.isAdmin && (
          <TabBtn active={tab === "admin"} onClick={() => setTab("admin")}>
            <PadlockRune size={14} /> Admin
          </TabBtn>
        )}
      </div>

      {tab === "mine" ? <MyPosts /> : <AdminPanel />}
    </SiteShell>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "relative flex items-center gap-2 px-4 py-2.5 text-sm transition-colors " +
        (active ? "text-cyan" : "text-faded hover:text-ink")
      }
    >
      {children}
      {active && <span className="absolute inset-x-2 -bottom-px h-px bg-cyan" />}
    </button>
  );
}

function MyPosts() {
  const fetchMine = useServerFn(listMyPosts);
  const q = useQuery({ queryKey: ["my-posts"], queryFn: () => fetchMine({ data: undefined as never }) });
  if (q.isLoading) return <div className="h-40 animate-pulse rounded-lg bg-card/30" />;
  if (!q.data?.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-card/30 p-12 text-center text-faded">
        No pages inscribed yet.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60 bg-card/40">
      {q.data.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-4 p-4 hover:bg-base/40">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan/80">{KIND_SINGULAR[p.kind]}</p>
            <Link to="/post/$id" params={{ id: p.id }} className="font-serif text-lg text-ink hover:text-cyan">
              {p.title}
            </Link>
            <div className="mt-1 flex items-center gap-3 text-xs text-faded">
              <span className="flex items-center gap-1">
                <WaxSealShape size={12} className="text-wax" /> {p.score}
              </span>
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
              {p.key_system && <span className="text-sky">Key</span>}
              {p.deleted_at && <span className="text-destructive">Removed</span>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AdminPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BanCard />
      <RoleCard />
      <DeleteCard />
    </div>
  );
}

function BanCard() {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const ban = useServerFn(adminBanUser);
  const unban = useServerFn(adminUnbanUser);
  const banMut = useMutation({
    mutationFn: () => ban({ data: { username: name, reason } }),
    onSuccess: () => setMsg("Banned."),
    onError: (e: Error) => setMsg(e.message),
  });
  const unbanMut = useMutation({
    mutationFn: () => unban({ data: { username: name } }),
    onSuccess: () => setMsg("Unbanned."),
    onError: (e: Error) => setMsg(e.message),
  });
  return (
    <AdminCard title="Ban a scribe" subtitle="By username">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="username"
        className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 text-ink outline-none focus:border-cyan"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="reason (optional)"
        className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 text-ink outline-none focus:border-cyan"
      />
      <div className="flex gap-2">
        <button
          onClick={() => banMut.mutate()}
          disabled={!name || banMut.isPending}
          className="rounded-md bg-destructive/90 px-3 py-2 text-sm text-destructive-foreground disabled:opacity-50"
        >
          Ban
        </button>
        <button
          onClick={() => unbanMut.mutate()}
          disabled={!name || unbanMut.isPending}
          className="rounded-md border border-border/70 px-3 py-2 text-sm text-ink"
        >
          Unban
        </button>
      </div>
      {msg && <p className="text-xs text-faded">{msg}</p>}
    </AdminCard>
  );
}

function RoleCard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "trusted" | "user">("trusted");
  const [grant, setGrant] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const set = useServerFn(adminSetRole);
  const setMut = useMutation({
    mutationFn: () => set({ data: { username: name, role, grant } }),
    onSuccess: () => setMsg("Updated."),
    onError: (e: Error) => setMsg(e.message),
  });
  return (
    <AdminCard title="Assign a role" subtitle="Trusted or admin">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="username"
        className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 text-ink outline-none focus:border-cyan"
      />
      <div className="flex gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "trusted" | "user")}
          className="flex-1 rounded-md border border-border/70 bg-base/50 px-3 py-2 text-sm text-ink"
        >
          <option value="trusted">Trusted</option>
          <option value="admin">Admin</option>
          <option value="user">Reset to user (clears roles)</option>
        </select>
        <select
          value={grant ? "grant" : "revoke"}
          onChange={(e) => setGrant(e.target.value === "grant")}
          className="rounded-md border border-border/70 bg-base/50 px-3 py-2 text-sm text-ink"
          disabled={role === "user"}
        >
          <option value="grant">Grant</option>
          <option value="revoke">Revoke</option>
        </select>
      </div>
      <button
        onClick={() => setMut.mutate()}
        disabled={!name || setMut.isPending}
        className="btn-arcane rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        Apply
      </button>
      {msg && <p className="text-xs text-faded">{msg}</p>}
    </AdminCard>
  );
}

function DeleteCard() {
  const [postId, setPostId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const del = useServerFn(adminDeletePost);
  const mut = useMutation({
    mutationFn: () => del({ data: { postId } }),
    onSuccess: () => {
      setMsg("Removed.");
      setPostId("");
    },
    onError: (e: Error) => setMsg(e.message),
  });
  return (
    <AdminCard title="Remove a page" subtitle="By post id">
      <input
        value={postId}
        onChange={(e) => setPostId(e.target.value.trim())}
        placeholder="post id (uuid)"
        className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-cyan"
      />
      <button
        onClick={() => mut.mutate()}
        disabled={!postId || mut.isPending}
        className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive/90 disabled:opacity-50"
      >
        Remove page
      </button>
      {msg && <p className="text-xs text-faded">{msg}</p>}
    </AdminCard>
  );
}

function AdminCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="animate-paper-in space-y-3 rounded-lg border border-border/70 bg-card/40 p-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-faded">{subtitle}</p>
        <h3 className="font-serif text-lg text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}
