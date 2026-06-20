"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { GalleryItem, GalleryDisplayMode } from "@/lib/types";
import { useLang } from "@/lib/lang-context";

interface ProjectGalleryInlineProps {
  thumbnail: string;
  attachment: string;
  gallery: GalleryItem[];
  title: string;
  displayMode?: GalleryDisplayMode;
}

type MediaType = "image" | "video";

interface MediaItem {
  url: string;
  type: MediaType;
  caption: string;
}

function detectType(url: string): MediaType {
  if (!url) return "image";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg|mkv|avi|m4v)$/.test(clean)) return "video";
  if (/\/video\//i.test(clean)) return "video";
  return "image";
}

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────────────────────────── */
/* VIDEO SLIDE                                                          */
/* ──────────────────────────────────────────────────────────────────── */
function VideoSlide({
  src,
  title,
  active,
}: {
  src: string;
  title: string;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [showCtrl, setShowCtrl] = useState(true);
  // Frame pertama sudah siap ditampilkan? (bukan soal rasio lagi — rasio sekarang DIKUNCI
  // 16:9 secara permanen, jadi box tidak akan pernah melebar/menyusut baik sebelum maupun
  // sesudah video diputar). Dipakai untuk menyembunyikan shimmer begitu video benar2 tampil.
  const [frameReady, setFrameReady] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLang();

  const proxySrc =
    src.includes("supabase.co") || src.includes("supabase.in")
      ? `/api/video-proxy?url=${encodeURIComponent(src)}`
      : src;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.muted = true;
      setMuted(true);
      const tryPlay = () =>
        v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      if (v.readyState >= 2) tryPlay();
      else v.addEventListener("loadeddata", tryPlay, { once: true });
    } else {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
    return () => { v.pause(); };
  }, [active, proxySrc]);

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
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
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
      style={{
        width: "100%",
        position: "relative",
        background: "#000",
        overflow: "hidden",
        cursor: "pointer",
        // Rasio dikunci PERMANEN 16:9 — tidak pernah dihitung ulang dari metadata video,
        // jadi box tidak akan melebar/menyusut baik sebelum, sesudah, maupun saat ganti video.
        aspectRatio: "16 / 9",
      }}
      onClick={togglePlay}
      onMouseMove={resetHide}
      onMouseLeave={() => { if (playing) setShowCtrl(false); }}
    >
      <video
        ref={videoRef}
        key={proxySrc}
        src={proxySrc}
        loop
        playsInline
        muted={muted}
        // preload="auto" agar frame pertama langsung dibuffer
        preload="auto"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        // frame pertama benar2 sudah bisa digambar di layar → baru sembunyikan shimmer
        onLoadedData={() => setFrameReady(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          setProgress(v.duration ? v.currentTime / v.duration : 0);
        }}
        onError={() => setError(true)}
        onPlay={() => { setPlaying(true); setFrameReady(true); resetHide(); }}
        onPause={() => setPlaying(false)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          background: "#000",
        }}
        title={title}
      />

      {/* Shimmer animasi nyata (bukan gradien diam) — tampil sampai frame pertama siap,
          supaya yang terlihat adalah "sedang memuat", bukan kotak hitam kosong/rusak */}
      {!error && !frameReady && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(100deg, #0c0c12 30%, #1d1d2e 50%, #0c0c12 70%)",
          backgroundSize: "200% 100%",
          animation: "pgShimmer 1.4s infinite",
        }} />
      )}

      {error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {t("Video tidak dapat dimuat", "Video could not be loaded")}
        </div>
      )}

      {!error && !playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
        </div>
      )}

      {playing && muted && (
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          {t("Tap untuk suara", "Tap for sound")}
        </div>
      )}

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
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {playing ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>}
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", flexShrink: 0 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={toggleMute} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {muted
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* IMAGE SLIDE                                                          */
/* ──────────────────────────────────────────────────────────────────── */
function ImageSlide({
  src,
  title,
  onClick,
}: {
  src: string;
  title: string;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<string>("auto");

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNaturalRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
    }
    setLoaded(true);
  };

  return (
    <div
      onClick={onClick}
      style={{
        width: "100%",
        aspectRatio: naturalRatio,
        background: "var(--neutral-background-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        maxHeight: "80vh",
      }}
    >
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, var(--neutral-alpha-weak) 25%, var(--neutral-alpha-medium) 50%, var(--neutral-alpha-weak) 75%)",
          backgroundSize: "200% 100%",
          animation: "pgShimmer 1.4s infinite",
        }} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        onLoad={handleLoad}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.35s",
          userSelect: "none",
        }}
        draggable={false}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0)",
        transition: "background 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
        className="image-slide-overlay"
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.0)",
          border: "1.5px solid rgba(255,255,255,0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
          className="image-slide-zoom"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* FULLSCREEN LIGHTBOX MODAL                                            */
/* ──────────────────────────────────────────────────────────────────── */
function LightboxModal({
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
  const { t } = useLang();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && idx > 0) setIdx((i) => i - 1);
      if (e.key === "ArrowRight" && idx < total - 1) setIdx((i) => i + 1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [idx, total, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(total - 1, i + 1));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.96)", backdropFilter: "blur(28px)",
        display: "flex", flexDirection: "column",
        animation: "pgModalIn 0.22s ease",
      }}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 99,
            fontSize: 9, fontWeight: 800, letterSpacing: "0.09em",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            border: current.type === "video" ? "1px solid rgba(129,140,248,0.4)" : "1px solid rgba(52,211,153,0.4)",
            color: current.type === "video" ? "#818cf8" : "#34d399",
          }}>
            {current.type === "video"
              ? <><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>VIDEO</>
              : <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>{t("FOTO", "PHOTO")}</>
            }
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
          {total > 1 && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, flexShrink: 0 }}>
              {idx + 1} / {total}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Main area */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1, minHeight: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 64px",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div style={{ width: "100%", maxWidth: current.type === "video" ? 900 : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {current.type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={current.caption || title}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                display: "block",
                userSelect: "none",
              }}
            />
          )}
          {current.type === "video" && (
            <VideoSlide key={current.url} src={current.url} title={title} active={true} />
          )}
        </div>

        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              disabled={idx === 0}
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                cursor: idx === 0 ? "default" : "pointer",
                opacity: idx === 0 ? 0.2 : 0.9,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => { if (idx !== 0) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              disabled={idx === total - 1}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                cursor: idx === total - 1 ? "default" : "pointer",
                opacity: idx === total - 1 ? 0.2 : 0.9,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => { if (idx !== total - 1) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}
      </div>

      {current.caption && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0,
            padding: "12px 24px",
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
            fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {current.caption}
        </div>
      )}

      {total > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0,
            padding: "12px 20px",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
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
                transform: i === idx ? "scale(1.08)" : "scale(1)",
                transition: "all 0.18s",
              }}
            >
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#0f0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(129,140,248,0.85)"><polygon points="5 3 19 12 5 21"/></svg>
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
/* MODE A: SLIDER (default)                                            */
/* ──────────────────────────────────────────────────────────────────── */
function SliderGallery({
  mediaItems,
  title,
}: {
  mediaItems: MediaItem[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const { t } = useLang();

  const total = mediaItems.length;
  const current = mediaItems[activeIdx];

  const goTo = (i: number) => setActiveIdx(Math.max(0, Math.min(total - 1, i)));
  const prev = () => goTo(activeIdx - 1);
  const next = () => goTo(activeIdx + 1);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <>
      <div
        style={{ width: "100%", borderRadius: 16, overflow: "hidden", background: "var(--neutral-background-strong)", border: "1px solid var(--neutral-alpha-weak)", position: "relative" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: "relative", width: "100%", background: "#0a0a0f" }}>
          {current.type === "video" ? (
            <VideoSlide key={current.url} src={current.url} title={title} active={true} />
          ) : (
            <ImageSlide key={current.url} src={current.url} title={current.caption || title} onClick={() => setLightboxIdx(activeIdx)} />
          )}

          {total > 1 && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 99, padding: "4px 10px",
              fontSize: 11, fontWeight: 700,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.04em",
              pointerEvents: "none",
              zIndex: 5,
            }}>
              {activeIdx + 1} / {total}
            </div>
          )}

          {current.type === "image" && (
            <button
              onClick={() => setLightboxIdx(activeIdx)}
              style={{
                position: "absolute", top: 12, left: 12,
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 5, transition: "all 0.18s",
              }}
              title="Fullscreen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            </button>
          )}

          {total > 1 && (
            <>
              <button
                onClick={prev}
                disabled={activeIdx === 0}
                className="pg-arrow"
                style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                  cursor: activeIdx === 0 ? "default" : "pointer",
                  opacity: activeIdx === 0 ? 0.15 : 0.85,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button
                onClick={next}
                disabled={activeIdx === total - 1}
                className="pg-arrow"
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                  cursor: activeIdx === total - 1 ? "default" : "pointer",
                  opacity: activeIdx === total - 1 ? 0.15 : 0.85,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}
        </div>

        {current.caption && (
          <div style={{
            padding: "12px 20px",
            background: "var(--neutral-background-medium)",
            borderTop: "1px solid var(--neutral-alpha-weak)",
            fontSize: 13, color: "var(--neutral-on-background-medium)", lineHeight: 1.6,
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-strong)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontStyle: "italic" }}>{current.caption}</span>
          </div>
        )}

        {total > 1 && (
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid var(--neutral-alpha-weak)",
            background: "var(--neutral-background-strong)",
            display: "flex", gap: 8, overflowX: "auto",
            scrollbarWidth: "none", alignItems: "center",
          }}>
            {mediaItems.map((item, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="pg-thumb-btn"
                style={{
                  flexShrink: 0, width: 56, height: 40, borderRadius: 7,
                  border: `2px solid ${i === activeIdx ? "var(--brand-background-strong)" : "rgba(255,255,255,0.08)"}`,
                  background: "var(--neutral-background-medium)",
                  opacity: i === activeIdx ? 1 : 0.55,
                  transform: i === activeIdx ? "scale(1.06)" : "scale(1)",
                  position: "relative", overflow: "hidden",
                }}
                title={item.caption || `${t("Gambar", "Image")} ${i + 1}`}
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(129,140,248,0.9)"><polygon points="5 3 19 12 5 21"/></svg>
                  </div>
                )}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
              {total <= 10 && mediaItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="pg-dot"
                  style={{
                    width: i === activeIdx ? 18 : 6,
                    height: 6, borderRadius: 99,
                    background: i === activeIdx ? "var(--brand-background-strong)" : "var(--neutral-alpha-medium)",
                    border: "none", padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <LightboxModal
          items={mediaItems}
          startIdx={lightboxIdx}
          title={title}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* MODE B: SCROLL HORIZONTAL                                           */
/* ──────────────────────────────────────────────────────────────────── */
function ScrollHorizontalGallery({
  mediaItems,
  title,
}: {
  mediaItems: MediaItem[];
  title: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const { t } = useLang();

  const total = mediaItems.length;

  // Sync scroll position → active dot
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const itemW = el.scrollWidth / total;
    setActiveIdx(Math.round(el.scrollLeft / itemW));
  };

  // Mousewheel horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY || e.deltaX;
    }
  };

  // Click drag
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = dragStartX.current - e.clientX;
    scrollRef.current.scrollLeft = dragScrollLeft.current + dx;
  };
  const handleMouseUp = () => { isDragging.current = false; };

  const scrollToIdx = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const itemW = el.scrollWidth / total;
    el.scrollTo({ left: i * itemW, behavior: "smooth" });
    setActiveIdx(i);
  };

  const goNext = () => scrollToIdx(Math.min(total - 1, activeIdx + 1));
  const goPrev = () => scrollToIdx(Math.max(0, activeIdx - 1));

  return (
    <>
      <div style={{
        width: "100%", borderRadius: 16, overflow: "hidden",
        background: "var(--neutral-background-strong)",
        border: "1px solid var(--neutral-alpha-weak)",
        position: "relative",
      }}>
        {/* Header bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          background: "var(--neutral-background-medium)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 99,
              background: "var(--brand-alpha-weak)", border: "1px solid var(--brand-alpha-medium)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              color: "var(--brand-on-background-strong)",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              SCROLL HORIZONTAL
            </div>
            <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", fontWeight: 500 }}>
              {total} item · {t("geser atau drag", "swipe or drag")}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={goPrev}
              disabled={activeIdx === 0}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--neutral-background-strong)",
                border: "1px solid var(--neutral-alpha-medium)",
                cursor: activeIdx === 0 ? "default" : "pointer",
                opacity: activeIdx === 0 ? 0.25 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--neutral-on-background-medium)", transition: "opacity 0.2s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={goNext}
              disabled={activeIdx === total - 1}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--neutral-background-strong)",
                border: "1px solid var(--neutral-alpha-medium)",
                cursor: activeIdx === total - 1 ? "default" : "pointer",
                opacity: activeIdx === total - 1 ? 0.25 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--neutral-on-background-medium)", transition: "opacity 0.2s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            padding: "14px",
            cursor: isDragging.current ? "grabbing" : "grab",
            userSelect: "none",
            background: "#0a0a0f",
          }}
        >
          {mediaItems.map((item, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: item.type === "video" ? "min(85vw, 640px)" : "min(75vw, 480px)",
                scrollSnapAlign: "start",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#000",
                position: "relative",
              }}
            >
              {item.type === "video" ? (
                <VideoSlide src={item.url} title={title} active={false} />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.caption || title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      maxHeight: "60vh",
                      objectFit: "contain",
                      background: "#000",
                    }}
                    draggable={false}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                    style={{
                      position: "absolute", top: 8, left: 8,
                      width: 30, height: 30, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title={t("Buka fullscreen", "Open fullscreen")}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                  </button>
                </>
              )}
              {item.caption && (
                <div style={{
                  padding: "8px 12px",
                  fontSize: 12, fontStyle: "italic",
                  color: "rgba(255,255,255,0.55)",
                  background: "rgba(0,0,0,0.55)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {item.caption}
                </div>
              )}
              {/* Index badge */}
              <div style={{
                position: "absolute", bottom: item.caption ? "auto" : 8, top: 8, right: 8,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 99, padding: "2px 7px",
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)",
              }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Dot progress */}
        {total > 1 && (
          <div style={{
            padding: "10px", display: "flex", justifyContent: "center", gap: 6,
            borderTop: "1px solid var(--neutral-alpha-weak)",
            background: "var(--neutral-background-strong)",
          }}>
            {mediaItems.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIdx(i)}
                style={{
                  width: i === activeIdx ? 20 : 6,
                  height: 6, borderRadius: 99, border: "none", padding: 0,
                  cursor: "pointer",
                  background: i === activeIdx ? "var(--brand-background-strong)" : "var(--neutral-alpha-medium)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <LightboxModal
          items={mediaItems}
          startIdx={lightboxIdx}
          title={title}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* MODE C: SCROLL VERTICAL                                             */
/* ──────────────────────────────────────────────────────────────────── */
function ScrollVerticalGallery({
  mediaItems,
  title,
}: {
  mediaItems: MediaItem[];
  title: string;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const total = mediaItems.length;
  const { t } = useLang();

  return (
    <>
      <div style={{
        width: "100%", borderRadius: 16, overflow: "hidden",
        background: "var(--neutral-background-strong)",
        border: "1px solid var(--neutral-alpha-weak)",
      }}>
        {/* Header bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          background: "var(--neutral-background-medium)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 99,
              background: "var(--brand-alpha-weak)", border: "1px solid var(--brand-alpha-medium)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              color: "var(--brand-on-background-strong)",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              SCROLL VERTIKAL
            </div>
            <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", fontWeight: 500 }}>
              {total} item · {t("scroll ke bawah", "scroll down")}
            </span>
          </div>
        </div>

        {/* Vertical stacked items */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          background: "#0a0a0f",
          padding: "14px",
        }}>
          {mediaItems.map((item, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#000",
                position: "relative",
              }}
            >
              {item.type === "video" ? (
                <VideoSlide src={item.url} title={title} active={false} />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.caption || title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      objectFit: "contain",
                      background: "#000",
                    }}
                  />
                  <button
                    onClick={() => setLightboxIdx(i)}
                    style={{
                      position: "absolute", top: 10, left: 10,
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.85)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title={t("Buka fullscreen", "Open fullscreen")}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Caption + counter footer */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "8px 12px",
                background: "rgba(0,0,0,0.6)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{
                  flexShrink: 0,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--brand-alpha-medium)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: "var(--brand-on-background-strong)",
                }}>
                  {i + 1}
                </span>
                {item.caption ? (
                  <span style={{ fontSize: 12, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    {item.caption}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    {item.type === "video" ? "Video" : t("Gambar", "Image")} {i + 1} {t("dari", "of")} {total}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <LightboxModal
          items={mediaItems}
          startIdx={lightboxIdx}
          title={title}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* MAIN EXPORT                                                          */
/* ──────────────────────────────────────────────────────────────────── */
export function ProjectGalleryInline({
  thumbnail,
  attachment,
  gallery,
  title,
  displayMode = "slider",
}: ProjectGalleryInlineProps) {
  // Build ordered media list from gallery JSONB, fallback thumbnail + attachment
  const mediaItems = useCallback((): MediaItem[] => {
    const seen = new Set<string>();
    const items: MediaItem[] = [];

    for (const g of gallery) {
      const url = g.url?.split("?")[0];
      if (!url || seen.has(url)) continue;
      seen.add(url);
      items.push({ url, type: detectType(url), caption: g.caption ?? "" });
    }

    if (items.length === 0) {
      const thumbClean = thumbnail?.split("?")[0];
      const attachClean = attachment?.split("?")[0];
      if (thumbClean && !seen.has(thumbClean)) {
        seen.add(thumbClean);
        items.push({ url: thumbClean, type: detectType(thumbClean), caption: "" });
      }
      if (attachClean && !seen.has(attachClean)) {
        seen.add(attachClean);
        items.push({ url: attachClean, type: detectType(attachClean), caption: "" });
      }
    }

    return items;
  }, [thumbnail, attachment, gallery])();

  if (mediaItems.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes pgModalIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes pgShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .image-slide-overlay:hover { background: rgba(0,0,0,0.32) !important; }
        .image-slide-overlay:hover .image-slide-zoom {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
        .pg-dot { transition: all 0.2s; cursor: pointer; border: none; padding: 0; }
        .pg-dot:hover { transform: scale(1.2); }
        .pg-thumb-btn { transition: all 0.18s; border: none; cursor: pointer; padding: 0; overflow: hidden; }
        .pg-thumb-btn:hover { opacity: 1 !important; }
        .pg-arrow { transition: all 0.18s; }
        .pg-arrow:not(:disabled):hover { transform: translateY(-50%) scale(1.1); background: rgba(0,0,0,0.7) !important; }
      `}</style>

      {displayMode === "scroll-horizontal" && (
        <ScrollHorizontalGallery mediaItems={mediaItems} title={title} />
      )}
      {displayMode === "scroll-vertical" && (
        <ScrollVerticalGallery mediaItems={mediaItems} title={title} />
      )}
      {(displayMode === "slider" || !displayMode) && (
        <SliderGallery mediaItems={mediaItems} title={title} />
      )}
    </>
  );
}
