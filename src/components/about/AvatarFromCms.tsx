"use client";

import { createClient } from "@/lib/supabase/client";
import { person } from "@/resources";
import { useEffect, useState } from "react";

export function AvatarFromCms() {
  const [src, setSrc] = useState<string>(person.avatar);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings")
      .select("avatar")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.avatar) {
          const clean = data.avatar.split("?")[0];
          setSrc(clean);
        }
      });
  }, []);

  return (
    <>
      <style>{`
        @keyframes avatarRingPulse {
          0%, 100% { opacity: 0.50; transform: scale(1); }
          50%       { opacity: 0.85; transform: scale(1.022); }
        }
        @keyframes avatarFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes locationDotBlink {
          0%, 100% { opacity: 1;    transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(0.75); }
        }

        .av-shell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: avatarFadeIn 0.55s cubic-bezier(0.34,1.2,0.64,1) both;
          width: 100%;
        }

        .av-ring-outer {
          position: relative;
          width: 172px;
          height: 172px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .av-ring-outer::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            var(--brand-background-strong) 0%,
            var(--accent-background-strong) 40%,
            transparent 62%,
            var(--brand-background-strong) 100%
          );
          animation: avatarRingPulse 3.8s ease-in-out infinite;
          z-index: 0;
        }
        .av-ring-outer::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          background: var(--page-background);
          z-index: 1;
        }

        .av-frame {
          position: relative;
          width: 162px;
          height: 162px;
          border-radius: 50%;
          overflow: hidden;
          z-index: 2;
          background: var(--neutral-alpha-weak);
          border: 2px solid var(--neutral-alpha-medium);
          flex-shrink: 0;
        }
        .av-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1);
        }
        .av-frame:hover img {
          transform: scale(1.05);
        }

        /* Location row */
        .av-location {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 18px;
        }
        .av-loc-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand-background-strong);
          flex-shrink: 0;
          animation: locationDotBlink 2.6s ease-in-out infinite;
        }
        .av-loc-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--neutral-on-background-weak);
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        /* Contact button */
        .av-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 14px;
          width: 100%;
          padding: 10px 16px;
          border-radius: 12px;
          background: var(--brand-background-strong);
          color: var(--brand-on-solid-strong);
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: opacity 0.15s, transform 0.13s;
          box-sizing: border-box;
        }
        .av-cta:hover {
          opacity: 0.86;
          transform: translateY(-1px);
        }
        .av-cta:active {
          transform: scale(0.97);
        }

        @media (max-width: 680px) {
          .av-ring-outer { width: 144px; height: 144px; }
          .av-frame       { width: 136px; height: 136px; }
        }
      `}</style>

      <div className="av-shell">
        {/* ── Ring + Photo ── */}
        <div className="av-ring-outer">
          <div className="av-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={person.name}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = person.avatar;
              }}
              style={{ opacity: loaded ? 1 : 0 }}
            />
          </div>
        </div>

        {/* ── Location dengan dot kedap-kedip ── */}
        <div className="av-location">
          <div className="av-loc-dot" />
          <span className="av-loc-text">Makassar, Indonesia</span>
        </div>

        {/* ── Tombol Hubungi ── */}
        <a href="mailto:rezarefka@gmail.com" className="av-cta">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Hubungi Saya
        </a>
      </div>
    </>
  );
}
