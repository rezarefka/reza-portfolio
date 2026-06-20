"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";

interface MediaItem {
  url: string;
  type: "image" | "video" | "pdf";
}

interface GalleryViewerProps {
  title: string;
  titleEn?: string;
  slug: string;
  items: MediaItem[];
}

function VideoItem({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        style={{ width: "100%", maxHeight: "70vh", display: "block", background: "#000" }}
        title={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {/* Video badge */}
      <div style={{
        position: "absolute", top: 12, left: 12,
        padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        color: "#fff", letterSpacing: "0.06em",
        display: "flex", alignItems: "center", gap: 5,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        VIDEO
      </div>
    </div>
  );
}

function ImageItem({ url, title, index }: { url: string; title: string; index: number }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <style>{`@keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", cursor: "pointer", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "90vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} ${index + 1}`}
              style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
            />
          </div>
        </div>
      )}

      <div
        onClick={() => setLightbox(true)}
        style={{
          width: "100%", borderRadius: 16, overflow: "hidden",
          cursor: "zoom-in", position: "relative",
          background: "var(--neutral-alpha-weak)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.01)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.35)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)";
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`${title} ${index + 1}`}
          style={{ width: "100%", display: "block", objectFit: "cover" }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Zoom hint */}
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          color: "#fff", opacity: 0.8,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          Zoom
        </div>
      </div>
    </>
  );
}

function PdfItem({ url, title }: { url: string; title: string }) {
  const { t } = useLang();
  return (
    <div style={{ width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid var(--neutral-alpha-weak)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: "var(--neutral-background-strong)",
        borderBottom: "1px solid var(--neutral-alpha-weak)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-on-background-strong)" }}>{title}</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          padding: "5px 12px", borderRadius: 8, background: "var(--brand-background-strong)",
          color: "var(--brand-on-background-strong)", fontSize: 12, fontWeight: 600, textDecoration: "none",
        }}>
          {t("Buka PDF", "Open PDF")}
        </a>
      </div>
      <iframe src={`${url}#toolbar=1`} title={title} style={{ width: "100%", height: "60vh", border: "none", display: "block" }} />
    </div>
  );
}

export function GalleryViewer({ title, titleEn, slug, items }: GalleryViewerProps) {
  const router = useRouter();
  const { t, lang } = useLang();
  const displayTitle = lang === "en" && titleEn ? titleEn : title;
  const [filter, setFilter] = useState<"all" | "image" | "video" | "pdf">("all");

  const counts = {
    all: items.length,
    image: items.filter((i) => i.type === "image").length,
    video: items.filter((i) => i.type === "video").length,
    pdf: items.filter((i) => i.type === "pdf").length,
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.push(`/project/${slug}`)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, marginBottom: 20,
            background: "var(--neutral-alpha-weak)", border: "1px solid var(--neutral-alpha-medium)",
            color: "var(--neutral-on-background-weak)", fontSize: 13, fontWeight: 500, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-medium)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-weak)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t("Kembali ke Detail", "Back to Detail")}
        </button>

        <h1 style={{
          fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800,
          color: "var(--neutral-on-background-strong)", margin: "0 0 6px",
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          {t("Galeri Karya", "Project Gallery")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--neutral-on-background-weak)", margin: 0 }}>
          {displayTitle} · {items.length} media
        </p>
      </div>

      {/* Filter tabs */}
      {items.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {(["all", "image", "video", "pdf"] as const).map((f) => {
            if (f !== "all" && counts[f] === 0) return null;
            const labels = { all: t("Semua", "All"), image: t("Gambar", "Image"), video: "Video", pdf: "PDF" };
            const icons = {
              all: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
              image: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
              video: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
              pdf: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
            };
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  background: active ? "var(--brand-background-strong)" : "var(--neutral-alpha-weak)",
                  color: active ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
                  border: active ? "1px solid var(--brand-alpha-medium)" : "1px solid var(--neutral-alpha-medium)",
                }}
              >
                {icons[f]}
                {labels[f]}
                <span style={{
                  fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
                  borderRadius: 99, background: active ? "rgba(255,255,255,0.2)" : "var(--neutral-alpha-medium)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "0 5px",
                }}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Media list — scrollable vertical stack */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--neutral-on-background-weak)" }}>
          {t("Tidak ada media untuk filter ini.", "No media for this filter.")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {filtered.map((item, i) => (
            <div key={`${item.url}-${i}`}>
              {item.type === "video" && <VideoItem url={item.url} title={title} />}
              {item.type === "image" && <ImageItem url={item.url} title={title} index={i} />}
              {item.type === "pdf" && <PdfItem url={item.url} title={title} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
