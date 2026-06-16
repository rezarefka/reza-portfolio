"use client";

import { useRef, useState } from "react";

interface Tilt3DCardProps {
  src: string;
  alt: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  loaded?: boolean;
  name?: string;
  role?: string;
}

export function Tilt3DCard({ src, alt, onLoad, onError }: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      <style>{`
        @keyframes lgCardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes lgBlobDriftA {
          0%   { transform: translate(-6%, -4%) scale(1);    border-radius: 42% 58% 63% 37% / 55% 42% 58% 45%; }
          50%  { transform: translate(8%, 6%) scale(1.18);   border-radius: 58% 42% 40% 60% / 45% 58% 42% 55%; }
          100% { transform: translate(-6%, -4%) scale(1);    border-radius: 42% 58% 63% 37% / 55% 42% 58% 45%; }
        }
        @keyframes lgBlobDriftB {
          0%   { transform: translate(5%, 8%) scale(1.05);   border-radius: 55% 45% 38% 62% / 40% 55% 45% 60%; }
          50%  { transform: translate(-10%, -6%) scale(0.9); border-radius: 38% 62% 58% 42% / 60% 40% 60% 40%; }
          100% { transform: translate(5%, 8%) scale(1.05);   border-radius: 55% 45% 38% 62% / 40% 55% 45% 60%; }
        }
        @keyframes lgBlobDriftC {
          0%   { transform: translate(0%, -8%) scale(0.95); }
          50%  { transform: translate(4%, 9%) scale(1.12); }
          100% { transform: translate(0%, -8%) scale(0.95); }
        }
        @keyframes lgSheenSweep {
          0%   { transform: translateX(-130%) rotate(18deg); }
          55%  { transform: translateX(140%) rotate(18deg); }
          100% { transform: translateX(140%) rotate(18deg); }
        }
        @keyframes lgRimGlow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }

        .lg-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 18px 16px 10px;
          box-sizing: border-box;
        }

        /* ── Glass shell — the liquid glass frame, square & rounded, no tilt ── */
        .lg-card {
          position: relative;
          width: 206px;
          height: 206px;
          padding: 11px;
          box-sizing: border-box;
          display: flex;
          border-radius: 40px;
          cursor: pointer;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.07) 100%);
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow:
            0 14px 36px rgba(0,0,0,0.38),
            0 3px 10px rgba(0,0,0,0.24),
            inset 0 1px 1px rgba(255,255,255,0.4),
            inset 0 -10px 18px rgba(0,0,0,0.26);
          transform: translateY(0) scale(1);
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.45s ease;
          animation: lgCardIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, box-shadow;
          overflow: hidden;
        }
        .lg-card.hovered {
          transform: translateY(-7px) scale(1.045);
          border-color: rgba(255,255,255,0.4);
          box-shadow:
            0 28px 56px rgba(0,0,0,0.5),
            0 8px 20px rgba(0,0,0,0.3),
            inset 0 1px 1px rgba(255,255,255,0.55),
            inset 0 -10px 20px rgba(0,0,0,0.3);
        }

        /* Liquid blobs — frosted, drifting colour, only ever visible in the glass rim
           because the opaque photo layer sits above them with a higher z-index. */
        .lg-blobs {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          border-radius: inherit;
        }
        .lg-blob {
          position: absolute;
          filter: blur(18px);
          opacity: 0.85;
          will-change: transform;
          transition: opacity 0.45s ease;
        }
        .lg-card.hovered .lg-blob {
          opacity: 1;
        }
        .lg-blob-a {
          width: 68%; height: 58%;
          top: -12%; left: -10%;
          background: radial-gradient(circle, rgba(99,102,241,0.65), rgba(99,102,241,0) 72%);
          animation: lgBlobDriftA 9s ease-in-out infinite;
        }
        .lg-blob-b {
          width: 58%; height: 52%;
          bottom: -14%; right: -10%;
          background: radial-gradient(circle, rgba(56,189,248,0.55), rgba(56,189,248,0) 72%);
          animation: lgBlobDriftB 11s ease-in-out infinite;
        }
        .lg-blob-c {
          width: 48%; height: 42%;
          bottom: 8%; left: -12%;
          background: radial-gradient(circle, rgba(167,139,250,0.5), rgba(167,139,250,0) 72%);
          animation: lgBlobDriftC 13s ease-in-out infinite;
        }

        /* Diagonal specular sheen — sweeps slowly across the rim, like light
           catching the edge of real glass. Sits behind the photo layer. */
        .lg-sheen {
          position: absolute;
          top: -40%;
          left: 0;
          width: 36%;
          height: 180%;
          z-index: 1;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,0.06) 35%,
            rgba(255,255,255,0.32) 50%,
            rgba(255,255,255,0.06) 65%,
            transparent 100%
          );
          animation: lgSheenSweep 5.5s ease-in-out infinite;
          pointer-events: none;
        }
        .lg-card.hovered .lg-sheen {
          animation-duration: 2.2s;
        }

        /* Thin glowing seam right at the rim, pulses gently */
        .lg-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.5);
          mask: linear-gradient(135deg, #000 0%, transparent 45%, transparent 60%, #000 100%);
          -webkit-mask: linear-gradient(135deg, #000 0%, transparent 45%, transparent 60%, #000 100%);
          animation: lgRimGlow 4s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── Photo inset — its own opaque layer, never filtered/blurred ── */
        .lg-photo-inset {
          position: relative;
          z-index: 2;
          flex: 1;
          border-radius: 32px;
          overflow: hidden;
          background: #0d0e14;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.18) inset,
            0 3px 18px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.10);
          transition: border-color 0.45s ease;
        }
        .lg-card.hovered .lg-photo-inset {
          border-color: rgba(255,255,255,0.22);
        }

        .lg-photo-inset img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lg-photo-inset img.hidden {
          opacity: 0;
        }
        .lg-card.hovered .lg-photo-inset img {
          transform: scale(1.05);
        }

        .lg-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #131520 0%, #1a1d2e 40%, #131520 100%);
          background-size: 200% 200%;
          animation: skeletonPulse 2s ease-in-out infinite;
        }
        @keyframes skeletonPulse {
          0%, 100% { background-position: 0% 50%; opacity: 0.8; }
          50%       { background-position: 100% 50%; opacity: 1; }
        }
        .lg-skeleton-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.12);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          font-family: inherit;
        }

        @media (prefers-reduced-motion: reduce) {
          .lg-blob-a, .lg-blob-b, .lg-blob-c, .lg-sheen, .lg-card::before {
            animation: none !important;
          }
          .lg-card, .lg-photo-inset img {
            transition: none !important;
          }
        }
      `}</style>

      <div className="lg-wrap">
        <div
          ref={cardRef}
          className={`lg-card${hovered ? " hovered" : ""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onTouchStart={() => setHovered(true)}
          onTouchEnd={() => setHovered(false)}
        >
          {/* Liquid glass rim */}
          <div className="lg-blobs">
            <span className="lg-blob lg-blob-a" />
            <span className="lg-blob lg-blob-b" />
            <span className="lg-blob lg-blob-c" />
          </div>
          <div className="lg-sheen" />

          {/* Photo — opaque, isolated, always crisp */}
          <div className="lg-photo-inset">
            {!imgLoaded && <div className="lg-skeleton" />}
            {!imgLoaded && <div className="lg-skeleton-label">foto</div>}
            <img
              src={src}
              alt={alt}
              className={imgLoaded ? "" : "hidden"}
              onLoad={() => { setImgLoaded(true); onLoad?.(); }}
              onError={(e) => {
                setImgLoaded(true);
                onError?.(e);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
