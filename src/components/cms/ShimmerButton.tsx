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
        /* ── P8: Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lustre-btn, .lustre-btn::before, .lustre-btn::after, .lustre-arrow {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ── Kilau utama — sapuan lembut dari kiri ke kanan ── */
        @keyframes lustreFlow {
          0%   { transform: translateX(-120%) rotate(-18deg); opacity: 0;   }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(220%)  rotate(-18deg); opacity: 0;   }
        }

        /* ── Cahaya tepi atas — subtle border glow ── */
        @keyframes rimGlow {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.80; }
        }

        /* ── Napas / breathing ── */
        @keyframes breathe {
          0%, 100% { box-shadow: 0 2px 18px rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.10); }
          50%       { box-shadow: 0 4px 28px rgba(255,255,255,0.10), 0 0 0 1px rgba(255,255,255,0.18); }
        }

        .lustre-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          animation: breathe 4s ease-in-out infinite;
          transition:
            background  0.3s ease,
            transform   0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow  0.3s ease;
          /* P7: cursor pointer explicit — semua state */
          cursor: pointer !important;
        }

        /* P7: Focus visible — outline jelas untuk keyboard nav */
        .lustre-btn:focus-visible {
          outline: 2px solid var(--brand-solid-strong);
          outline-offset: 4px;
          border-radius: 999px;
          animation: none;
        }

        /* Kilau utama */
        .lustre-btn::before {
          content: "";
          position: absolute;
          top: -40%;
          left: 0;
          width: 28%;
          height: 180%;
          background: linear-gradient(
            105deg,
            transparent      0%,
            rgba(255,255,255,0.03) 20%,
            rgba(255,255,255,0.18) 50%,
            rgba(255,255,255,0.03) 80%,
            transparent      100%
          );
          animation: lustreFlow 4.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          pointer-events: none;
          z-index: 1;
          filter: blur(1px);
        }

        /* Rim light — garis tipis di atas */
        .lustre-btn::after {
          content: "";
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.55) 50%,
            transparent
          );
          animation: rimGlow 4.8s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* P7: Hover — shadow lebih tegas, transform lebih jelas */
        .lustre-btn:hover {
          background: rgba(255,255,255,0.11) !important;
          transform: translateY(-2px) scale(1.03);
          /* P7: shadow lebih dramatis dari breathe default */
          box-shadow: 0 8px 32px rgba(0,0,0,0.36), 0 0 0 1.5px rgba(255,255,255,0.26);
          animation: none;
        }
        .lustre-btn:hover::before {
          animation: lustreFlow 1.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .lustre-btn:hover::after {
          opacity: 1;
          animation: none;
        }

        /* Aktif / klik */
        .lustre-btn:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 12px rgba(0,0,0,0.22);
        }

        /* P7: Light mode — border gelap agar visible di background terang */
        html[data-theme="light"] .lustre-btn {
          border-color: rgba(0, 0, 0, 0.12) !important;
          background: rgba(0, 0, 0, 0.05) !important;
        }
        html[data-theme="light"] .lustre-btn:hover {
          background: rgba(0, 0, 0, 0.09) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(0,0,0,0.16);
        }
        @media (prefers-color-scheme: light) {
          html:not([data-theme="dark"]) .lustre-btn {
            border-color: rgba(0, 0, 0, 0.12) !important;
            background: rgba(0, 0, 0, 0.05) !important;
          }
          html:not([data-theme="dark"]) .lustre-btn:hover {
            background: rgba(0, 0, 0, 0.09) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(0,0,0,0.16);
          }
        }

        /* Arrow icon ikut gerak saat hover */
        .lustre-btn:hover .lustre-arrow {
          transform: translateX(3px);
        }
        .lustre-arrow {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <button
        onClick={() => router.push(href)}
        className="lustre-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px 10px 8px",
          borderRadius: 999,
          /* P7: border default dark-mode; overridden to dark in light mode via CSS */
          border: "1px solid rgba(255,255,255,0.13)",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          cursor: "pointer", /* P7: explicit cursor */
          color: "var(--neutral-on-background-strong)",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "inherit",
        }}
        type="button"
        tabIndex={0}
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
            zIndex: 3,
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span style={{ position: "relative", zIndex: 3 }}>{label}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          className="lustre-arrow"
          style={{ opacity: 0.6, position: "relative", zIndex: 3 }}
        >
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </>
  );
}
