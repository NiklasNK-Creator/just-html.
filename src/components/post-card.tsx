import { PostKind } from "@/lib/post-schema";
import { Link } from "@tanstack/react-router";
import { WaxSealShape, PadlockRune, GildedRune } from "@/components/icons/rune-icons";

type Post = {
  id: string;
  kind: PostKind;
  title: string;
  description: string | null;
  score: number;
  upvotes: number;
  downvotes: number;
  key_system: boolean;
  custom_banner_url: string | null;
  created_at: string;
  games: { id: string; name: string; banner_url: string | null; roblox_game_id: number | null } | null;
  profiles?: { id: string; username: string | null; avatar_url: string | null } | null;
  author_trusted?: boolean;
};

export function PostCard({ post, idx = 0 }: { post: Post; idx?: number }) {
  const banner = post.custom_banner_url ?? post.games?.banner_url ?? null;
  return (
    <Link
      to="/post/$id"
      params={{ id: post.id }}
      className="group animate-paper-in relative flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm halo-cyan"
      style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {banner ? (
          <img
            src={banner}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-base">
            <GildedRune size={44} className="text-cyan/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base/95 via-base/30 to-transparent" />
        {post.author_trusted && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-moss/60 bg-base/70 px-2 py-1 text-[10px] uppercase tracking-widest text-moss backdrop-blur-sm">
            <WaxSealShape size={12} /> Trusted
          </span>
        )}
        {post.key_system && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-sky/50 bg-base/70 px-2 py-1 text-[10px] uppercase tracking-widest text-sky backdrop-blur-sm">
            <PadlockRune size={12} /> Key
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {post.games && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-cyan/80">{post.games.name}</span>
        )}
        <h3 className="font-serif text-lg leading-snug text-ink group-hover:text-cyan">{post.title}</h3>
        {post.description && (
          <p className="line-clamp-2 text-sm text-faded">{post.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-faded">
          <span className="flex items-center gap-1">
            <WaxSealShape size={12} className="text-wax" />
            {post.score}
          </span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

export type { Post };
