"use client";

import { useState, useEffect, useCallback } from "react";
import { gallery } from "@/resources";
import { createClient } from "@/lib/supabase/client";
import { GallerySkeletonGrid } from "@/components/Skeletons";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  orientation: "horizontal" | "vertical";
  created_at: string;
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  photo: { url: string; caption?: string | null; alt?: string };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "lightboxIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`
        @keyframes lightboxIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes imgZoomIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          color: "#fff", cursor: "pointer", fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.18s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.18s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{
            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.18s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          maxWidth: "90vw", maxHeight: "90vh",
          animation: "imgZoomIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || photo.alt || "gallery photo"}
          style={{
            maxWidth: "88vw",
            maxHeight: "78vh",
            objectFit: "contain",
            borderRadius: 16,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        />
        {photo.caption && (
          <p style={{
            marginTop: 16, color: "rgba(255,255,255,0.7)",
            fontSize: 14, textAlign: "center",
            fontStyle: "italic", maxWidth: 480,
          }}>
            {photo.caption}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main GalleryView ─────────────────────────────────────────────────────────
export default function GalleryView() {
  const [dbPhotos, setDbPhotos] = useState<GalleryPhoto[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load photos from Supabase (gallery_photos table)
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data } = await supabase
          .from("gallery_photos")
          .select("*")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) setDbPhotos(data);
      } catch {
        // silently fall through to static fallback
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Merge: DB photos first, then static fallback
  const allPhotos = dbPhotos.length > 0
    ? dbPhotos.map((p) => ({ url: p.url, alt: p.caption || "gallery", orientation: p.orientation, caption: p.caption }))
    : gallery.images.map((img) => ({ url: img.src, alt: img.alt, orientation: img.orientation, caption: null }));

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevPhoto = useCallback(() => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback(() => setLightboxIdx((i) => (i !== null && i < allPhotos.length - 1 ? i + 1 : i)), [allPhotos.length]);

  return (
    <>
      <style>{`
        @keyframes galleryItemIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          cursor: zoom-in;
          background: var(--neutral-alpha-weak);
          transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease;
          break-inside: avoid;
          margin-bottom: 12px;
        }
        .gallery-item:hover {
          transform: scale(1.02) translateY(-2px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.22);
          z-index: 2;
        }
        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s ease;
          display: flex;
          align-items: flex-end;
          padding: 14px 16px;
          border-radius: inherit;
        }
        .gallery-img {
          width: 100%;
          display: block;
          transition: transform 0.4s cubic-bezier(0.34,1.2,0.64,1);
        }
        .gallery-item:hover .gallery-img {
          transform: scale(1.04);
        }
      `}</style>

      {/* Skeleton while loading */}
      {isLoading ? (
        <GallerySkeletonGrid count={8} />
      ) : (
        <div style={{
          columns: "2 280px",
          gap: 12,
          width: "100%",
        }}>
        {allPhotos.map((photo, idx) => (
          <div
            key={idx}
            className="gallery-item"
            onClick={() => openLightbox(idx)}
            style={{
              animation: `galleryItemIn 0.5s cubic-bezier(0.22,1,0.36,1) ${idx * 60}ms both`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.alt}
              className="gallery-img"
              style={{
                aspectRatio: photo.orientation === "horizontal" ? "16/9" : "3/4",
                objectFit: "cover",
                opacity: loaded.has(idx) ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
              onLoad={() => setLoaded((prev) => new Set([...prev, idx]))}
            />
            <div className="gallery-overlay">
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                color: "#fff", fontSize: 12, fontWeight: 500,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                {photo.caption || "Lihat foto"}
              </div>
            </div>
          </div>
        ))}

        {allPhotos.length === 0 && (
          <div style={{
            gridColumn: "1/-1", textAlign: "center", padding: "48px 24px",
            color: "var(--neutral-on-background-weak)",
          }}>
            Belum ada foto di galeri.
          </div>
        )}
      </div>
      )}

      {lightboxIdx !== null && allPhotos[lightboxIdx] && (
        <Lightbox
          photo={allPhotos[lightboxIdx]}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          hasPrev={lightboxIdx > 0}
          hasNext={lightboxIdx < allPhotos.length - 1}
        />
      )}
    </>
  );
}
