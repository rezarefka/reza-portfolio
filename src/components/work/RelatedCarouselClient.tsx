"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CarouselItem {
  slug: string;
  title: string;
  description: string;
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

/* ── Single card ─────────────────────────────────────────────── */
function RelatedCard({ item }: { item: CarouselItem }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => router.push(`/project/${item.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 calc(50% - 8px)",
        minWidth: 220,
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${hovered ? "var(--neutral-alpha-medium)" : "var(--neutral-alpha-weak)"}`,
        background: "var(--neutral-background-medium)",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.25s, transform 0.25s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 10px 36px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: item.thumbnail
            ? "var(--neutral-alpha-weak)"
            : "linear-gradient(135deg, var(--neutral-alpha-weak), var(--neutral-alpha-medium))",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.45s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--neutral-on-background-weak)"
              strokeWidth="1.2"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s",
            display: "flex",
            alignItems: "flex-end",
            padding: 12,
          }}
        >
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Lihat Detail →
          </span>
        </div>

        {/* Category badge */}
        {item.category && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: "2px 8px",
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {item.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            margin: 0,
            color: "var(--neutral-on-background-strong)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.title}
        </h3>

        {item.description?.trim() && (
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--neutral-on-background-weak)",
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.description}
          </p>
        )}

        {item.tools.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto", paddingTop: 4 }}>
            {item.tools.slice(0, 4).map((tool) => {
              const s = toolStyle(tool);
              return (
                <span
                  key={tool}
                  style={{
                    padding: "2px 7px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 600,
                    background: s.bg,
                    color: s.color,
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {tool}
                </span>
              );
            })}
            {item.tools.length > 4 && (
              <span
                style={{
                  padding: "2px 7px",
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 600,
                  background: "var(--neutral-alpha-weak)",
                  color: "var(--neutral-on-background-weak)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                +{item.tools.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Carousel ───────────────────────────────────────────────── */
export function RelatedCarouselClient({ items }: { items: CarouselItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  // Pair items into rows of 2
  const pairs: CarouselItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }

  // Triplicate for seamless looping
  const loopedPairs = [...pairs, ...pairs, ...pairs];

  const CARD_WIDTH = 460; // approximate width of a pair
  const PAIR_GAP = 20;

  /* ── Auto-scroll ─── */
  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      if (pausedRef.current || !trackRef.current) return;
      trackRef.current.scrollLeft += 1.2;

      const track = trackRef.current;
      const oneThird = track.scrollWidth / 3;

      // Loop: if past 2/3 mark, jump back one third
      if (track.scrollLeft >= (oneThird * 2)) {
        track.scrollLeft -= oneThird;
      }
      // Loop: if scrolled before 1/3 mark (dragged left), jump forward one third
      if (track.scrollLeft < oneThird / 2) {
        track.scrollLeft += oneThird;
      }
    }, 16);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Start at second set so there's room to scroll both ways
    const oneThird = track.scrollWidth / 3;
    track.scrollLeft = oneThird;

    startAuto();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [startAuto]);

  /* ── Drag support ─── */
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    pausedRef.current = true;
    setStartX(e.pageX - (trackRef.current?.offsetLeft ?? 0));
    setScrollLeft(trackRef.current?.scrollLeft ?? 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    const x = e.pageX - (trackRef.current.offsetLeft ?? 0);
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => { pausedRef.current = false; }, 800);
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 48,
          background: "linear-gradient(to right, var(--neutral-background-weak, #0a0a0a), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 48,
          background: "linear-gradient(to left, var(--neutral-background-weak, #0a0a0a), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Scroll track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { onMouseUp(); pausedRef.current = false; }}
        onMouseEnter={() => { pausedRef.current = true; }}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: PAIR_GAP,
          overflowX: "scroll",
          scrollbarWidth: "none",
          cursor: isDragging ? "grabbing" : "grab",
          paddingBlock: 8,
          paddingInline: 16,
          userSelect: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        {loopedPairs.map((pair, pairIdx) => (
          <div
            key={pairIdx}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: "0 0 380px",
            }}
          >
            {pair.map((item) => (
              <RelatedCard key={`${pairIdx}-${item.slug}`} item={item} />
            ))}
          </div>
        ))}
      </div>

      {/* Indicator dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
        {pairs.map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--neutral-alpha-medium)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
