"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

interface ShimmerButtonProps {
  href: string;
  avatarSrc: string;
  label: string;
  personName: string;
}

export function ShimmerButton({ href, avatarSrc, label, personName }: ShimmerButtonProps) {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);

  /* ── Magnetic mouse-follow effect ── */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const STRENGTH = 0.3;
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 120) {
        btn.style.transform = `translate(${dx}px,${dy}px) scale(1.04)`;
      }
    };
    const onLeave = () => { btn.style.transform = ""; };
    document.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    return () => { document.removeEventListener("mousemove", onMove); btn.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .sb-btn, .sb-btn::before, .sb-shimmer, .sb-arrow { transition-duration:0.01ms!important; animation-duration:0.01ms!important; }
        }

        @keyframes sbBreathe {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0), 0 4px 24px rgba(0,0,0,0.18); }
          50%      { box-shadow: 0 0 0 6px rgba(99,102,241,0.08), 0 6px 32px rgba(0,0,0,0.24); }
        }
        @keyframes sbShimmer {
          0%   { transform: translateX(-130%) rotate(-20deg); }
          100% { transform: translateX(230%) rotate(-20deg); }
        }

        .sb-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px 10px 6px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          color: var(--neutral-on-background-strong);
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          overflow: hidden;
          isolation: isolate;
          animation: sbBreathe 4s ease-in-out infinite;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
          letter-spacing: 0.01em;
        }
        /* Top rim highlight */
        .sb-btn::before {
          content: "";
          position: absolute;
          top: 0; left: 12%; right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent);
          pointer-events: none;
          opacity: 0.7;
        }

        /* Shimmer sweep */
        .sb-shimmer {
          position: absolute;
          top: -50%; left: 0;
          width: 30%; height: 200%;
          background: linear-gradient(105deg,
            transparent 0%,
            rgba(255,255,255,0.04) 20%,
            rgba(255,255,255,0.22) 50%,
            rgba(255,255,255,0.04) 80%,
            transparent 100%);
          animation: sbShimmer 5s cubic-bezier(0.45,0,0.55,1) infinite;
          pointer-events: none;
          filter: blur(1px);
          z-index: 1;
        }

        .sb-btn:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.12);
          animation: none;
          box-shadow:
            0 0 0 4px rgba(99,102,241,0.12),
            0 8px 40px rgba(0,0,0,0.36),
            0 0 0 1px rgba(255,255,255,0.2);
        }
        .sb-btn:hover .sb-shimmer { animation-duration: 1.4s; }
        .sb-btn:active { transform: scale(0.97)!important; }
        .sb-btn:focus-visible {
          outline: 2px solid var(--brand-solid-strong);
          outline-offset: 4px;
          animation: none;
        }

        /* Light mode overrides */
        html[data-theme="light"] .sb-btn,
        html:not([data-theme="dark"]) .sb-btn {
          border-color: rgba(0,0,0,0.15)!important;
          background: rgba(0,0,0,0.04)!important;
          color: var(--neutral-on-background-strong);
          animation: none;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        html[data-theme="light"] .sb-btn:hover,
        html:not([data-theme="dark"]) .sb-btn:hover {
          background: rgba(0,0,0,0.08)!important;
          border-color: rgba(99,102,241,0.5)!important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 6px 24px rgba(0,0,0,0.12);
        }
        html[data-theme="light"] .sb-btn::before,
        html:not([data-theme="dark"]) .sb-btn::before { opacity:0; }
        html[data-theme="light"] .sb-shimmer,
        html:not([data-theme="dark"]) .sb-shimmer { display:none; }

        /* Avatar ring */
        .sb-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.25);
          flex-shrink: 0;
          position: relative; z-index: 2;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sb-btn:hover .sb-avatar { transform: scale(1.12) rotate(-4deg); }

        /* Label */
        .sb-label { position: relative; z-index: 2; }

        /* Arrow */
        .sb-arrow {
          position: relative; z-index: 2;
          opacity: 0.65;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
        }
        .sb-btn:hover .sb-arrow { transform: translateX(4px); opacity: 1; }
      `}</style>

      <button
        ref={btnRef}
        onClick={() => router.push(href)}
        className="sb-btn"
        type="button"
        tabIndex={0}
      >
        <div className="sb-shimmer" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt={personName}
          className="sb-avatar"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="sb-label">{label}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
          className="sb-arrow">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </>
  );
}
