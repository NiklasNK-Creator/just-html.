import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: (p) => <h1 className="mt-5 mb-3 font-serif text-3xl leading-tight text-ink" {...p} />,
  h2: (p) => <h2 className="mt-5 mb-2 font-serif text-2xl leading-snug text-ink" {...p} />,
  h3: (p) => <h3 className="mt-4 mb-2 font-serif text-xl text-ink" {...p} />,
  h4: (p) => <h4 className="mt-3 mb-1.5 font-serif text-lg text-ink" {...p} />,
  p: (p) => <p className="my-3 leading-relaxed text-ink/90" {...p} />,
  a: (p) => (
    <a
      className="text-cyan underline decoration-cyan/40 decoration-1 underline-offset-4 transition-colors hover:decoration-cyan"
      target="_blank"
      rel="noreferrer"
      {...p}
    />
  ),
  ul: (p) => <ul className="my-3 list-disc space-y-1.5 pl-6 text-ink/90 marker:text-cyan/70" {...p} />,
  ol: (p) => <ol className="my-3 list-decimal space-y-1.5 pl-6 text-ink/90 marker:text-cyan/70" {...p} />,
  li: (p) => <li className="leading-relaxed" {...p} />,
  blockquote: (p) => (
    <blockquote
      className="my-4 rounded-r-md border-l-2 border-cyan/60 bg-cyan/5 px-4 py-2 italic text-faded"
      {...p}
    />
  ),
  code: ({ className, children, ...rest }) => {
    const inline = !className;
    return inline ? (
      <code
        className="rounded-md border border-border/50 bg-base/70 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan"
        {...rest}
      >
        {children}
      </code>
    ) : (
      <code className={"font-mono text-[0.85em] text-ink/95 " + (className ?? "")} {...rest}>
        {children}
      </code>
    );
  },
  pre: (p) => (
    <pre
      className="my-4 overflow-auto rounded-lg border border-border/60 bg-base/80 p-4 font-mono text-xs leading-relaxed shadow-inner"
      {...p}
    />
  ),
  hr: () => <hr className="my-6 border-border/60" />,
  table: (p) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  th: (p) => <th className="border-b border-border/60 bg-card/60 px-3 py-2 text-left font-serif text-ink" {...p} />,
  td: (p) => <td className="border-t border-border/40 px-3 py-2 text-ink/90" {...p} />,
  strong: (p) => <strong className="font-semibold text-ink" {...p} />,
  em: (p) => <em className="italic text-ink/95" {...p} />,
  img: (p) => <img className="my-4 rounded-lg border border-border/60" {...p} alt={p.alt ?? ""} />,
};

export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={"text-sm " + className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

type Mode = "write" | "preview" | "split";

export function MarkdownEditor({
  value,
  onChange,
  rows = 6,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [mode, setMode] = useState<Mode>("write");

  const tabCls = (active: boolean) =>
    "rounded-md px-2.5 py-1 text-xs transition-all duration-200 " +
    (active
      ? "bg-cyan/15 text-cyan shadow-[0_0_12px_-4px_var(--cyan)]"
      : "text-faded hover:text-ink hover:bg-card/60");

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/50 shadow-sm transition-shadow focus-within:shadow-[0_0_0_1px_color-mix(in_oklch,var(--cyan)_45%,transparent),0_0_28px_-8px_var(--cyan)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-base/40 px-2 py-1.5">
        <button type="button" onClick={() => setMode("write")} className={tabCls(mode === "write")}>
          Write
        </button>
        <button type="button" onClick={() => setMode("preview")} className={tabCls(mode === "preview")}>
          Preview
        </button>
        <button type="button" onClick={() => setMode("split")} className={tabCls(mode === "split")}>
          Split
        </button>
        <span className="ml-auto hidden text-[10px] uppercase tracking-widest text-faded sm:inline">
          Markdown · **bold** _italic_ [link](url) `code`
        </span>
      </div>

      {mode === "write" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          spellCheck
          className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-ink outline-none placeholder:text-faded/70"
        />
      )}

      {mode === "preview" && (
        <div className="animate-ink min-h-[8rem] px-4 py-3">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm italic text-faded">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {mode === "split" && (
        <div className="grid gap-0 md:grid-cols-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            spellCheck
            className="block w-full resize-y border-b border-border/50 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-ink outline-none placeholder:text-faded/70 md:border-b-0 md:border-r"
          />
          <div className="animate-ink min-h-[8rem] overflow-auto px-4 py-3">
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm italic text-faded">Nothing to preview yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
