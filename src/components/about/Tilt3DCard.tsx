"use client";

import { useRef, useState, useCallback } from "react";

interface Tilt3DCardProps {
  src: string;
  alt: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  loaded?: boolean;
}

/**
 * Tilt3DCard
 * Kartu foto profil dengan efek 3D tilt mengikuti gerakan mouse / sentuhan,
 * lengkap dengan glare (kilau cahaya) dan glow ambient di belakang kartu.
 * Murni CSS + JS (tanpa dependency tambahan) — perspective transform 3D,
 * terinspirasi dari "ID / passport card" yang bisa ditarik-tarik secara halus.
 */
export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isHover, setIsHover] = useState(false);

  const applyTransform = useCallback((px: number, py: number) => {
    const card = cardRef.current;
    const frame = frameRef.current;
    if (!card || !frame) return;

    const rect = card.getBoundingClientRect();
    const x = (px - rect.left) / rect.width;
    const y = (py - rect.top) / rect.height;

    const maxTilt = 14;
    const rotateY = (x - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - y) * maxTilt * 2;

    const translateX = (x - 0.5) * 10;
    const translateY = (y - 0.5) * 10;

    frame.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px) scale3d(1.03,1.03,1.03)`;

    const glare = frame.querySelector(".t3d-glare") as HTMLElement | null;
    if (glare) {
      const gx = x * 100;
      const gy = y * 100;
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)`;
      glare.style.opacity = "1";
    }

    const shadow = card.querySelector(".t3d-shadow") as HTMLElement | null;
    if (shadow) {
      shadow.style.transform = `translate(${-translateX * 1.4}px, ${-translateY * 1.4 + 14}px) scale(0.92)`;
      shadow.style.opacity = "0.55";
    }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    rafRef.current = requestAnimationFrame(() => applyTransform(clientX, clientY));
  }, [applyTransform]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches[0]) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    rafRef.current = requestAnimationFrame(() => applyTransform(clientX, clientY));
  }, [applyTransform]);

  const reset = useCallback(() => {
    setIsHover(false);
    const frame = frameRef.current;
    const card = cardRef.current;
    if (frame) {
      frame.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale3d(1,1,1)`;
      const glare = frame.querySelector(".t3d-glare") as HTMLElement | null;
      if (glare) glare.style.opacity = "0";
    }
    if (card) {
      const shadow = card.querySelector(".t3d-shadow") as HTMLElement | null;
      if (shadow) {
        shadow.style.transform = `translate(0px, 14px) scale(0.92)`;
        shadow.style.opacity = "0.35";
      }
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes t3dFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes t3dGlowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.6;  transform: scale(1.08); }
        }

        .t3d-wrap {
          position: relative;
          width: 100%;
          max-width: 220px;
          aspect-ratio: 3 / 4;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .t3d-card {
          position: relative;
          width: 100%;
          height: 100%;
          cursor: grab;
          touch-action: none;
          animation: t3dFloat 5.5s ease-in-out infinite;
        }
        .t3d-card:active {
          cursor: grabbing;
        }

        /* Ambient glow di belakang card */
        .t3d-glow {
          position: absolute;
          inset: -30px;
          border-radius: 28px;
          background: radial-gradient(
            circle at 50% 40%,
            var(--brand-background-strong) 0%,
            var(--accent-background-strong) 45%,
            transparent 75%
          );
          filter: blur(28px);
          opacity: 0.35;
          z-index: 0;
          pointer-events: none;
          animation: t3dGlowPulse 4.5s ease-in-out infinite;
        }

        /* Soft shadow proyeksi di bawah card */
        .t3d-shadow {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: -6%;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.45), transparent 75%);
          opacity: 0.35;
          filter: blur(6px);
          transform: translate(0px, 14px) scale(0.92);
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease;
          z-index: 0;
          pointer-events: none;
        }

        /* Frame kartu yang ditransform 3D */
        .t3d-frame {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(160deg, var(--neutral-alpha-weak), var(--neutral-alpha-medium));
          border: 1px solid var(--neutral-alpha-medium);
          box-shadow:
            0 18px 45px -12px rgba(0,0,0,0.55),
            0 4px 18px -6px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.06);
          transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale3d(1,1,1);
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
          transform-style: preserve-3d;
          will-change: transform;
        }

        .t3d-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .t3d-card:hover .t3d-frame img {
          transform: scale(1.04);
        }

        /* Overlay gradasi bawah untuk kedalaman + label */
        .t3d-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.15) 35%,
            transparent 60%
          );
          pointer-events: none;
        }

        /* Strip identitas ala "passport" */
        .t3d-id {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          pointer-events: none;
        }
        .t3d-id-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        .t3d-id-name {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.95);
          font-family: inherit;
        }

        /* Lubang gantungan kartu (passport hole) */
        .t3d-hole {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 8px;
          border-radius: 6px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.12);
          z-index: 3;
          pointer-events: none;
        }

        /* Efek kilau / glare mengikuti kursor */
        .t3d-glare {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.35s ease;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 2;
        }

        /* Garis tepi halus mengilap */
        .t3d-edge {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          pointer-events: none;
          z-index: 2;
        }

        @media (max-width: 680px) {
          .t3d-wrap { max-width: 184px; }
        }
      `}</style>

      <div className="t3d-wrap">
        <div className="t3d-glow" aria-hidden="true" />
        <div
          ref={cardRef}
          className="t3d-card"
          onMouseMove={onMouseMove}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={reset}
          onTouchMove={onTouchMove}
          onTouchEnd={reset}
          role="img"
          aria-label={alt}
        >
          <div className="t3d-shadow" aria-hidden="true" />
          <div ref={frameRef} className="t3d-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onLoad={onLoad}
              onError={onError}
              style={{ opacity: loaded ? 1 : 0 }}
            />
            <div className="t3d-overlay" aria-hidden="true" />
            <div className="t3d-glare" aria-hidden="true" />
            <div className="t3d-edge" aria-hidden="true" />
            <div className="t3d-hole" aria-hidden="true" />
            <div className="t3d-id">
              <span className="t3d-id-label">Portfolio Pass</span>
              <span className="t3d-id-name">{alt}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
