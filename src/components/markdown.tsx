import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div
      className={
        "prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-ink " +
        "prose-p:text-ink/90 prose-p:leading-relaxed prose-a:text-cyan hover:prose-a:underline " +
        "prose-strong:text-ink prose-code:text-cyan prose-code:before:content-none prose-code:after:content-none " +
        "prose-pre:bg-base/80 prose-pre:border prose-pre:border-border/60 prose-li:text-ink/90 " +
        "prose-blockquote:border-cyan/50 prose-blockquote:text-faded " +
        className
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
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
