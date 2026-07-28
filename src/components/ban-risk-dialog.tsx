import { useEffect, useState } from "react";
import { PadlockRune, WaxSealShape } from "@/components/icons/rune-icons";

const KEY = "atelier-ban-risk-ack-v1";

export function BanRiskDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch { /* ignore */ }
  }, []);

  if (!open) return null;

  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-paper-in">
      <div className="absolute inset-0 bg-base/80 backdrop-blur-md" onClick={dismiss} />
      <div className="relative w-full max-w-lg rounded-xl border border-cyan/40 bg-card/95 p-7 shadow-[0_0_60px_-10px_var(--cyan)]">
        <div className="mb-4 flex items-center gap-3 text-cyan">
          <PadlockRune size={22} />
          <p className="text-[10px] uppercase tracking-[0.35em]">First-time warning</p>
        </div>
        <h2 className="font-serif text-2xl text-ink">A word before you unseal a script</h2>
        <p className="mt-3 text-sm leading-relaxed text-faded">
          Luau scripts posted here are shared by the community. Running unofficial code inside
          Roblox may violate the platform's Terms of Service and can result in an{" "}
          <span className="text-cyan">account ban</span>. The atelier does not endorse or
          guarantee any script — you use them at your own risk.
        </p>
        <ul className="mt-4 space-y-1.5 text-xs text-faded">
          <li className="flex items-start gap-2"><WaxSealShape size={12} className="mt-0.5 text-moss" /> Prefer alt accounts.</li>
          <li className="flex items-start gap-2"><WaxSealShape size={12} className="mt-0.5 text-moss" /> Read the Luau before you run it.</li>
          <li className="flex items-start gap-2"><WaxSealShape size={12} className="mt-0.5 text-moss" /> Never share your Roblox password with a key system.</li>
        </ul>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={dismiss} className="btn-arcane rounded-md px-5 py-2 text-sm font-medium">
            I understand — proceed
          </button>
        </div>
      </div>
    </div>
  );
}
