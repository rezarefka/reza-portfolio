"use client";

import { Column } from "@once-ui-system/core";
import { useLang } from "@/lib/lang-context";
import type { Blog } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

interface BlogContentProps {
  post: Blog;
}

/** Slugify text to a safe id */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Parse HTML string, inject id attrs to h1-h6, return processed HTML + TOC entries */
function processHtml(html: string): { html: string; toc: TocEntry[] } {
  if (typeof window === "undefined") return { html, toc: [] };

  const div = document.createElement("div");
  div.innerHTML = html;

  const toc: TocEntry[] = [];
  const counter: Record<string, number> = {};

  div.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
    const level = parseInt(el.tagName[1], 10);
    const text = el.textContent?.trim() || "";
    let id = slugify(text) || `heading-${toc.length}`;

    // Ensure uniqueness
    if (counter[id] !== undefined) {
      counter[id]++;
      id = `${id}-${counter[id]}`;
    } else {
      counter[id] = 0;
    }

    el.setAttribute("id", id);
    toc.push({ id, text, level });
  });

  return { html: div.innerHTML, toc };
}

/* ── Inline TOC sidebar (right side, client-only) ────────────────── */
function BlogToc({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!toc.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-72px 0px -60% 0px", threshold: 0 }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

  if (!toc.length) return null;

  return (
    <>
      <style>{`
        .blog-toc-rail {
          position: fixed;
          right: max(16px, calc((100vw - 960px) / 2 - 220px));
          top: 50%;
          transform: translateY(-50%);
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 20;
          max-height: 75vh;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .blog-toc-rail::-webkit-scrollbar { display: none; }

        /* Hide on medium/small screens */
        @media (max-width: 1280px) { .blog-toc-rail { display: none; } }

        .blog-toc-header {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--neutral-on-background-weak);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .blog-toc-header::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--neutral-alpha-weak);
        }

        .blog-toc-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          padding: 3px 0;
          transition: opacity 0.18s;
          text-decoration: none;
          border: none;
          background: none;
          font-family: inherit;
          text-align: left;
        }
        .blog-toc-item:hover { opacity: 1 !important; }

        .blog-toc-line {
          flex-shrink: 0;
          margin-top: 6px;
          height: 1px;
          border-radius: 99px;
          background: var(--neutral-on-background-medium);
          transition: width 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.18s;
        }

        .blog-toc-text {
          font-size: 11.5px;
          line-height: 1.45;
          color: var(--neutral-on-background-medium);
          transition: color 0.18s, font-weight 0.18s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <nav className="blog-toc-rail" aria-label="Daftar isi">
        <div className="blog-toc-header">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
          On this page
        </div>

        {toc.map(({ id, text, level }) => {
          const isActive = activeId === id;
          const indent = (level - 1) * 10;
          const lineW = isActive ? 20 : level === 1 ? 14 : 10;

          return (
            <button
              key={id}
              className="blog-toc-item"
              style={{ paddingLeft: indent, opacity: isActive ? 1 : 0.52 }}
              onClick={() => scroll(id)}
            >
              <span
                className="blog-toc-line"
                style={{
                  width: lineW,
                  background: isActive ? "var(--brand-on-background-medium)" : undefined,
                }}
              />
              <span
                className="blog-toc-text"
                style={{
                  color: isActive ? "var(--neutral-on-background-strong)" : undefined,
                  fontWeight: isActive ? 600 : undefined,
                }}
              >
                {text}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ── Main BlogContent ─────────────────────────────────────────────── */
export function BlogContent({ post }: BlogContentProps) {
  const { lang } = useLang();
  const rawContent = lang === "en" ? post.content_en : post.content_id;

  const [processedHtml, setProcessedHtml] = useState<string>(rawContent);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Process HTML on client: inject IDs to headings
  useEffect(() => {
    const { html, toc: entries } = processHtml(rawContent);
    setProcessedHtml(html);
    setToc(entries);
  }, [rawContent]);

  return (
    <>
      {/* Floating TOC rail */}
      <BlogToc toc={toc} />

      <Column as="article" maxWidth="s">
        <style>{`
          /* ── CMS Blog Content Typography ───────────────────────── */
          .cms-content {
            color: var(--neutral-on-background-medium);
            font-size: 15px;
            line-height: 1.8;
            word-break: break-word;
          }

          /* Headings */
          .cms-content h1,
          .cms-content h2,
          .cms-content h3,
          .cms-content h4,
          .cms-content h5,
          .cms-content h6 {
            color: var(--neutral-on-background-strong);
            font-weight: 700;
            line-height: 1.3;
            letter-spacing: -0.01em;
            margin-top: 2.2em;
            margin-bottom: 0.6em;
            scroll-margin-top: 88px;
          }
          .cms-content h1 { font-size: 1.65em; }
          .cms-content h2 {
            font-size: 1.35em;
            padding-bottom: 0.35em;
            border-bottom: 1px solid var(--neutral-alpha-weak);
          }
          .cms-content h3 { font-size: 1.15em; }
          .cms-content h4 { font-size: 1em; }

          /* Paragraphs */
          .cms-content p {
            margin: 0 0 1.15em;
          }

          /* Links */
          .cms-content a {
            color: var(--brand-on-background-medium);
            text-decoration: underline;
            text-underline-offset: 3px;
            text-decoration-thickness: 1px;
            transition: color 0.15s;
          }
          .cms-content a:hover {
            color: var(--brand-on-background-strong);
          }

          /* Bold / italic */
          .cms-content strong { color: var(--neutral-on-background-strong); font-weight: 700; }
          .cms-content em { font-style: italic; }

          /* Blockquote */
          .cms-content blockquote {
            margin: 1.6em 0;
            padding: 14px 20px;
            border-left: 3px solid var(--brand-background-strong);
            background: var(--brand-alpha-weak);
            border-radius: 0 10px 10px 0;
            color: var(--neutral-on-background-medium);
            font-style: italic;
          }
          .cms-content blockquote p { margin: 0; }

          /* Code */
          .cms-content code {
            font-family: "Fira Code", "Cascadia Code", monospace;
            font-size: 0.87em;
            background: var(--neutral-alpha-weak);
            color: var(--accent-on-background-strong);
            padding: 2px 6px;
            border-radius: 5px;
            border: 1px solid var(--neutral-alpha-weak);
          }
          .cms-content pre {
            margin: 1.4em 0;
            padding: 18px 20px;
            background: var(--neutral-background-strong);
            border: 1px solid var(--neutral-alpha-weak);
            border-radius: 10px;
            overflow-x: auto;
            font-size: 0.85em;
            line-height: 1.7;
          }
          .cms-content pre code {
            background: none;
            border: none;
            padding: 0;
            color: var(--neutral-on-background-medium);
          }

          /* Lists */
          .cms-content ul,
          .cms-content ol {
            padding-left: 1.5em;
            margin: 0.8em 0 1.2em;
          }
          .cms-content ul { list-style-type: disc; }
          .cms-content ol { list-style-type: decimal; }
          .cms-content li {
            margin-bottom: 0.4em;
            line-height: 1.75;
          }
          .cms-content li::marker {
            color: var(--brand-background-strong);
          }

          /* Horizontal rule */
          .cms-content hr {
            border: none;
            border-top: 1px solid var(--neutral-alpha-weak);
            margin: 2em 0;
          }

          /* Images */
          .cms-content img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 1.4em 0;
            border: 1px solid var(--neutral-alpha-weak);
            display: block;
          }

          /* Tables */
          .cms-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.6em 0;
            font-size: 0.92em;
          }
          .cms-content th,
          .cms-content td {
            padding: 10px 14px;
            border: 1px solid var(--neutral-alpha-weak);
            text-align: left;
          }
          .cms-content th {
            background: var(--neutral-alpha-weak);
            font-weight: 700;
            color: var(--neutral-on-background-strong);
          }
          .cms-content tr:nth-child(even) {
            background: var(--neutral-alpha-weak);
          }

          /* Callout / highlight box via mark */
          .cms-content mark {
            background: var(--accent-alpha-weak);
            color: var(--accent-on-background-strong);
            padding: 1px 4px;
            border-radius: 3px;
          }
        `}</style>

        <div
          ref={contentRef}
          className="cms-content"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </Column>
    </>
  );
}
