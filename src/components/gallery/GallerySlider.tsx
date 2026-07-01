"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLang } from "@/lib/lang-context";

export interface SliderPhoto {
  url: string;
  alt: string;
  caption: string | null;
}

interface GallerySliderProps {
  photos: SliderPhoto[];
  onOpenLightbox: (index: number) => void;
}

interface CaptionMeta {
  title: string | null;
  subtitle: string | null;
  tagline: string | null;
}

// Admin bisa isi caption sebagai "Judul | Lokasi | Tagline" — dipisah pakai "|".
// Kalau cuma satu bagian, cuma judul yang tampil.
function parseCaption(caption: string | null): CaptionMeta | null {
  if (!caption) return null;
  const parts = caption.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return {
    title: parts[0] ?? null,
    subtitle: parts[1] ?? null,
    tagline: parts[2] ?? null,
  };
}

// Jarak melingkar terpendek dari `idx` ke `active` dalam rentang total foto,
// dinormalisasi supaya wrap-around (foto pertama <-> terakhir) selalu mulus.
function shortestOffset(idx: number, active: number, total: number): number {
  if (total <= 0) return 0;
  let diff = ((idx - active) % total + total) % total; // normalisasi ke [0, total)
  if (diff > total / 2) diff -= total;
  else if (diff === total / 2) diff = -diff; // tie-break foto "paling jauh" pada total genap
  return diff;
}

function offsetToTransform(offset: number) {
  const dir = Math.sign(offset);
  const abs = Math.abs(offset);
  if (abs === 0) {
    return { xPercent: -50, yPercent: -50, scale: 1, rotateY: 0, z: 0, opacity: 1, zIndex: 30 };
  }
  if (abs === 1) {
    return { xPercent: -50 + dir * 74, yPercent: -50, scale: 0.82, rotateY: dir * -32, z: -120, opacity: 0.55, zIndex: 20 };
  }
  return { xPercent: -50 + dir * 138, yPercent: -50, scale: 0.64, rotateY: dir * -32, z: -260, opacity: 0, zIndex: 10 };
}

const RENDER_RANGE = 2;
const SWIPE_THRESHOLD = 42;

export default function GallerySlider({ photos, onOpenLightbox }: GallerySliderProps) {
  const { t } = useLang();
  const total = photos.length;
  const [active, setActive] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isFirstRun = useRef(true);
  const dragRef = useRef<{ startX: number; dragging: boolean } | null>(null);
  const thumbTrackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const goTo = useCallback(
    (newIndex: number) => {
      if (total <= 1) return;
      setActive(((newIndex % total) + total) % total);
    },
    [total],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const visibleIndices = photos
    .map((_, idx) => idx)
    .filter((idx) => Math.abs(shortestOffset(idx, active, total)) <= RENDER_RANGE);

  // ── Animasi kartu (GSAP) tiap kali `active` berubah ────────────────────────
  useLayoutEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduceMotion ? 0.01 : 0.65;

    const currentSet = new Set(visibleIndices);
    const prevSet = (cardRefs.current as unknown as { __prev?: Set<number> }).__prev ?? new Set<number>();

    visibleIndices.forEach((idx) => {
      const el = cardRefs.current.get(idx);
      if (!el) return;
      const offset = shortestOffset(idx, active, total);
      const target = offsetToTransform(offset);

      if (isFirstRun.current) {
        gsap.set(el, target);
        return;
      }

      if (!prevSet.has(idx)) {
        // Kartu baru masuk jangkauan render — taruh dulu satu langkah lebih jauh
        // supaya animasinya masuk dari arah yang benar, baru tween ke posisi target.
        const entryOffset = offset + (Math.sign(offset) || 1);
        gsap.set(el, offsetToTransform(entryOffset));
      }
      gsap.to(el, { ...target, duration: dur, ease: "power3.out", overwrite: "auto" });
    });

    (cardRefs.current as unknown as { __prev?: Set<number> }).__prev = currentSet;
    isFirstRun.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, total]);

  // Bersih-bersih tween pas komponen unmount
  useLayoutEffect(() => {
    return () => {
      gsap.killTweensOf(Array.from(cardRefs.current.values()));
    };
  }, []);

  // ── Auto-scroll thumbnail strip biar thumbnail aktif selalu keliatan ───────
  useLayoutEffect(() => {
    const track = thumbTrackRef.current;
    const activeThumb = thumbRefs.current.get(active);
    if (!track || !activeThumb) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Posisikan thumbnail aktif persis di tengah track, lalu scroll ke situ.
    const targetLeft =
      activeThumb.offsetLeft - track.clientWidth / 2 + activeThumb.clientWidth / 2;

    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [active]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (total <= 1) return;
    dragRef.current = { startX: e.clientX, dragging: true };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current?.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) next();
    else prev();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenLightbox(active);
    }
  };

  if (total === 0) return null;

  return (
    <div className="gsap-slider-root">
      <style>{`
        .gsap-slider-root {
          position: relative;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 8px 0 4px;
          overflow: hidden;
          box-sizing: border-box;
        }
        .gsap-slider-stage {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          /* Tinggi stage selalu mengikuti tinggi kartu (width yang sama x rasio 4/3)
             + sedikit ruang napas, supaya kartu tidak pernah lebih tinggi dari stage.
             Sebelumnya stage pakai skala vw sendiri (66vw) yang beda skalanya dari
             kartu (74vw x 4/3), jadi di lebar layar tertentu (±414px-890px) kartu
             jadi lebih tinggi dari stage dan bagian atas gambar kepotong. */
          height: clamp(360px, calc(min(74vw, 440px) * 4 / 3 + 40px), 660px);
          touch-action: pan-y;
          cursor: grab;
          perspective: 1400px;
        }
        .gsap-slider-stage:active { cursor: grabbing; }
        .gsap-slider-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(120% 90% at 50% 15%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 55%),
            linear-gradient(180deg, var(--page-background, #0a0a0f) 0%, var(--surface-background, #101014) 100%);
        }
        .gsap-slider-card {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(74vw, 440px);
          aspect-ratio: 3 / 4;
          border-radius: 0;
          overflow: hidden;
          cursor: pointer;
          background: #0a0a0f;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          will-change: transform, opacity;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .gsap-slider-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
        }
        .gsap-slider-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.32) 22%,
            rgba(0,0,0,0.1) 42%,
            transparent 62%
          );
        }
        .gsap-slider-caption {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 18px;
          color: #fff;
          pointer-events: none;
          transform-style: preserve-3d;
          transform: translateZ(36px);
        }
        .gsap-slider-title {
          margin: 0;
          font-family: var(--font-heading);
          font-size: clamp(0.86rem, 2.3vw, 1.05rem);
          font-weight: 600;
          letter-spacing: 0.005em;
          text-transform: none;
          line-height: 1.42;
          color: rgba(255,255,255,0.97);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 2px 4px rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.4);
        }
        .gsap-slider-subtitle-row {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 7px;
        }
        .gsap-slider-subtitle-line {
          width: 14px;
          height: 1px;
          background: rgba(255,255,255,0.5);
          display: inline-block;
        }
        .gsap-slider-subtitle {
          font-family: var(--font-label);
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
        }
        .gsap-slider-tagline {
          margin: 6px 0 0;
          font-size: 0.68rem;
          font-weight: 400;
          font-style: italic;
          line-height: 1.5;
          color: rgba(255,255,255,0.5);
        }
        .gsap-slider-counter {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 4px 10px;
          border-radius: 99px;
          background: var(--brand-alpha-medium, rgba(255,255,255,0.16));
          color: var(--brand-on-background-strong, #fff);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          pointer-events: none;
        }
        .gsap-slider-zoomhint {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .gsap-slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s, transform 0.18s;
          z-index: 25;
        }
        .gsap-slider-arrow:hover { background: rgba(255,255,255,0.22); transform: translateY(-50%) scale(1.06); }
        .gsap-slider-arrow--left { left: 4px; }
        .gsap-slider-arrow--right { right: 4px; }
        .gsap-slider-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
          position: relative;
          z-index: 1;
        }
        .gsap-slider-dot {
          width: 7px;
          height: 7px;
          border-radius: 99px;
          border: none;
          padding: 0;
          cursor: pointer;
          background: var(--neutral-alpha-medium, rgba(255,255,255,0.25));
          transition: width 0.25s ease, background 0.25s ease;
        }
        .gsap-slider-dot.is-active {
          width: 22px;
          background: var(--brand-solid-strong, #fff);
        }
        @media (max-width: 480px) {
          .gsap-slider-arrow { width: 38px; height: 38px; }
          .gsap-slider-caption { left: 16px; right: 16px; bottom: 14px; }
          .gsap-slider-title { font-size: 0.8rem; line-height: 1.4; -webkit-line-clamp: 3; }
          .gsap-slider-subtitle { font-size: 0.56rem; letter-spacing: 0.12em; }
          .gsap-slider-subtitle-row { margin-bottom: 5px; }
          .gsap-slider-tagline { font-size: 0.64rem; margin-top: 5px; }
          .gsap-slider-counter { top: 10px; left: 10px; font-size: 10px; padding: 3px 8px; }
          .gsap-slider-zoomhint { top: 10px; right: 10px; width: 26px; height: 26px; }
        }
        @media (max-width: 360px) {
          .gsap-slider-title { font-size: 0.75rem; -webkit-line-clamp: 2; }
        }

        /* ── Thumbnail strip ──────────────────────────────────────────────── */
        .gsap-slider-thumbs {
          display: flex;
          gap: 10px;
          margin-top: 22px;
          padding: 6px 4px 10px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .gsap-slider-thumbs::-webkit-scrollbar { display: none; }
        .gsap-slider-thumb {
          position: relative;
          flex: 0 0 auto;
          width: 64px;
          aspect-ratio: 3 / 4;
          border-radius: 0;
          overflow: hidden;
          padding: 0;
          cursor: pointer;
          border: 1.5px solid transparent;
          background: var(--neutral-alpha-weak, rgba(255,255,255,0.06));
          opacity: 0.55;
          transform: scale(0.94);
          transition: opacity 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .gsap-slider-thumb.is-active {
          opacity: 1;
          transform: scale(1);
          border-color: var(--brand-solid-strong, #fff);
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        }
        .gsap-slider-thumb:hover { opacity: 0.85; }
        .gsap-slider-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
          pointer-events: none;
        }
        @media (max-width: 480px) {
          .gsap-slider-thumbs { gap: 8px; margin-top: 18px; }
          .gsap-slider-thumb { width: 52px; border-radius: 0; }
        }
      `}</style>

      <div
        ref={stageRef}
        className="gsap-slider-stage"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("Galeri foto", "Photo gallery")}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        <div className="gsap-slider-bg" aria-hidden="true" />

        {visibleIndices.map((idx) => {
          const photo = photos[idx];
          const offset = shortestOffset(idx, active, total);
          const isActive = offset === 0;
          const meta = isActive ? parseCaption(photo.caption) : null;

          return (
            <div
              key={idx}
              ref={(el) => {
                if (el) cardRefs.current.set(idx, el);
                else cardRefs.current.delete(idx);
              }}
              className="gsap-slider-card"
              onClick={() => (isActive ? onOpenLightbox(idx) : goTo(idx))}
              role="button"
              aria-label={isActive ? (photo.caption || t("Perbesar foto", "Enlarge photo")) : t("Ke foto ini", "Go to this photo")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt} className="gsap-slider-img" draggable={false} />
              {isActive && (
                <>
                  <div className="gsap-slider-scrim" />
                  {meta && (meta.title || meta.subtitle || meta.tagline) && (
                    <div className="gsap-slider-caption">
                      {meta.title && <h3 className="gsap-slider-title">{meta.title}</h3>}
                      {meta.subtitle && (
                        <div className="gsap-slider-subtitle-row">
                          <span className="gsap-slider-subtitle-line" />
                          <span className="gsap-slider-subtitle">{meta.subtitle}</span>
                        </div>
                      )}
                      {meta.tagline && <p className="gsap-slider-tagline">{meta.tagline}</p>}
                    </div>
                  )}
                  {total > 1 && (
                    <div className="gsap-slider-counter">{active + 1} / {total}</div>
                  )}
                  <div className="gsap-slider-zoomhint">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {total > 1 && (
          <>
            <button
              className="gsap-slider-arrow gsap-slider-arrow--left"
              onClick={prev}
              aria-label={t("Sebelumnya", "Previous")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              className="gsap-slider-arrow gsap-slider-arrow--right"
              onClick={next}
              aria-label={t("Berikutnya", "Next")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="gsap-slider-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`gsap-slider-dot ${i === active ? "is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`${t("Foto", "Photo")} ${i + 1}`}
            />
          ))}
        </div>
      )}

      {total > 1 && (
        <div ref={thumbTrackRef} className="gsap-slider-thumbs">
          {photos.map((photo, i) => (
            <button
              key={i}
              ref={(el) => {
                if (el) thumbRefs.current.set(i, el);
                else thumbRefs.current.delete(i);
              }}
              className={`gsap-slider-thumb ${i === active ? "is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`${t("Ke foto", "Go to photo")} ${i + 1}`}
              aria-current={i === active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="gsap-slider-thumb-img" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skeleton dipakai GalleryView saat data masih dimuat ──────────────────────
export function GallerySliderSkeleton() {
  return (
    <div style={{ width: "100%", padding: "8px 0 4px" }}>
      <style>{`
        @keyframes gsapSliderPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 0.9; } }
      `}</style>
      <div
        style={{
          width: "min(74vw, 440px)",
          aspectRatio: "3 / 4",
          margin: "0 auto",
          borderRadius: 0,
          background: "var(--neutral-alpha-weak)",
          animation: "gsapSliderPulse 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: i === 0 ? 22 : 7,
              height: 7,
              borderRadius: 99,
              background: "var(--neutral-alpha-medium)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
