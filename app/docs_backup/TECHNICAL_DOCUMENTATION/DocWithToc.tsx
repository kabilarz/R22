"use client";

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/* ---------- Helpers ---------- */
function stripMdToc(md: string) {
  const lines = md.split("\n");
  const isTocHeading = (line: string) =>
    /^#{1,6}\s*/.test(line) &&
    /table\s*of\s*contents/i.test(line.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ""));
  let start = -1;
  for (let i = 0; i < lines.length; i++) if (isTocHeading(lines[i])) { start = i; break; }
  if (start === -1) return md;
  let end = lines.length;
  for (let j = start + 1; j < lines.length; j++) if (/^#{1,3}\s+/.test(lines[j])) { end = j; break; }
  return [...lines.slice(0, start), ...lines.slice(end)].join("\n");
}

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[/\\?%*:|"<>]/g, "")
    .replace(/[#.()[\]{}]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Heading = { level: 2 | 3; text: string; id: string };
function extractHeadings(md: string): Heading[] {
  const lines = md.split("\n");
  const out: Heading[] = [];
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)$/);
    const m3 = line.match(/^###\s+(.+)$/);
    if (m2) { const t = m2[1].trim().replace(/^[\u{1F300}-\u{1FAFF}]\s*/u, ""); out.push({ level: 2, text: t, id: slugify(t) }); }
    else if (m3) { const t = m3[1].trim().replace(/^[\u{1F300}-\u{1FAFF}]\s*/u, ""); out.push({ level: 3, text: t, id: slugify(t) }); }
  }
  return out;
}

/* ---------- Mermaid (memoized, one-time render, no layout shift) ---------- */
const Mermaid = memo(function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });
      try {
        const id = "mmd-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setReady(true);
        }
      } catch (e) {
        if (ref.current) {
          ref.current.innerHTML = `<pre style="color:#ef4444">Mermaid render error:\n${String(e)}</pre>`;
          setReady(true);
        }
      }
    })();
    return () => { cancelled = true; };
    // chart is static for this page; avoid re-running on parent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="overflow-x-auto rounded-md border bg-background"
      style={{ padding: ready ? "0.75rem" : "0.75rem", minHeight: ready ? undefined : 200 }}
    >
      <div ref={ref} style={{ maxWidth: "100%" }} />
    </div>
  );
});

/* ---------- Markdown content (memoized so scroll state doesn’t re-render it) ---------- */
const MarkdownContent = memo(function MarkdownContent({ md }: { md: string }) {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match && match[1].toLowerCase() === "mermaid") {
              return <Mermaid chart={String(children)} />;
            }
            if (!inline) {
              return (
                <pre
                  className="rounded-md p-4 overflow-x-auto bg-gray-900 text-gray-100 border border-white/10"
                  style={{ maxWidth: "100%" }}
                >
                  <code className={className} {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {md}
      </ReactMarkdown>
    </article>
  );
});

/* ---------- TOC (owns active section state; content never re-renders) ---------- */
function Toc({
  headings,
  onNavigate,
}: {
  headings: Heading[];
  onNavigate: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const ids = headings.map(h => h.id);
    const opts: IntersectionObserverInit = { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] };
    const observers: IntersectionObserver[] = [];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && activeId !== id) {
            setActiveId(id);
          }
        });
      }, opts);
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach(o => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings]);

  return (
    <div className="lg:sticky lg:top-16 rounded-md border">
      <div className="px-3 py-2 border-b text-sm font-medium">Contents</div>
      <nav className="p-2">
        <ul className="space-y-1">
          {headings.map((h, i) => (
            <li key={i}>
              <a
                href={`#${h.id}`}
                onClick={(e) => { e.preventDefault(); onNavigate(h.id); }}
                className={[
                  "block rounded px-2 py-1 text-sm hover:bg-muted",
                  h.level === 3 ? "pl-5" : "",
                  activeId === h.id ? "bg-muted font-medium" : "text-foreground/80",
                ].join(" ")}
              >
                {h.text}
              </a>
            </li>
          ))}
          {headings.length === 0 && (
            <li className="px-2 py-1 text-sm text-muted-foreground">No headings found.</li>
          )}
        </ul>
      </nav>
    </div>
  );
}

/* ---------- Page wrapper ---------- */
export default function DocWithToc({ md }: { md: string }) {
  const cleanedMd = useMemo(() => stripMdToc(md), [md]);
  const headings = useMemo(() => extractHeadings(cleanedMd), [cleanedMd]);
  const [openToc, setOpenToc] = useState(true);

  const onNavigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.innerWidth < 1024) setOpenToc(false);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
          <h1 className="text-sm font-medium">Technical Documentation</h1>
          <button
            className="text-xs underline underline-offset-4 lg:hidden"
            onClick={() => setOpenToc(v => !v)}
          >
            {openToc ? "Hide Contents" : "Show Contents"}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 px-5 py-6">
        {/* Sidebar TOC (isolated state, won't re-render content) */}
        <aside className={`lg:block ${openToc ? "block" : "hidden"}`}>
          <Toc headings={headings} onNavigate={onNavigate} />
        </aside>

        {/* Markdown content (memoized, Mermaid renders once) */}
        <MarkdownContent md={cleanedMd} />
      </div>
    </main>
  );
}
