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
        @keyframes tiltCardIn {
          from {
            opacity: 0;
            transform: perspective(900px) rotateY(-24deg) rotateX(10deg) rotateZ(-4deg) translateY(24px);
          }
          to {
            opacity: 1;
            transform: ${tiltTransform};
          }
        }

        .tilt-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 24px 20px 8px;
          box-sizing: border-box;
        }

        .tilt-card {
          position: relative;
          width: 148px;
          height: 208px;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transform: ${tiltTransform};
          box-shadow: ${tiltShadow};
          transition:
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          animation: tiltCardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, box-shadow;
          background: #0d0e14;
        }

        .tilt-card.flat {
          transform: ${flatTransform};
          box-shadow: ${flatShadow};
        }

        .tilt-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          border-radius: 18px;
          transition: opacity 0.4s ease;
        }

        .tilt-card img.hidden {
          opacity: 0;
        }

        .tilt-card-skeleton {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #131520 0%,
            #1a1d2e 40%,
            #131520 100%
          );
          background-size: 200% 200%;
          animation: skeletonPulse 2s ease-in-out infinite;
        }

        @keyframes skeletonPulse {
          0%, 100% { background-position: 0% 50%; opacity: 0.8; }
          50%       { background-position: 100% 50%; opacity: 1; }
        }

        /* Border cahaya */
        .tilt-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1.5px solid rgba(255,255,255,0.13);
          pointer-events: none;
          z-index: 2;
          transition: border-color 0.4s ease;
        }
        .tilt-card.flat::before {
          border-color: rgba(255,255,255,0.07);
        }

        /* Highlight tepi kiri-atas saat tilt */
        .tilt-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.12) 0%,
            rgba(255,255,255,0.04) 35%,
            rgba(0,0,0,0) 65%,
            rgba(0,0,0,0.18) 100%
          );
          pointer-events: none;
          z-index: 3;
          transition: opacity 0.55s ease;
          opacity: 1;
        }
        .tilt-card.flat::after {
          opacity: 0;
        }

        /* foto placeholder text */
        .tilt-card-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.12);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          pointer-events: none;
          z-index: 1;
          font-family: inherit;
        }
      `}</style>

      <div className="tilt-wrap">
        <div
          ref={cardRef}
          className={`tilt-card${hovered ? " flat" : ""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onTouchStart={() => setHovered(true)}
          onTouchEnd={() => setHovered(false)}
        >
          {/* Skeleton saat loading */}
          {!imgLoaded && <div className="tilt-card-skeleton" />}
          {!imgLoaded && <div className="tilt-card-label">foto</div>}

          {/* Foto */}
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
    </>
  );
}
