import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: (p) => <h1 className="mt-4 mb-2 font-serif text-2xl text-ink" {...p} />,
  h2: (p) => <h2 className="mt-4 mb-2 font-serif text-xl text-ink" {...p} />,
  h3: (p) => <h3 className="mt-3 mb-1.5 font-serif text-lg text-ink" {...p} />,
  p: (p) => <p className="my-2 leading-relaxed text-ink/90" {...p} />,
  a: (p) => <a className="text-cyan underline-offset-4 hover:underline" target="_blank" rel="noreferrer" {...p} />,
  ul: (p) => <ul className="my-2 list-disc space-y-1 pl-6 text-ink/90" {...p} />,
  ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-6 text-ink/90" {...p} />,
  li: (p) => <li className="marker:text-cyan/70" {...p} />,
  blockquote: (p) => (
    <blockquote className="my-3 border-l-2 border-cyan/50 bg-card/30 px-4 py-2 italic text-faded" {...p} />
  ),
  code: ({ className, children, ...rest }) => {
    const inline = !className;
    return inline ? (
      <code className="rounded bg-base/70 px-1 py-0.5 font-mono text-xs text-cyan" {...rest}>
        {children}
      </code>
    ) : (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
  pre: (p) => (
    <pre className="my-3 overflow-auto rounded-md border border-border/60 bg-base/80 p-3 font-mono text-xs" {...p} />
  ),
  hr: () => <hr className="my-4 border-border/60" />,
  table: (p) => <table className="my-3 w-full border-collapse text-sm" {...p} />,
  th: (p) => <th className="border border-border/60 bg-card/50 px-2 py-1 text-left text-ink" {...p} />,
  td: (p) => <td className="border border-border/60 px-2 py-1 text-ink/90" {...p} />,
  strong: (p) => <strong className="text-ink" {...p} />,
  em: (p) => <em className="text-ink/90" {...p} />,
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
  const [mode, setMode] = useState<"write" | "preview">("write");
  return (
    <div className="rounded-md border border-border/70 bg-card/50">
      <div className="flex items-center gap-1 border-b border-border/60 px-2 py-1.5 text-xs">
        <button
          type="button"
          onClick={() => setMode("write")}
          className={
            "rounded px-2 py-1 transition-colors " +
            (mode === "write" ? "bg-cyan/15 text-cyan" : "text-faded hover:text-ink")
          }
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={
            "rounded px-2 py-1 transition-colors " +
            (mode === "preview" ? "bg-cyan/15 text-cyan" : "text-faded hover:text-ink")
          }
        >
          Preview
        </button>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-faded">
          Markdown · **bold** _italic_ [link](url)
        </span>
      </div>
      {mode === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-y bg-transparent px-3 py-2 text-ink outline-none"
        />
      ) : (
        <div className="min-h-[8rem] px-3 py-2">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-faded">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  );
}
