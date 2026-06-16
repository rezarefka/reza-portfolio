"use client";

import { useRef, useEffect, useState } from "react";

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

  const TILT_X = -8;   // miring ke kanan (rotateY positif = kanan naik)
  const TILT_Y = 6;    // rotateX sedikit ke depan atas
  const TILT_Z = -2;   // rotateZ dikit
  const SHADOW_OFFSET_X = 18;
  const SHADOW_OFFSET_Y = 28;

  const tiltTransform = `
    perspective(900px)
    rotateY(${TILT_X}deg)
    rotateX(${TILT_Y}deg)
    rotateZ(${TILT_Z}deg)
    scale3d(1.02, 1.02, 1.02)
  `;
  const flatTransform = `
    perspective(900px)
    rotateY(0deg)
    rotateX(0deg)
    rotateZ(0deg)
    scale3d(1, 1, 1)
  `;

  const tiltShadow = `
    ${SHADOW_OFFSET_X}px ${SHADOW_OFFSET_Y}px 60px rgba(0,0,0,0.55),
    ${Math.round(SHADOW_OFFSET_X * 0.5)}px ${Math.round(SHADOW_OFFSET_Y * 0.5)}px 24px rgba(0,0,0,0.30),
    4px 8px 8px rgba(0,0,0,0.22)
  `;
  const flatShadow = `
    0px 8px 32px rgba(0,0,0,0.32),
    0px 2px 8px rgba(0,0,0,0.18)
  `;

  return (
    <>
      <style>{`
        @keyframes lgCardIn {
          from {
            opacity: 0;
            transform: perspective(900px) rotateY(-24deg) rotateX(10deg) rotateZ(-4deg) translateY(24px);
          }
          to {
            opacity: 1;
            transform: ${tiltTransform};
          }
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
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 1; }
        }

        .lg-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 22px 18px 8px;
          box-sizing: border-box;
        }

        /* ── Glass shell — this is the liquid glass frame ── */
        .lg-card {
          position: relative;
          width: 168px;
          height: 224px;
          padding: 9px;
          box-sizing: border-box;
          display: flex;
          border-radius: 30px;
          cursor: pointer;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.07) 100%);
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow:
            ${tiltShadow},
            inset 0 1px 1px rgba(255,255,255,0.45),
            inset 0 -10px 18px rgba(0,0,0,0.28);
          transform: ${tiltTransform};
          transition:
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          animation: lgCardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, box-shadow;
          overflow: hidden;
        }
        .lg-card.flat {
          transform: ${flatTransform};
          box-shadow:
            ${flatShadow},
            inset 0 1px 1px rgba(255,255,255,0.35),
            inset 0 -8px 14px rgba(0,0,0,0.22);
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
          filter: blur(16px);
          opacity: 0.85;
          will-change: transform;
        }
        .lg-blob-a {
          width: 70%; height: 60%;
          top: -14%; left: -10%;
          background: radial-gradient(circle, rgba(99,102,241,0.65), rgba(99,102,241,0) 72%);
          animation: lgBlobDriftA 9s ease-in-out infinite;
        }
        .lg-blob-b {
          width: 60%; height: 55%;
          bottom: -16%; right: -12%;
          background: radial-gradient(circle, rgba(56,189,248,0.55), rgba(56,189,248,0) 72%);
          animation: lgBlobDriftB 11s ease-in-out infinite;
        }
        .lg-blob-c {
          width: 50%; height: 46%;
          bottom: 6%; left: -14%;
          background: radial-gradient(circle, rgba(167,139,250,0.5), rgba(167,139,250,0) 72%);
          animation: lgBlobDriftC 13s ease-in-out infinite;
        }

        /* Diagonal specular sheen — sweeps slowly across the rim, like light
           catching the edge of real glass. Sits behind the photo layer. */
        .lg-sheen {
          position: absolute;
          top: -40%;
          left: 0;
          width: 38%;
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

        /* Thin glowing seam right at the rim, pulses gently */
        .lg-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: 30px;
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
          border-radius: 22px;
          overflow: hidden;
          background: #0d0e14;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.18) inset,
            0 3px 18px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .lg-photo-inset img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: opacity 0.4s ease;
        }
        .lg-photo-inset img.hidden {
          opacity: 0;
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
        }
      `}</style>

      <div className="lg-wrap">
        <div
          ref={cardRef}
          className={`lg-card${hovered ? " flat" : ""}`}
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
