import { Link, useRouterState } from "@tanstack/react-router";
import { useMe, useAuthActions, useSession } from "@/lib/session";
import { Astrolabe, Grimoire, Vial, Scroll, RuneSigil, MothWing, Chalice } from "@/components/icons/rune-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { AmbientBackground } from "@/components/ambient-background";
import type { ReactNode } from "react";

const NAV = [
  { to: "/browse/script", label: "Scripts", Icon: Scroll },
  { to: "/browse/macro", label: "Macros", Icon: Vial },
  { to: "/browse/executor", label: "Executors", Icon: Chalice },
  { to: "/browse/tutorial", label: "Tutorials", Icon: Grimoire },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const { data: me } = useMe();
  const { signOut } = useAuthActions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = !!session?.user;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-base/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <span className="text-cyan animate-rune"><RuneSigil size={30} /></span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-semibold tracking-wide text-ink">Atelier of Scripts</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-faded">Luau · Roblox coven</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={
                    "group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
                    (active ? "text-cyan" : "text-faded hover:text-ink")
                  }
                >
                  <Icon size={16} className={active ? "animate-rune" : ""} />
                  <span>{label}</span>
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {signedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-1.5 text-sm text-ink halo-cyan"
                >
                  <Astrolabe size={14} className="text-cyan" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/submit" className="btn-arcane rounded-md px-3 py-1.5 text-sm font-medium">
                  Inscribe
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-md p-2 text-faded hover:text-ink"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <MothWing size={18} />
                </button>
                {me?.isAdmin && (
                  <Link to="/dashboard" className="hidden text-[10px] uppercase tracking-widest text-moss md:inline">
                    admin
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth" className="rounded-md border border-cyan/50 px-3 py-1.5 text-sm text-cyan halo-cyan">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

      <footer className="mt-24 border-t border-border/60 py-8 text-center text-xs text-faded">
        <div className="flex items-center justify-center gap-2">
          <RuneSigil size={14} />
          <span className="tracking-[0.3em] uppercase">Bound in cyan &amp; moss · Luau grimoire</span>
        </div>
      </footer>
    </div>
  );
}
