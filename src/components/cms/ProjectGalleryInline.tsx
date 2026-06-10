"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ProjectGalleryInlineProps {
  thumbnail: string;
  attachment: string;
  gallery: string[];
  title: string;
}

type MediaType = "image" | "video" | "pdf";

interface MediaItem {
  url: string;
  type: MediaType;
}

function detectType(url: string): MediaType {
  if (!url) return "image";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg|mkv|avi|m4v)$/.test(clean)) return "video";
  if (/\/video\//i.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  return "image";
}

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────────────────────────── */
/* TYPE BADGE                                                            */
/* ──────────────────────────────────────────────────────────────────── */
function TypeBadge({ type }: { type: MediaType }) {
  const cfg = {
    video: { label: "VIDEO", color: "#818cf8", icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg> },
    pdf:   { label: "PDF",   color: "#f87171", icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    image: { label: "IMG",   color: "#34d399", icon: <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  }[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 99,
      fontSize: 9, fontWeight: 800, letterSpacing: "0.09em",
      background: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)",
      border: `1px solid ${cfg.color}44`, color: cfg.color,
    }}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* GRID THUMBNAIL CARD                                                   */
/* ──────────────────────────────────────────────────────────────────── */
function GridCard({
  item, index, isFirst, onClick,
}: {
  item: MediaItem; index: number; isFirst: boolean; onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isPortraitHint = false; // akan terdeteksi saat gambar load
  const aspectRatio = isFirst ? "16/9" : "4/3";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        aspectRatio,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--neutral-background-strong)",
        border: `1px solid ${hovered ? "var(--brand-alpha-medium)" : "var(--neutral-alpha-weak)"}`,
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.3)"
          : "0 2px 12px rgba(0,0,0,0.12)",
      }}
    >
      {/* Shimmer */}
      {!loaded && item.type === "image" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, var(--neutral-alpha-weak) 25%, var(--neutral-alpha-medium) 50%, var(--neutral-alpha-weak) 75%)",
          backgroundSize: "200% 100%", animation: "gcShimmer 1.4s infinite",
        }} />
      )}

      {/* IMAGE */}
      {item.type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url} alt={`item ${index}`}
          loading={index <= 2 ? "eager" : "lazy"} decoding="async"
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s, transform 0.3s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />
      )}

      {/* VIDEO placeholder */}
      {item.type === "video" && (
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(129,140,248,0.15)",
            border: "2px solid rgba(129,140,248,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s, background 0.2s",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#818cf8">
              <polygon points="6 3 20 12 6 21 6 3"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(129,140,248,0.7)", textTransform: "uppercase" }}>
            Putar Video
          </span>
        </div>
      )}

      {/* PDF placeholder */}
      {item.type === "pdf" && (
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(135deg, #1a0a0a 0%, #2a1010 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(248,113,113,0.12)",
            border: "2px solid rgba(248,113,113,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(248,113,113,0.7)", textTransform: "uppercase" }}>
            Lihat PDF
          </span>
        </div>
      )}

      {/* Overlay on hover */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered && item.type === "image" ? 1 : 0,
        transition: "opacity 0.2s",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
      </div>

      {/* Type badge — top left */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3 }}>
        <TypeBadge type={item.type} />
      </div>

      {/* Index number — bottom right */}
      <div style={{
        position: "absolute", bottom: 8, right: 10,
        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)",
        pointerEvents: "none",
      }}>
        {index + 1}
      </div>

      <style>{`@keyframes gcShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* MODAL VIDEO PLAYER                                                    */
/* ──────────────────────────────────────────────────────────────────── */
function ModalVideoPlayer({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [showCtrl, setShowCtrl] = useState(true);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const proxySrc = src.includes("supabase.co") || src.includes("supabase.in")
    ? `/api/video-proxy?url=${encodeURIComponent(src)}`
    : src;

  // Autoplay saat mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    const tryPlay = () => v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
    return () => { v.pause(); };
  }, [proxySrc]);

  const resetHide = useCallback(() => {
    setShowCtrl(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowCtrl(false);
    }, 3000);
  }, []);

  useEffect(() => () => { if (hideRef.current) clearTimeout(hideRef.current); }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else { v.pause(); setPlaying(false); }
    resetHide();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m; });
    resetHide();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setProgress(pct);
    resetHide();
  };

  return (
    <div
      style={{ width: "100%", position: "relative", background: "#000", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}
      onClick={togglePlay}
      onMouseMove={resetHide}
      onMouseLeave={() => { if (playing) setShowCtrl(false); }}
    >
      <video
        ref={videoRef} key={proxySrc}
        src={proxySrc}
        loop playsInline
        preload="metadata"
        onLoadedMetadata={e => {
          const v = e.currentTarget;
          setDuration(v.duration);
        }}
        onTimeUpdate={e => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          setProgress(v.duration ? v.currentTime / v.duration : 0);
        }}
        onError={() => setError(true)}
        onPlay={() => { setPlaying(true); resetHide(); }}
        onPause={() => setPlaying(false)}
        style={{ width: "100%", display: "block", maxHeight: "72vh", objectFit: "contain", background: "#000" }}
        title={title}
      />

      {error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Video tidak dapat dimuat
        </div>
      )}

      {!error && !playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "40px 16px 14px",
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        display: "flex", flexDirection: "column", gap: 8,
        opacity: showCtrl || !playing ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: showCtrl || !playing ? "all" : "none",
      }}>
        <div ref={progressRef} onClick={handleSeek} style={{ width: "100%", height: 3, borderRadius: 99, background: "rgba(255,255,255,0.2)", cursor: "pointer", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: "var(--brand-background-strong, #818cf8)", borderRadius: 99, transition: "width 0.1s linear" }} />
          <div style={{ position: "absolute", top: "50%", left: `${progress * 100}%`, transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: "50%", background: "#fff", boxShadow: "0 0 5px rgba(0,0,0,0.4)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {playing ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>}
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", flexShrink: 0 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={toggleMute} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {muted ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* MODAL PDF VIEWER                                                      */
/* ──────────────────────────────────────────────────────────────────── */
function ModalPdfViewer({ src, title }: { src: string; title: string }) {
  const proxySrc = `/api/pdf-proxy?url=${encodeURIComponent(src)}`;
  return (
    <div style={{ width: "100%", borderRadius: 14, overflow: "hidden", background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-weak)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "var(--neutral-background-strong)", borderBottom: "1px solid var(--neutral-alpha-weak)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--neutral-on-background-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ fontSize: 10, color: "#f87171", marginTop: 1, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 700, opacity: 0.75 }}>PDF Document</div>
        </div>
        <a href={src} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 11, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Buka
        </a>
      </div>
      <iframe src={`${proxySrc}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`} title={title} style={{ width: "100%", height: "clamp(400px, 70vh, 820px)", border: "none", display: "block" }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* FULL SCREEN MODAL                                                     */
/* ──────────────────────────────────────────────────────────────────── */
function MediaModal({
  items,
  startIdx,
  title,
  onClose,
}: {
  items: MediaItem[];
  startIdx: number;
  title: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const total = items.length;
  const current = items[idx];

  // ESC & arrow keys
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && idx > 0) setIdx(i => i - 1);
      if (e.key === "ArrowRight" && idx < total - 1) setIdx(i => i + 1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [idx, total, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.94)", backdropFilter: "blur(24px)",
        display: "flex", flexDirection: "column",
        animation: "modalIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        {/* Left: title + counter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <TypeBadge type={current.type} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
          {total > 1 && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, flexShrink: 0 }}>
              {idx + 1} / {total}
            </span>
          )}
        </div>

        {/* Right: close */}
        <button
          onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          aria-label="Tutup"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* ── Main content area ────────────────────────────────── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, minHeight: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: current.type === "pdf" ? "0" : "16px 60px",
          overflow: current.type === "pdf" ? "hidden" : "auto",
          position: "relative",
        }}
      >
        {/* Content */}
        <div style={{
          width: "100%",
          maxWidth: current.type === "pdf" ? "none" : current.type === "video" ? "900px" : "none",
          maxHeight: current.type === "image" ? "85vh" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {current.type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url} alt={title}
              style={{
                maxWidth: "100%", maxHeight: "82vh",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                display: "block",
                userSelect: "none",
              }}
            />
          )}
          {current.type === "video" && (
            <ModalVideoPlayer key={current.url} src={current.url} title={title} />
          )}
          {current.type === "pdf" && (
            <div style={{ width: "100%", height: "100%" }}>
              <ModalPdfViewer src={current.url} title={title} />
            </div>
          )}
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)); }}
              disabled={idx === 0}
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                cursor: idx === 0 ? "default" : "pointer",
                opacity: idx === 0 ? 0.2 : 0.85,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              aria-label="Sebelumnya"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={e => { e.stopPropagation(); setIdx(i => Math.min(total - 1, i + 1)); }}
              disabled={idx === total - 1}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                cursor: idx === total - 1 ? "default" : "pointer",
                opacity: idx === total - 1 ? 0.2 : 0.85,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              aria-label="Berikutnya"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}
      </div>

      {/* ── Bottom thumbnail strip ────────────────────────────── */}
      {total > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            flexShrink: 0,
            padding: "12px 20px",
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: 8, overflowX: "auto",
            justifyContent: "center", scrollbarWidth: "none",
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                flexShrink: 0, width: 64, height: 44, borderRadius: 8, overflow: "hidden",
                border: `2px solid ${i === idx ? "var(--brand-background-strong)" : "rgba(255,255,255,0.1)"}`,
                cursor: "pointer", padding: 0,
                background: "var(--neutral-alpha-medium)",
                opacity: i === idx ? 1 : 0.5,
                transform: i === idx ? "scale(1.06)" : "scale(1)",
                transition: "all 0.18s",
              }}
              aria-label={`Item ${i + 1}`}
            >
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
              ) : item.type === "video" ? (
                <div style={{ width: "100%", height: "100%", background: "#0f0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(129,140,248,0.85)"><polygon points="5 3 19 12 5 21"/></svg>
                </div>
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#1a0808", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* MAIN EXPORT                                                           */
/* ──────────────────────────────────────────────────────────────────── */
export function ProjectGalleryInline({
  thumbnail, attachment, gallery, title,
}: ProjectGalleryInlineProps) {
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  // Build media list
  const mediaItems = useCallback((): MediaItem[] => {
    const seen = new Set<string>();
    const items: MediaItem[] = [];
    const push = (url: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({ url, type: detectType(url) });
    };
    if (thumbnail) push(thumbnail);
    if (attachment && attachment !== thumbnail) push(attachment);
    for (const g of gallery) {
      if (g && g !== thumbnail && g !== attachment) push(g);
    }
    return items;
  }, [thumbnail, attachment, gallery])();

  const total = mediaItems.length;
  if (total === 0) return null;

  // ── Layout grid ─────────────────────────────────────────
  // 1 item  → full width
  // 2 items → 2 kolom equal
  // 3 items → 1 besar + 2 kecil (kolom kanan)
  // 4+ items → 1 besar + 3 kecil (grid 2x2 kanan)

  const renderGrid = () => {
    if (total === 1) {
      return (
        <div style={{ width: "100%" }}>
          <GridCard item={mediaItems[0]} index={0} isFirst onClick={() => setModalIdx(0)} />
        </div>
      );
    }

    if (total === 2) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {mediaItems.map((item, i) => (
            <GridCard key={i} item={item} index={i} isFirst={i === 0} onClick={() => setModalIdx(i)} />
          ))}
        </div>
      );
    }

    // 3 items: kiri besar (2/3) + kanan 2 kecil stacked (1/3)
    if (total === 3) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <div style={{ gridRow: "1 / 3" }}>
            <GridCard item={mediaItems[0]} index={0} isFirst onClick={() => setModalIdx(0)} />
          </div>
          {mediaItems.slice(1, 3).map((item, i) => (
            <GridCard key={i + 1} item={item} index={i + 1} isFirst={false} onClick={() => setModalIdx(i + 1)} />
          ))}
        </div>
      );
    }

    // 4+ items: kiri besar (2/3) + kanan grid 2x2 (1/3), item ke-5+ tersembunyi dengan overlay "+N"
    const rightItems = mediaItems.slice(1, 5); // maks 4 di kanan
    const hiddenCount = total > 5 ? total - 5 : 0;

    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        {/* Kiri: main */}
        <div style={{ gridRow: "1 / 3" }}>
          <GridCard item={mediaItems[0]} index={0} isFirst onClick={() => setModalIdx(0)} />
        </div>
        {/* Kanan: 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {rightItems.map((item, i) => {
            const isLast = i === rightItems.length - 1 && hiddenCount > 0;
            return (
              <div key={i + 1} style={{ position: "relative" }}>
                <GridCard item={item} index={i + 1} isFirst={false} onClick={() => setModalIdx(i + 1)} />
                {isLast && (
                  <div
                    onClick={() => setModalIdx(i + 1)}
                    style={{
                      position: "absolute", inset: 0, borderRadius: 14,
                      background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      cursor: "pointer", gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>+{hiddenCount + 1}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.05em" }}>LIHAT SEMUA</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Grid preview ─────────────────────────────────────── */}
      <div style={{ width: "100%" }}>
        {renderGrid()}

        {/* Total count label */}
        {total > 1 && (
          <div style={{
            marginTop: 10,
            display: "flex", alignItems: "center", gap: 8,
            justifyContent: "flex-end",
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: "var(--neutral-on-background-weak)",
              letterSpacing: "0.04em",
            }}>
              {total} file media
            </span>
            <button
              onClick={() => setModalIdx(0)}
              style={{
                fontSize: 11, fontWeight: 700,
                color: "var(--brand-on-background-strong)",
                background: "var(--brand-alpha-weak)",
                border: "1px solid var(--brand-alpha-medium)",
                borderRadius: 99, padding: "3px 12px",
                cursor: "pointer", letterSpacing: "0.03em",
                transition: "background 0.15s",
              }}
            >
              Lihat Semua →
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────── */}
      {modalIdx !== null && (
        <MediaModal
          items={mediaItems}
          startIdx={modalIdx}
          title={title}
          onClose={() => setModalIdx(null)}
        />
      )}
    </>
  );
}
