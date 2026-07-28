import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Astrolabe, Grimoire, Scroll, Vial, Chalice, RuneSigil, WaxSealShape } from "@/components/icons/rune-icons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier of Scripts — Roblox Luau Grimoire" },
      { name: "description", content: "A witch's grimoire of Luau scripts, macros, executors and tutorials for Roblox, kept by a trusted coven." },
      { property: "og:title", content: "Atelier of Scripts" },
      { property: "og:description", content: "Roblox Luau scripts, macros, executors and tutorials — curated by a trusted coven." },
    ],
  }),
  component: Home,
});

const TILES = [
  { to: "/browse/script", label: "Scripts", Icon: Scroll, blurb: "Luau inscriptions for Roblox — bound and sealed." },
  { to: "/browse/macro", label: "Macros", Icon: Vial, blurb: "Silent gestures brewed to repeat themselves." },
  { to: "/browse/executor", label: "Executors", Icon: Chalice, blurb: "Vessels vetted and released by the coven's admins." },
  { to: "/browse/tutorial", label: "Tutorials", Icon: Grimoire, blurb: "Field notes from the atelier's own hand." },
];

function Home() {
  return (
    <SiteShell>
      <section className="relative animate-paper-in pt-8 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan/40 text-cyan animate-rune">
            <Astrolabe size={48} />
          </div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-cyan/80">A grimoire for Roblox</p>
          <h1 className="font-serif text-5xl leading-tight text-ink md:text-6xl">
            Atelier of Scripts
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-faded">
            A quiet archive of Luau — scripts, macros, executors and tutorials — bound by the
            coven and marked with wax seals of trust. Read the code before you run it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/browse/script" className="btn-arcane rounded-md px-5 py-2.5 font-medium">
              Open the grimoire
            </Link>
            <Link
              to="/browse/macro"
              className="rounded-md border border-border/70 px-5 py-2.5 text-ink halo-cyan"
            >
              Browse macros
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map(({ to, label, Icon, blurb }, i) => (
          <Link
            key={to}
            to={to}
            className="group animate-paper-in relative overflow-hidden rounded-lg border border-border/70 bg-card/40 p-6 halo-cyan"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border/70 bg-base/60 text-cyan transition-transform group-hover:scale-110 group-hover:animate-rune">
              <Icon size={26} />
            </div>
            <h2 className="font-serif text-xl text-ink">{label}</h2>
            <p className="mt-2 text-sm text-faded">{blurb}</p>
          </Link>
        ))}
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { Icon: WaxSealShape, title: "Wax-sealed reactions", body: "Readers press wax to a page to raise its standing in the archive." },
          { Icon: RuneSigil, title: "Auto-indexed games", body: "The first upload for a Roblox game imprints its banner and lore into the atelier." },
          { Icon: Grimoire, title: "Trusted witches", body: "Admins mark trusted authors so apprentices know whose seals to follow." },
        ].map(({ Icon, title, body }, i) => (
          <div
            key={title}
            className="animate-paper-in rounded-lg border border-border/60 bg-card/30 p-6"
            style={{ animationDelay: `${300 + i * 80}ms` }}
          >
            <Icon size={22} className="text-moss" />
            <h3 className="mt-3 font-serif text-lg text-ink">{title}</h3>
            <p className="mt-2 text-sm text-faded">{body}</p>
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
