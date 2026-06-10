"use client";

import { useState, useRef, useEffect } from "react";

interface ProjectMediaPreviewProps {
  thumbnail: string;
  attachment: string;
  title: string;
  gallery: string[];
}

function getMediaType(url: string): "image" | "video" | "pdf" | null {
  if (!url) return null;
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  return "image";
}

/* ── Video Player — autoplay muted, native aspect ratio ── */
function VideoPlayer({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("16/9");
  const [muted, setMuted] = useState(true);

  const handleMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.videoWidth && v.videoHeight) {
      setAspectRatio(`${v.videoWidth}/${v.videoHeight}`);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  return (
    <div
      style={{
        width: "100%",
        aspectRatio,
        borderRadius: 16,
        overflow: "hidden",
        background: "#000",
        boxShadow: "0 8px 48px rgba(0,0,0,0.3)",
        position: "relative",
        transition: "aspect-ratio 0.3s ease",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={handleMetadata}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          background: "#000",
        }}
        title={title}
      />
      {/* Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          VIDEO
        </div>
        <button
          onClick={toggleMute}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
          }}
          aria-label={muted ? "Aktifkan suara" : "Matikan suara"}
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Elegant PDF Card Viewer ─────────────────────────────────────── */
function PdfViewer({ src, title }: { src: string; title: string }) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--neutral-background-medium)",
        border: "1px solid var(--neutral-alpha-weak)",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, var(--brand-background-strong) 0%, transparent 70%)",
          borderRadius: "20px 20px 0 0",
          zIndex: 1,
        }}
      />
      <div
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "18px 22px",
          background: "var(--neutral-background-strong)",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
        }}
      >
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ef4444", flexShrink: 0,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="15" y2="17" />
            <polyline points="9 9 10 9" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--neutral-on-background-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", marginTop: 2, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 500 }}>
            Dokumen PDF
          </div>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--neutral-alpha-weak)", border: "1px solid var(--neutral-alpha-medium)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--neutral-on-background-weak)", flexShrink: 0, textDecoration: "none",
          }}
          title="Buka di tab baru"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
      <div style={{ position: "relative" }}>
        <iframe
          src={`${src}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          title={title}
          style={{ width: "100%", height: "clamp(400px, 75vh, 800px)", border: "none", display: "block", background: "var(--neutral-background-weak)" }}
        />
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 32,
            background: "linear-gradient(to top, var(--neutral-background-medium) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function ImageLightbox({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "lightIn 0.2s ease",
      }}
    >
      <style>{`@keyframes lightIn { from{opacity:0} to{opacity:1} }`}</style>
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20, width: 44, height: 44,
          borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "90vh" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        />
      </div>
    </div>
  );
}

export function ProjectMediaPreview({ thumbnail, attachment, title, gallery }: ProjectMediaPreviewProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  const attachType = attachment ? getMediaType(attachment) : null;

  const allImages = [
    ...(thumbnail ? [thumbnail] : []),
    ...gallery.filter((g) => g !== thumbnail && getMediaType(g) === "image"),
  ];

  return (
    <>
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} title={title} onClose={() => setLightboxSrc(null)} />
      )}

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>

        {attachment && attachType === "video" && (
          <VideoPlayer src={attachment} title={title} />
        )}

        {attachment && attachType === "pdf" && (
          <PdfViewer src={attachment} title={title} />
        )}

        {allImages.length > 0 && (
          <ImageGallery
            images={allImages}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            title={title}
            onZoom={setLightboxSrc}
          />
        )}

        {attachment && attachType === "image" && attachment !== thumbnail && (
          <div
            onClick={() => setLightboxSrc(attachment)}
            style={{ width: "100%", borderRadius: 16, overflow: "hidden", background: "var(--neutral-alpha-weak)", cursor: "zoom-in" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment}
              alt={`${title} — attachment`}
              style={{ width: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
        )}
      </div>
    </>
  );
}

/* ── Image gallery sub-component with natural aspect ratio ── */
function ImageGallery({
  images,
  activeImg,
  setActiveImg,
  title,
  onZoom,
}: {
  images: string[];
  activeImg: number;
  setActiveImg: (i: number) => void;
  title: string;
  onZoom: (src: string) => void;
}) {
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Reset on image change
  useEffect(() => {
    setNaturalRatio(null);
    setLoaded(false);
  }, [activeImg]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.naturalWidth && el.naturalHeight) {
      setNaturalRatio(el.naturalWidth / el.naturalHeight);
    }
    setLoaded(true);
  };

  const aspectRatio = naturalRatio ? `${naturalRatio}` : "16/9";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        onClick={() => onZoom(images[activeImg])}
        style={{
          width: "100%",
          aspectRatio,
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--neutral-alpha-weak)",
          cursor: "zoom-in",
          position: "relative",
          transition: "aspect-ratio 0.3s ease",
        }}
      >
        {!loaded && (
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, var(--neutral-alpha-weak) 25%, var(--neutral-alpha-medium) 50%, var(--neutral-alpha-weak) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer2 1.4s infinite",
            }}
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[activeImg]}
          src={images[activeImg]}
          alt={`${title} — ${activeImg + 1}`}
          onLoad={handleLoad}
          style={{
            width: "100%", height: "100%",
            objectFit: "contain", display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.25s",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: 12, right: 12,
            padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
            color: "#fff", display: "flex", alignItems: "center", gap: 5, opacity: 0.75,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Zoom
        </div>
        {images.length > 1 && (
          <div
            style={{
              position: "absolute", bottom: 12, left: 12,
              padding: "4px 10px", borderRadius: 99, fontSize: 11,
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: "#fff",
            }}
          >
            {activeImg + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              style={{
                flexShrink: 0, width: 80, height: 56, borderRadius: 8, overflow: "hidden",
                border: `2px solid ${i === activeImg ? "var(--brand-background-strong)" : "transparent"}`,
                cursor: "pointer", padding: 0, background: "var(--neutral-alpha-weak)",
                transition: "border-color 0.18s, opacity 0.18s",
                opacity: i === activeImg ? 1 : 0.55,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`thumb ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer2 {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  );
}
