"use client";

import { useState } from "react";

interface ProjectGalleryInlineProps {
  thumbnail: string;
  attachment: string;
  gallery: string[];
  title: string;
}

function detectType(url: string): "image" | "video" | "pdf" {
  if (!url) return "image";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  return "image";
}

/* ── Video player ──────────────────────────────────────────── */
function VideoPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        background: "#000",
        boxShadow: "0 8px 48px rgba(0,0,0,0.3)",
      }}
    >
      <video
        src={src}
        controls
        playsInline
        style={{ width: "100%", maxHeight: "70vh", display: "block", background: "#000" }}
        title={title}
      />
    </div>
  );
}

/* ── PDF viewer ────────────────────────────────────────────── */
function PdfViewer({ src, title }: { src: string; title: string }) {
  const [expanded, setExpanded] = useState(false);
  // Gunakan proxy agar iframe tidak diblokir oleh header X-Frame-Options / CSP
  // yang dikirim langsung dari Supabase Storage
  const proxySrc = `/api/pdf-proxy?url=${encodeURIComponent(src)}`;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--neutral-alpha-weak)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--neutral-background-strong)",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(239,68,68,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--neutral-on-background-strong)",
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
              Dokumen PDF
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid var(--neutral-alpha-medium)",
              background: "var(--neutral-alpha-weak)",
              cursor: "pointer",
              color: "var(--neutral-on-background-weak)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {expanded ? "Kecilkan" : "Perluas"}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "none",
              background: "var(--brand-background-strong)",
              color: "var(--brand-on-background-strong)",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Buka
          </a>
        </div>
      </div>
      <iframe
        src={`${proxySrc}#toolbar=1&navpanes=0`}
        title={title}
        style={{
          width: "100%",
          height: expanded ? "85vh" : "520px",
          border: "none",
          display: "block",
          transition: "height 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

/* ── Image with lightbox ───────────────────────────────────── */
function ImageViewer({ src, title }: { src: string; title: string }) {
  const [lightbox, setLightbox] = useState(false);
  return (
    <>
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.93)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title}
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              }}
            />
          </div>
        </div>
      )}
      <div
        onClick={() => setLightbox(true)}
        style={{
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          cursor: "zoom-in",
          position: "relative",
          background: "var(--neutral-alpha-weak)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          style={{ width: "100%", display: "block", objectFit: "cover" }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 5,
            opacity: 0.8,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Zoom
        </div>
      </div>
    </>
  );
}

/* ── Main export ───────────────────────────────────────────── */
export function ProjectGalleryInline({
  thumbnail,
  attachment,
  gallery,
  title,
}: ProjectGalleryInlineProps) {
  // Collect semua media KECUALI thumbnail (thumbnail tidak ditampilkan di halaman detail)
  const seen = new Set<string>();
  const mediaItems: { url: string; type: "image" | "video" | "pdf" }[] = [];

  // Attachment dulu (video/pdf/image selain thumbnail)
  if (attachment && attachment !== thumbnail) {
    if (!seen.has(attachment)) {
      seen.add(attachment);
      mediaItems.push({ url: attachment, type: detectType(attachment) });
    }
  }

  // Gallery images (kecuali thumbnail)
  for (const g of gallery) {
    if (!g || g === thumbnail || seen.has(g)) continue;
    seen.add(g);
    mediaItems.push({ url: g, type: detectType(g) });
  }

  // Jika attachment == thumbnail (tapi bukan image biasa), tetap tampilkan
  if (
    attachment &&
    attachment === thumbnail &&
    !seen.has(attachment) &&
    detectType(attachment) !== "image"
  ) {
    seen.add(attachment);
    mediaItems.push({ url: attachment, type: detectType(attachment) });
  }

  if (mediaItems.length === 0) return null;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {mediaItems.map((item, i) => (
        <div key={`${item.url}-${i}`}>
          {item.type === "video" && <VideoPlayer src={item.url} title={title} />}
          {item.type === "pdf" && <PdfViewer src={item.url} title={title} />}
          {item.type === "image" && <ImageViewer src={item.url} title={title} />}
        </div>
      ))}
    </div>
  );
}
