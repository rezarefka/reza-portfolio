"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  thumbnail?: string;
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
  tools?: string[];
  category?: string;
  attachment?: string | null;
  slug?: string;
}

function getMediaType(url: string): "image" | "video" | "pdf" {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  return "image";
}

const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
  "React":      { bg: "rgba(97,218,251,0.12)",  color: "#61dafb" },
  "Next.js":    { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" },
  "TypeScript": { bg: "rgba(49,120,198,0.15)",  color: "#3178c6" },
  "Python":     { bg: "rgba(55,118,171,0.15)",  color: "#3776ab" },
  "Figma":      { bg: "rgba(162,89,255,0.15)",  color: "#a259ff" },
  "Supabase":   { bg: "rgba(62,207,142,0.12)",  color: "#3ecf8e" },
  "Tailwind":   { bg: "rgba(56,189,248,0.12)",  color: "#38bdf8" },
  "Flutter":    { bg: "rgba(84,197,248,0.12)",  color: "#54c5f8" },
  "Laravel":    { bg: "rgba(255,45,32,0.12)",   color: "#ff2d20" },
  "Node.js":    { bg: "rgba(83,158,67,0.15)",   color: "#53a743" },
};
const getToolStyle = (t: string) =>
  TOOL_COLORS[t] ?? { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" };

// ─── Auto-detect rasio gambar ────────────────────────────────────────────────
type Ratio = "landscape" | "portrait" | "square" | "unknown";

function useImageRatio(src: string, type: "image" | "video" | "pdf"): Ratio {
  const [ratio, setRatio] = useState<Ratio>("unknown");
  useEffect(() => {
    if (type !== "image" || !src) { setRatio("landscape"); return; }
    const img = new Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      setRatio(r > 1.2 ? "landscape" : r < 0.85 ? "portrait" : "square");
    };
    img.onerror = () => setRatio("landscape");
    img.src = src;
  }, [src, type]);
  return ratio;
}

// ─── Aspect ratio per tipe ───────────────────────────────────────────────────
function getAspect(ratio: Ratio): string {
  if (ratio === "portrait") return "3/4";
  if (ratio === "square")   return "1/1";
  return "16/9"; // landscape + unknown
}

// ─── Thumbnail ───────────────────────────────────────────────────────────────
function ThumbnailDisplay({
  src, title, priority,
}: { src: string; title: string; priority?: boolean }) {
  const type = getMediaType(src);
  const ratio = useImageRatio(src, type);
  const aspect = getAspect(ratio);
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
  const [imgSrc, setImgSrc] = useState(src);
  const [errored, setErrored] = useState(false);

  const wrapStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: aspect,
    borderRadius: "14px 14px 0 0",
    overflow: "hidden",
    background: "#111",
    transition: "aspect-ratio 0.4s ease",
  };

  if (type === "video") {
    return (
      <div style={{ ...wrapStyle, aspectRatio: "16/9" }}>
        <video
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted playsInline preload="metadata"
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => {
            const v = e.currentTarget as HTMLVideoElement;
            v.pause(); v.currentTime = 0;
          }}
        />
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 99,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
          color: "#fff", fontSize: 11, fontWeight: 600,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          VIDEO
        </div>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div style={{ ...wrapStyle, aspectRatio: "16/9",
        background: "linear-gradient(135deg,#1e1e2e,#2d2d44)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>Dokumen PDF</span>
      </div>
    );
  }

  if (errored) {
    return (
      <div style={{ ...wrapStyle, aspectRatio: "16/9",
        background: "linear-gradient(135deg,var(--neutral-alpha-weak),var(--neutral-alpha-medium))",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      {/* Badge rasio — hint visual */}
      {ratio !== "unknown" && ratio !== "landscape" && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 2,
          padding: "3px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em", textTransform: "uppercase",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          {ratio === "portrait" ? "📱 Portrait" : "⬜ Square"}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={title}
        style={{
          width: "100%", height: "100%",
          objectFit: ratio === "portrait" ? "contain" : "cover",
          objectPosition: "center",
          display: "block",
          transition: "transform 0.55s cubic-bezier(0.34,1.2,0.64,1)",
          background: ratio === "portrait" ? "var(--neutral-background-strong)" : "transparent",
        }}
        loading={priority ? "eager" : "lazy"}
        onError={() => {
          if (imgSrc !== proxyUrl) setImgSrc(proxyUrl);
          else setErrored(true);
        }}
      />
    </div>
  );
}

// ─── Main Card ───────────────────────────────────────────────────────────────
export const ProjectCard: React.FC<ProjectCardProps> = ({
  href, priority, images = [], thumbnail: thumbnailProp,
  title, description, link, tools = [], category, attachment, slug,
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const thumbnail = thumbnailProp || images[0] || "";
  const derivedSlug = slug ?? href.split("/project/")[1] ?? "";
  const galleryHref = derivedSlug ? `/project/${derivedSlug}/gallery` : href;

  // ── Tilt on hover ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 6;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -6;
      el.style.transform = `translateY(-5px) rotateY(${x}deg) rotateX(${y}deg)`;
      el.style.boxShadow = `${-x}px ${Math.abs(y) + 8}px 40px rgba(0,0,0,0.18)`;
    };
    const onLeave = () => {
      el.style.transform = "";
      el.style.boxShadow = "";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <>
      <style>{`
        .project-card {
          border-radius: 16px; overflow: hidden;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1),
                      box-shadow 0.35s ease, border-color 0.2s;
          display: flex; flex-direction: column;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .project-card:hover { border-color: var(--neutral-alpha-medium); }
        .project-card:hover .proj-thumb img { transform: scale(1.06); }
        .proj-thumb { position: relative; }
        .proj-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.28s ease;
          border-radius: 14px 14px 0 0;
          display: flex; align-items: flex-end; padding: 16px;
        }
        .project-card:hover .proj-overlay { opacity: 1; }
        .tool-chip {
          display: inline-flex; align-items: center;
          padding: 3px 9px; border-radius: 99px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
          border: 1px solid rgba(255,255,255,0.07); white-space: nowrap;
        }
        .proj-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          text-decoration: none; border: none;
        }
        .proj-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div
        ref={cardRef}
        className="project-card"
        onClick={() => router.push(href)}
      >
        {/* Thumbnail — adaptive rasio */}
        <div className="proj-thumb">
          {thumbnail ? (
            <ThumbnailDisplay src={thumbnail} title={title} priority={priority} />
          ) : (
            <div style={{
              width: "100%", aspectRatio: "16/9", borderRadius: "14px 14px 0 0",
              background: "linear-gradient(135deg,var(--neutral-alpha-weak),var(--neutral-alpha-medium))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          <div className="proj-overlay">
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 99,
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            }}>
              Lihat Detail
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          {category && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em", textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {category}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <h3 style={{
            fontSize: 18, fontWeight: 700, lineHeight: 1.3,
            color: "var(--neutral-on-background-strong)",
            margin: 0, letterSpacing: "-0.01em",
          }}>{title}</h3>

          {description?.trim() && (
            <p style={{
              fontSize: 13, lineHeight: 1.65,
              color: "var(--neutral-on-background-weak)",
              margin: 0, overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>{description}</p>
          )}

          {tools.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {tools.slice(0, 6).map((tool) => {
                const s = getToolStyle(tool);
                return <span key={tool} className="tool-chip" style={{ background: s.bg, color: s.color }}>{tool}</span>;
              })}
              {tools.length > 6 && (
                <span className="tool-chip" style={{ background: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)" }}>
                  +{tools.length - 6}
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(href); }}
              className="proj-btn"
              style={{ background: "var(--brand-alpha-weak)", color: "var(--brand-on-background-strong)", border: "1px solid var(--brand-alpha-medium)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-alpha-medium)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-alpha-weak)"; }}
            >
              Detail Karya
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {(images.length > 0 || attachment) && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(galleryHref); }}
                className="proj-btn"
                style={{ background: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)", border: "1px solid var(--neutral-alpha-medium)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-medium)"; e.currentTarget.style.color = "var(--neutral-on-background-strong)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-weak)"; e.currentTarget.style.color = "var(--neutral-on-background-weak)"; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                Lihat Karya
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
