import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { POST_KINDS, createPostSchema } from "./post-schema";

function isNewKey(v: string) {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}

function makePublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (isNewKey(key) && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// ----- Roblox game fetch -----

async function fetchAndCacheGame(robloxId: string, supabase: ReturnType<typeof makePublicClient>) {
  const idNum = Number(robloxId);
  if (!Number.isFinite(idNum) || idNum <= 0) throw new Error("Invalid Roblox game ID");

  // check cache
  const { data: cached } = await supabase
    .from("games")
    .select("*")
    .eq("roblox_game_id", idNum)
    .maybeSingle();

  const day = 24 * 60 * 60 * 1000;
  if (cached && new Date(cached.indexed_at).getTime() > Date.now() - day) {
    return cached;
  }

  // Resolve place ID -> universe ID
  let universeId: number | null = null;
  try {
    const r = await fetch(`https://apis.roblox.com/universes/v1/places/${idNum}/universe`);
    if (r.ok) {
      const j = (await r.json()) as { universeId?: number };
      universeId = j.universeId ?? null;
    }
  } catch {}
  // Fallback: assume the ID IS a universe ID
  if (!universeId) universeId = idNum;

  let name = "";
  let description = "";
  try {
    const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    if (r.ok) {
      const j = (await r.json()) as { data?: Array<{ name: string; description: string }> };
      name = j.data?.[0]?.name ?? "";
      description = j.data?.[0]?.description ?? "";
    }
  } catch {}

  let banner: string | null = null;
  try {
    const r = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`,
    );
    if (r.ok) {
      const j = (await r.json()) as { data?: Array<{ imageUrl?: string }> };
      banner = j.data?.[0]?.imageUrl ?? null;
    }
    if (!banner) {
      const r2 = await fetch(
        `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&countPerUniverse=1`,
      );
      if (r2.ok) {
        const j2 = (await r2.json()) as {
          data?: Array<{ thumbnails?: Array<{ imageUrl?: string }> }>;
        };
        banner = j2.data?.[0]?.thumbnails?.[0]?.imageUrl ?? null;
      }
    }
  } catch {}

  if (!name) name = `Roblox Game ${idNum}`;

  if (cached) {
    const { data: updated } = await supabase
      .from("games")
      .update({ name, description, banner_url: banner, indexed_at: new Date().toISOString() })
      .eq("id", cached.id)
      .select()
      .single();
    return updated ?? cached;
  }
  const { data: inserted, error } = await supabase
    .from("games")
    .insert({
      roblox_game_id: idNum,
      name,
      description,
      banner_url: banner,
    })
    .select()
    .single();
  if (error) throw error;
  return inserted;
}

export const fetchRobloxGame = createServerFn({ method: "POST" })
  .inputValidator((d: { gameId: string }) => z.object({ gameId: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const game = await fetchAndCacheGame(data.gameId, supabase);
    return game;
  });

// ----- List posts (public) -----

const listSchema = z.object({
  kind: z.enum(POST_KINDS),
  sort: z.enum(["latest", "top"]).default("latest"),
  trusted: z.boolean().default(false),
  key: z.enum(["any", "required", "none"]).default("any"),
  search: z.string().max(200).default(""),
  gameId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(48),
});

export const listPosts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => listSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    let q = supabase
      .from("posts")
      .select(
        "id, kind, title, description, key_system, key_link, custom_banner_url, score, upvotes, downvotes, created_at, updated_at, author_id, game_id, games:game_id(id,name,banner_url,roblox_game_id)",
      )
      .is("deleted_at", null)
      .eq("kind", data.kind);

    if (data.key === "required") q = q.eq("key_system", true);
    if (data.key === "none") q = q.eq("key_system", false);
    if (data.gameId) q = q.eq("game_id", data.gameId);
    if (data.search.trim()) {
      const s = data.search.trim().replace(/[%_]/g, "");
      q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
    }
    q = data.sort === "top" ? q.order("score", { ascending: false }) : q.order("created_at", { ascending: false });
    q = q.limit(data.limit);

    const { data: rows, error } = await q;
    if (error) throw error;

    let filtered = rows ?? [];
    if (data.trusted && filtered.length) {
      const authorIds = Array.from(new Set(filtered.map((r) => r.author_id)));
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", authorIds)
        .in("role", ["admin", "trusted"]);
      const trustedSet = new Set((roles ?? []).map((r) => r.user_id));
      filtered = filtered.filter((r) => trustedSet.has(r.author_id));
    }

    // Enrich with trusted flag + profile
    const authorIds = Array.from(new Set(filtered.map((r) => r.author_id)));
    let trustedSet = new Set<string>();
    const profMap = new Map<string, { id: string; username: string | null; avatar_url: string | null }>();
    if (authorIds.length) {
      const [{ data: roles }, { data: profs }] = await Promise.all([
        supabase.from("user_roles").select("user_id, role").in("user_id", authorIds).in("role", ["admin", "trusted"]),
        supabase.from("profiles").select("id, username, avatar_url").in("id", authorIds),
      ]);
      trustedSet = new Set((roles ?? []).map((r) => r.user_id));
      for (const p of profs ?? []) profMap.set(p.id, p);
    }
    return filtered.map((r) => ({
      ...r,
      author_trusted: trustedSet.has(r.author_id),
      profiles: profMap.get(r.author_id) ?? null,
    }));
  });

// ----- Get post by id (public) -----

export const getPost = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const { data: post, error } = await supabase
      .from("posts")
      .select(
        "id, kind, title, description, key_system, key_link, custom_banner_url, lua_content, score, upvotes, downvotes, created_at, updated_at, author_id, game_id, games:game_id(id,name,banner_url,roblox_game_id,description)",
      )
      .eq("id", data.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!post) return null;
    const [{ data: roles }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", post.author_id).in("role", ["admin", "trusted"]),
      supabase.from("profiles").select("id, username, avatar_url").eq("id", post.author_id).maybeSingle(),
    ]);
    return { ...post, author_trusted: (roles ?? []).length > 0, profiles: prof ?? null };
  });

// ----- List games for sidebar (public) -----

export const listGamesForKind = createServerFn({ method: "POST" })
  .inputValidator((d: { kind: string }) => z.object({ kind: z.enum(POST_KINDS) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = makePublicClient();
    const { data: rows, error } = await supabase
      .from("posts")
      .select("game_id, games:game_id(id, name)")
      .is("deleted_at", null)
      .eq("kind", data.kind)
      .not("game_id", "is", null);
    if (error) throw error;
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const r of rows ?? []) {
      const g = r.games as { id: string; name: string } | null;
      if (!g) continue;
      const prev = map.get(g.id);
      if (prev) prev.count += 1;
      else map.set(g.id, { id: g.id, name: g.name, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 30);
  });

// ----- Create post (auth) -----

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createPostSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Ban check
    const { data: profile } = await supabase.from("profiles").select("banned_at").eq("id", userId).maybeSingle();
    if (profile?.banned_at) throw new Error("Your account is banned.");

    // Executor requires admin
    if (data.kind === "executor") {
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!isAdmin) throw new Error("Only admins can publish executors.");
    }

    // Resolve game
    let gameId: string | null = null;
    if (data.robloxGameId) {
      const publicClient = makePublicClient();
      const game = await fetchAndCacheGame(data.robloxGameId, publicClient);
      gameId = game.id;
    }

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        kind: data.kind,
        title: data.title,
        description: data.description ?? "",
        game_id: gameId,
        custom_banner_url: data.customBannerUrl ?? null,
        key_system: data.keySystem,
        key_link: data.keyLink ?? null,
        lua_content: data.luaContent ?? "",
        author_id: userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: inserted.id };
  });

// ----- Vote (auth) -----

export const votePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ postId: z.string().uuid(), value: z.union([z.literal(-1), z.literal(0), z.literal(1)]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.value === 0) {
      const { error } = await supabase
        .from("post_votes")
        .delete()
        .eq("post_id", data.postId)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("post_votes")
        .upsert({ post_id: data.postId, user_id: userId, value: data.value }, { onConflict: "post_id,user_id" });
      if (error) throw error;
    }
    return { ok: true };
  });

// Get current user's vote for a post
export const getMyVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: v } = await context.supabase
      .from("post_votes")
      .select("value")
      .eq("post_id", data.postId)
      .eq("user_id", context.userId)
      .maybeSingle();
    return { value: (v?.value ?? 0) as -1 | 0 | 1 };
  });

// ----- Session info (auth) -----

export const getMyContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, username, avatar_url, banned_at").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roleList = (roles ?? []).map((r) => r.role);
    return {
      userId,
      profile,
      isAdmin: roleList.includes("admin"),
      isTrusted: roleList.includes("admin") || roleList.includes("trusted"),
      banned: !!profile?.banned_at,
    };
  });

// ----- Admin functions -----

async function assertAdmin(supabase: ReturnType<typeof makePublicClient>, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden: admin only");
}

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // Author or admin (RLS also enforces this)
    const { error } = await context.supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.postId);
    if (error) throw error;
    return { ok: true };
  });

export const adminBanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ username: z.string().min(1), reason: z.string().max(500).default("") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as unknown as ReturnType<typeof makePublicClient>, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) throw new Error("User not found");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ banned_at: new Date().toISOString(), banned_reason: data.reason })
      .eq("id", profile.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminUnbanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { username: string }) => z.object({ username: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as unknown as ReturnType<typeof makePublicClient>, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (!profile) throw new Error("User not found");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ banned_at: null, banned_reason: null })
      .eq("id", profile.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        username: z.string().min(1),
        role: z.enum(["admin", "trusted", "user"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as unknown as ReturnType<typeof makePublicClient>, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (!profile) throw new Error("User not found");
    if (data.role === "user") {
      // "user" is implicit — remove other roles
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", profile.id);
      if (error) throw error;
    } else if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: profile.id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", profile.id)
        .eq("role", data.role);
      if (error) throw error;
    }
    return { ok: true };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as unknown as ReturnType<typeof makePublicClient>, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.postId);
    if (error) throw error;
    return { ok: true };
  });

// User dashboard
export const listMyPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("posts")
      .select("id, kind, title, score, upvotes, downvotes, created_at, deleted_at, key_system")
      .eq("author_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
