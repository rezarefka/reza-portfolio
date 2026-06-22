"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useLang } from "@/lib/lang-context";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  thumbnail?: string;
  title: string;
  titleEn?: string;
  content: string;
  description: string;
  descriptionEn?: string;
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

/* ── P6: TOOL_COLORS — audit for 4.5:1 contrast, fix Next.js white-on-white ── */
const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
  "React":      { bg: "rgba(97,218,251,0.12)",  color: "#61dafb" },
  /* P6 fix: white text was invisible in light mode → use neutral variable */
  "Next.js":    { bg: "rgba(100,100,100,0.10)", color: "var(--neutral-on-background-strong)" },
  "TypeScript": { bg: "rgba(49,120,198,0.15)",  color: "#3178c6" },
  "Python":     { bg: "rgba(55,118,171,0.15)",  color: "#3776ab" },
  "Figma":      { bg: "rgba(162,89,255,0.15)",  color: "#a259ff" },
  "Supabase":   { bg: "rgba(62,207,142,0.12)",  color: "#3ecf8e" },
  "Tailwind":   { bg: "rgba(56,189,248,0.12)",  color: "#38bdf8" },
  "Flutter":    { bg: "rgba(84,197,248,0.12)",  color: "#54c5f8" },
  "Laravel":    { bg: "rgba(255,45,32,0.12)",   color: "#ff2d20" },
  "Node.js":    { bg: "rgba(83,158,67,0.15)",   color: "#53a743" },
};
/* P6: default fallback menggunakan neutral variable — visible di light & dark */
const getToolStyle = (t: string) =>
  TOOL_COLORS[t] ?? { bg: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-medium)" };

// ─── Ratio detection ─────────────────────────────────────────────────────────
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

function getAspect(ratio: Ratio): string {
  if (ratio === "portrait") return "3/4";
  if (ratio === "square")   return "1/1";
  return "16/9";
}

// ─── Thumbnail ───────────────────────────────────────────────────────────────
function ThumbnailDisplay({ src, title, priority }: { src: string; title: string; priority?: boolean }) {
  const { t } = useLang();
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
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>{t("Dokumen PDF", "PDF Document")}</span>
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
    <div style={wrapStyle} className="proj-thumb-inner">
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
      <NextImage
        src={imgSrc}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
        style={{
          objectFit: ratio === "portrait" ? "contain" : "cover",
          objectPosition: "center",
          /* P8: thumbnail zoom on hover — scale via .project-card:hover CSS */
          transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          background: ratio === "portrait" ? "var(--neutral-background-strong)" : "transparent",
        }}
        priority={priority}
        onError={() => {
          if (imgSrc !== proxyUrl) setImgSrc(proxyUrl);
          else setErrored(true);
        }}
      />
    </div>
  );
}

// ─── Inline Share Menu for Card ───────────────────────────────────────────────
function CardShareMenu({
  title, thumbnail, href, onClose,
}: {
  title: string;
  thumbnail: string;
  href: string;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${href}`
    : href;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1400);
    } catch { onClose(); }
  };

  const toWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`, "_blank", "noopener");
    onClose();
  };

  const toTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`, "_blank", "noopener");
    onClose();
  };

  const nativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try { await navigator.share({ title, url: shareUrl }); } catch { /* cancelled */ }
    }
    onClose();
  };

  const hasNative = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        right: 0,
        width: 220,
        background: "var(--neutral-background-strong)",
        border: "1px solid var(--neutral-alpha-medium)",
        borderRadius: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,0.32), 0 4px 16px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow: "hidden",
        zIndex: 200,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "cardShareIn 0.18s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--neutral-alpha-weak)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "7px 9px", borderRadius: 9,
          background: "var(--neutral-alpha-weak)",
        }}>
          <div style={{
            width: 40, height: 30, borderRadius: 6, overflow: "hidden",
            flexShrink: 0, background: "var(--neutral-alpha-medium)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: "var(--neutral-on-background-strong)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              lineHeight: 1.3,
            }}>{title}</div>
            <div style={{
              fontSize: 9, color: "var(--neutral-on-background-weak)",
              marginTop: 2, opacity: 0.6,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{shareUrl.replace(/^https?:\/\//, "").slice(0, 30)}…</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "5px 0" }}>
        {[
          {
            label: copied ? t("✓ Tersalin!", "✓ Copied!") : t("Salin link", "Copy link"),
            onClick: copyLink,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            ),
          },
          hasNative && {
            label: "Share...",
            onClick: nativeShare,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            ),
          },
          {
            label: "WhatsApp",
            onClick: toWhatsApp,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
              </svg>
            ),
          },
          {
            label: "X (Twitter)",
            onClick: toTwitter,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            ),
          },
        ].filter(Boolean).map((item: unknown, i: number) => {
          const it = item as { label: string; onClick: (e: React.MouseEvent) => void; icon: React.ReactNode };
          return (
            <button
              key={i}
              onClick={it.onClick}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "8px 14px",
                border: "none", background: "transparent",
                color: "var(--neutral-on-background-medium)",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                textAlign: "left", fontFamily: "inherit",
                transition: "background 0.1s, color 0.1s, padding-left 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--neutral-alpha-weak)";
                e.currentTarget.style.color = "var(--neutral-on-background-strong)";
                e.currentTarget.style.paddingLeft = "18px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--neutral-on-background-medium)";
                e.currentTarget.style.paddingLeft = "14px";
              }}
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Card ───────────────────────────────────────────────────────────────
export const ProjectCard: React.FC<ProjectCardProps> = ({
  href, priority, images = [], thumbnail: thumbnailProp,
  title, titleEn, description, descriptionEn, link, tools = [], category, attachment, slug,
}) => {
  const { t, lang } = useLang();
  const displayTitle = lang === "en" && titleEn ? titleEn : title;
  const displayDescription = lang === "en" && descriptionEn ? descriptionEn : description;
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const thumbnail = thumbnailProp || images[0] || "";

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
        /* ── P8: Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .project-card, .proj-thumb-inner img,
          .proj-title::after, .tool-chip, .proj-btn-arrow,
          .proj-btn, .share-icon-btn { transition-duration: 0.01ms !important; }
        }

        @keyframes cardShareIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .project-card {
          position: relative;
          border-radius: 16px; overflow: visible;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1),
                      box-shadow 0.35s ease, border-color 0.2s;
          display: flex; flex-direction: column;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .project-card-inner {
          border-radius: 16px;
          overflow: hidden;
          display: flex; flex-direction: column; flex: 1;
        }
        .project-card:hover {
          border-color: var(--neutral-alpha-medium);
          box-shadow: 0 12px 48px rgba(0,0,0,0.18);
        }

        /* P8: Thumbnail — scale 1→1.04, smooth cubic ── */
        .proj-thumb { position: relative; overflow: hidden; }
        .project-card:hover .proj-thumb-inner img {
          transform: scale(1.04);
        }

        .proj-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.28s ease;
          border-radius: 14px 14px 0 0;
          display: flex; align-items: flex-end; padding: 16px;
        }
        .project-card:hover .proj-overlay { opacity: 1; }

        /* P3: Tool chip padding 4px 12px (was 3px 9px) */
        .tool-chip {
          display: inline-flex; align-items: center;
          padding: 4px 12px;    /* P3 */
          border-radius: 99px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
          border: 1px solid rgba(255,255,255,0.07); white-space: nowrap;
          /* P8: hover translateY with stagger via inline transitionDelay */
          transition: transform 0.2s ease;
          will-change: transform;
        }
        /* P8: Stagger triggered by parent hover, delay set inline */
        .project-card:hover .tool-chip {
          transform: translateY(-2px);
        }

        /* P8: Title underline animate — background-size 0→100% */
        .proj-title {
          position: relative;
        }
        .proj-title::after {
          content: "";
          display: block;
          width: 0%;
          height: 1px;
          background: var(--neutral-on-background-strong);
          transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          margin-top: 3px;
        }
        .project-card:hover .proj-title::after {
          width: 100%;
        }

        .proj-btn {
          display: flex; align-items: center; gap: 8px; /* P3: gap 8px */
          padding: 8px 16px;   /* P3: 8px 16px */
          border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          text-decoration: none; border: none;
          font-family: inherit;
          min-height: 40px;    /* P7: touch target */
        }
        .proj-btn:hover { transform: translateY(-1px); }

        /* P8: CTA arrow slides right on hover */
        .proj-btn-arrow {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .proj-btn:hover .proj-btn-arrow {
          transform: translateX(4px);
        }

        .share-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; /* P3+P7: touch target 40px */
          border-radius: 8px; border: none;
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-weak);
          cursor: pointer; flex-shrink: 0;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          font-family: inherit;
        }
        .share-icon-btn:hover, .share-icon-btn.active {
          background: var(--neutral-alpha-medium);
          color: var(--neutral-on-background-strong);
          transform: translateY(-1px);
        }
      `}</style>

      <div ref={cardRef} className="project-card" onClick={() => router.push(href)}>
        <div className="project-card-inner">
          {/* Thumbnail */}
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
                {t("Lihat Detail", "View Detail")}
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

          {/* P3: Body padding 16px 24px 24px (was 18px 20px 20px) */}
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

            {/* P8: Title with underline microinteraction */}
            <h3
              className="proj-title"
              style={{
                fontSize: 18,         /* P4: md = 20, but 18 keeps card density; use 20 if preferred */
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--neutral-on-background-strong)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {displayTitle}
            </h3>

            {description?.trim() && (
              <p style={{
                fontSize: 14,         /* P4: sm = 14px */
                lineHeight: 1.6,      /* P4: body line-height */
                color: "var(--neutral-on-background-weak)",
                margin: 0, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>{displayDescription}</p>
            )}

            {/* P8: Tool chips with stagger via inline transitionDelay */}
            {tools.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}> {/* P3: gap 8px */}
                {tools.slice(0, 6).map((tool, chipIdx) => {
                  const s = getToolStyle(tool);
                  return (
                    <span
                      key={tool}
                      className="tool-chip"
                      style={{
                        background: s.bg,
                        color: s.color,
                        transitionDelay: `${chipIdx * 40}ms`, /* P8: stagger 40ms */
                      } as React.CSSProperties}
                    >
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

            {/* P3: Action row gap 8px, buttons 8px 16px padding */}
            <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8, alignItems: "center" }}>
              {/* Detail button */}
              <button
                onClick={(e) => { e.stopPropagation(); router.push(href); }}
                className="proj-btn"
                style={{ flex: 1, justifyContent: "center", background: "var(--brand-alpha-weak)", color: "var(--brand-on-background-strong)", border: "1px solid var(--brand-alpha-medium)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-alpha-medium)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand-alpha-weak)"; }}
              >
                {t("Detail Karya", "View Project")}
                {/* P8: Arrow slides right on hover via .proj-btn:hover .proj-btn-arrow */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="proj-btn-arrow">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Share icon button + dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  className={`share-icon-btn${shareOpen ? " active" : ""}`}
                  title={t("Bagikan karya ini", "Share this project")}
                  onClick={(e) => { e.stopPropagation(); setShareOpen((v) => !v); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>

                {shareOpen && (
                  <CardShareMenu
                    title={displayTitle}
                    thumbnail={thumbnail}
                    href={href}
                    onClose={() => setShareOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
