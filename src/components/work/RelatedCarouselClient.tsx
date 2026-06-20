"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";

interface CarouselItem {
  slug: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  thumbnail: string;
  category: string;
  tools: string[];
}

const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
  React:      { bg: "rgba(97,218,251,0.12)",  color: "#61dafb" },
  "Next.js":  { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" },
  TypeScript: { bg: "rgba(49,120,198,0.15)",  color: "#3178c6" },
  Python:     { bg: "rgba(55,118,171,0.15)",  color: "#3776ab" },
  Figma:      { bg: "rgba(162,89,255,0.15)",  color: "#a259ff" },
  Supabase:   { bg: "rgba(62,207,142,0.12)",  color: "#3ecf8e" },
  Tailwind:   { bg: "rgba(56,189,248,0.12)",  color: "#38bdf8" },
  Flutter:    { bg: "rgba(84,197,248,0.12)",  color: "#54c5f8" },
  Laravel:    { bg: "rgba(255,45,32,0.12)",   color: "#ff2d20" },
  "Node.js":  { bg: "rgba(83,158,67,0.15)",   color: "#53a743" },
};
const toolStyle = (t: string) =>
  TOOL_COLORS[t] ?? { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" };

function RelatedCard({ item }: { item: CarouselItem }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const displayTitle = lang === "en" && item.titleEn ? item.titleEn : item.title;
  const displayDescription = lang === "en" && item.descriptionEn ? item.descriptionEn : item.description;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => router.push(`/project/${item.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${hovered ? "var(--neutral-alpha-medium)" : "var(--neutral-alpha-weak)"}`,
        background: "var(--neutral-background-medium)",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.25s, transform 0.25s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: "100%", aspectRatio: "16/9", flexShrink: 0,
        background: "linear-gradient(135deg, var(--neutral-alpha-weak), var(--neutral-alpha-medium))",
        overflow: "hidden", position: "relative",
      }}>
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={displayTitle}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.48) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.22s",
          display: "flex", alignItems: "flex-end", padding: 10,
        }}>
          <span style={{
            padding: "3px 9px", borderRadius: 99,
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            color: "#fff", fontSize: 10, fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.2)",
          }}>{t("Lihat Detail", "View Detail")} →</span>
        </div>

        {/* Category badge */}
        {item.category && (
          <div style={{
            position: "absolute", top: 7, right: 7,
            padding: "2px 7px", borderRadius: 99, fontSize: 8, fontWeight: 700,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.85)", letterSpacing: "0.07em", textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>{item.category}</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "11px 13px 13px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, margin: 0,
          color: "var(--neutral-on-background-strong)",
          lineHeight: 1.35, letterSpacing: "-0.01em",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{displayTitle}</h3>

        {item.description?.trim() && (
          <p style={{
            fontSize: 11, lineHeight: 1.55,
            color: "var(--neutral-on-background-weak)",
            margin: 0, overflow: "hidden",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>{displayDescription}</p>
        )}

        {item.tools.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: "auto", paddingTop: 4 }}>
            {item.tools.slice(0, 3).map((tool) => {
              const s = toolStyle(tool);
              return (
                <span key={tool} style={{
                  padding: "1px 6px", borderRadius: 99, fontSize: 9, fontWeight: 600,
                  background: s.bg, color: s.color,
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>{tool}</span>
              );
            })}
            {item.tools.length > 3 && (
              <span style={{
                padding: "1px 6px", borderRadius: 99, fontSize: 9, fontWeight: 600,
                background: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>+{item.tools.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Grid 2 kolom, tampil semua, tanpa scroll looping ── */
export function RelatedCarouselClient({ items }: { items: CarouselItem[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <style>{`
        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
        }
        @media (max-width: 480px) {
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="related-grid">
        {items.map((item) => (
          <RelatedCard key={item.slug} item={item} />
        ))}
      </div>
    </>
  );
}
