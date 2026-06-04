"use client";

import { useRouter } from "next/navigation";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
  tools?: string[];
  category?: string;
  attachment?: string | null;
}

// Detect media type from URL
function getMediaType(url: string): "image" | "video" | "pdf" | "unknown" {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(clean)) return "image";
  // Supabase public URLs without extension — assume image
  return "image";
}

// Tool chip color map
const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
  "React":      { bg: "rgba(97,218,251,0.12)", color: "#61dafb" },
  "Next.js":    { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" },
  "TypeScript": { bg: "rgba(49,120,198,0.15)", color: "#3178c6" },
  "Python":     { bg: "rgba(55,118,171,0.15)", color: "#3776ab" },
  "Figma":      { bg: "rgba(162,89,255,0.15)", color: "#a259ff" },
  "Supabase":   { bg: "rgba(62,207,142,0.12)", color: "#3ecf8e" },
  "Tailwind":   { bg: "rgba(56,189,248,0.12)", color: "#38bdf8" },
  "Flutter":    { bg: "rgba(84,197,248,0.12)", color: "#54c5f8" },
  "Laravel":    { bg: "rgba(255,45,32,0.12)", color: "#ff2d20" },
  "Node.js":    { bg: "rgba(83,158,67,0.15)", color: "#53a743" },
};

function getToolStyle(tool: string) {
  return TOOL_COLORS[tool] ?? { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" };
}

function ThumbnailDisplay({ src, title }: { src: string; title: string }) {
  const type = getMediaType(src);
  // Clean URL (strip cache buster params for display)
  const cleanSrc = src.includes("?") ? src.split("?")[0] + "?" + src.split("?")[1]?.split("&")[0] : src;

  if (type === "video") {
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
        <video
          src={cleanSrc}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
          playsInline
          preload="metadata"
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
        />
        {/* Video badge */}
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
      <div style={{
        width: "100%", aspectRatio: "16/9",
        borderRadius: "14px 14px 0 0", overflow: "hidden",
        background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>Dokumen PDF</span>
        <div style={{
          padding: "4px 12px", borderRadius: 99,
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
          color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
        }}>PDF</div>
      </div>
    );
  }

  // Image (default)
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "14px 14px 0 0", overflow: "hidden", background: "var(--neutral-alpha-weak)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cleanSrc}
        alt={title}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s cubic-bezier(0.34,1.2,0.64,1)" }}
        loading="lazy"
        onError={(e) => {
          // Fallback: grey placeholder
          const el = e.currentTarget.parentElement!;
          el.style.background = "var(--neutral-alpha-medium)";
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  images = [],
  title,
  description,
  link,
  tools = [],
  category,
  attachment,
}) => {
  const router = useRouter();
  const thumbnail = images[0] ?? "";

  return (
    <>
      <style>{`
        .project-card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.2s;
          display: flex;
          flex-direction: column;
        }
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent);
          border-color: var(--neutral-alpha-medium);
        }
        .project-card:hover .proj-thumb img {
          transform: scale(1.04);
        }
        .proj-thumb { position: relative; }
        .proj-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: 14px 14px 0 0;
          display: flex; align-items: flex-end; padding: 16px;
        }
        .project-card:hover .proj-overlay { opacity: 1; }
        .tool-chip {
          display: inline-flex; align-items: center;
          padding: 3px 9px; border-radius: 99px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.02em;
          border: 1px solid rgba(255,255,255,0.07);
          white-space: nowrap;
        }
      `}</style>

      <div className="project-card" onClick={() => router.push(href)}>
        {/* Thumbnail */}
        <div className="proj-thumb">
          {thumbnail ? (
            <ThumbnailDisplay src={thumbnail} title={title} />
          ) : (
            <div style={{
              width: "100%", aspectRatio: "16/9",
              borderRadius: "14px 14px 0 0",
              background: "linear-gradient(135deg, var(--neutral-alpha-weak) 0%, var(--neutral-alpha-medium) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          {/* Hover overlay — "Lihat Detail" */}
          <div className="proj-overlay">
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 99,
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              Lihat Detail
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          {/* Category badge */}
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
          {/* Title */}
          <h3 style={{
            fontSize: 18, fontWeight: 700, lineHeight: 1.3,
            color: "var(--neutral-on-background-strong)",
            margin: 0, letterSpacing: "-0.01em",
          }}>
            {title}
          </h3>

          {/* Description */}
          {description?.trim() && (
            <p style={{
              fontSize: 13, lineHeight: 1.6,
              color: "var(--neutral-on-background-weak)",
              margin: 0, overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {description}
            </p>
          )}

          {/* Tools */}
          {tools.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {tools.slice(0, 6).map((tool) => {
                const style = getToolStyle(tool);
                return (
                  <span key={tool} className="tool-chip" style={{ background: style.bg, color: style.color }}>
                    {tool}
                  </span>
                );
              })}
              {tools.length > 6 && (
                <span className="tool-chip" style={{ background: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)" }}>
                  +{tools.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Footer links */}
          <div style={{ display: "flex", gap: 12, marginTop: "auto", paddingTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(href); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 8,
                background: "var(--brand-alpha-weak)",
                color: "var(--brand-on-background-strong)",
                border: "1px solid var(--brand-alpha-medium)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-alpha-medium)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-alpha-weak)"; }}
            >
              Lihat Karya
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", borderRadius: 8,
                  background: "var(--neutral-alpha-weak)",
                  color: "var(--neutral-on-background-weak)",
                  border: "1px solid var(--neutral-alpha-weak)",
                  fontSize: 12, fontWeight: 500,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-medium)"; e.currentTarget.style.color = "var(--neutral-on-background-strong)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-weak)"; e.currentTarget.style.color = "var(--neutral-on-background-weak)"; }}
              >
                Live Demo
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}

            {attachment && (
              <a
                href={attachment.split("?")[0]}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", borderRadius: 8,
                  background: "var(--neutral-alpha-weak)",
                  color: "var(--neutral-on-background-weak)",
                  border: "1px solid var(--neutral-alpha-weak)",
                  fontSize: 12, fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Unduh
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
