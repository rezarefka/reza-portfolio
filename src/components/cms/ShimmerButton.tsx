"use client";

import { useRouter } from "next/navigation";

interface ShimmerButtonProps {
  href: string;
  avatarSrc: string;
  label: string;
  personName: string;
}

export function ShimmerButton({ href, avatarSrc, label, personName }: ShimmerButtonProps) {
  const router = useRouter();

  return (
    <>
      <style>{`
        @keyframes shimmerFlow {
          0%   { transform: translateX(-160%) skewX(-12deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(260%) skewX(-12deg); opacity: 0; }
        }
        @keyframes shimmerPulse {
          0%, 100% { box-shadow: 0 2px 20px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1); }
          50%       { box-shadow: 0 4px 32px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.16); }
        }
        .shimmer-btn {
          position: relative;
          overflow: hidden;
          animation: shimmerPulse 3.5s ease-in-out infinite;
          isolation: isolate;
        }
        .shimmer-btn::before {
          content: "";
          position: absolute;
          top: -20%;
          left: 0;
          width: 36%;
          height: 140%;
          background: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.22) 50%,
            rgba(255,255,255,0.06) 75%,
            transparent 100%
          );
          animation: shimmerFlow 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          border-radius: inherit;
          pointer-events: none;
          z-index: 1;
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.06) 0%,
            transparent 50%,
            rgba(255,255,255,0.03) 100%
          );
          pointer-events: none;
          z-index: 0;
        }
        .shimmer-btn:hover {
          animation: none;
          background: rgba(255,255,255,0.12) !important;
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 6px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18) !important;
        }
        .shimmer-btn:hover::before {
          animation: shimmerFlow 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <button
        onClick={() => router.push(href)}
        className="shimmer-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px 10px 8px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          cursor: "pointer",
          color: "var(--neutral-on-background-strong)",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "inherit",
          transition: "background 0.28s cubic-bezier(0.34,1.56,0.64,1), transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
        }}
      >
        {/* Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt={personName}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            objectFit: "cover",
            border: "1.5px solid rgba(255,255,255,0.2)",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span style={{ position: "relative", zIndex: 2 }}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ opacity: 0.55, position: "relative", zIndex: 2, transition: "transform 0.2s ease" }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </>
  );
}
