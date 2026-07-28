import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useEffect, useState } from "react";
import { Astrolabe, RuneSigil } from "@/components/icons/rune-icons";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Atelier of Scripts" },
      { name: "description", content: "Sign in to inscribe pages into the Atelier of Scripts grimoire." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username || undefined },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setErr(result.error.message ?? "Google sign-in failed");
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-md animate-paper-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan/40 text-cyan animate-rune">
            <Astrolabe size={36} />
          </div>
          <h1 className="font-serif text-3xl text-ink">
            {mode === "sign-in" ? "Enter the atelier" : "Join the atelier"}
          </h1>
          <p className="mt-1 text-sm text-faded">
            {mode === "sign-in" ? "Sign in to inscribe pages and press wax." : "Create a scribe's account to contribute."}
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border/70 bg-card/50 p-6">
          <button
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-base/50 px-4 py-2.5 text-sm text-ink halo-cyan"
          >
            <RuneSigil size={16} className="text-cyan" />
            Continue with Google
          </button>
          <div className="relative text-center text-[10px] uppercase tracking-[0.3em] text-faded">
            <span className="relative z-10 bg-card/50 px-2">or with email</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border/60" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "sign-up" && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Scribe name"
                className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 text-ink outline-none placeholder:text-faded/70 focus:border-cyan"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@atelier.com"
              className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 text-ink outline-none placeholder:text-faded/70 focus:border-cyan"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passphrase"
              className="w-full rounded-md border border-border/70 bg-base/50 px-3 py-2 text-ink outline-none placeholder:text-faded/70 focus:border-cyan"
            />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-cyan px-4 py-2.5 font-medium text-base halo-cyan disabled:opacity-60"
            >
              {busy ? "…" : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-faded">
            {mode === "sign-in" ? "New to the atelier?" : "Already a scribe?"}{" "}
            <button
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              className="text-cyan underline-offset-4 hover:underline"
            >
              {mode === "sign-in" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
