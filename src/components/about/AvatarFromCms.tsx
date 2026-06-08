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
        @keyframes profileRingPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 0.90; transform: scale(1.025); }
        }
        @keyframes profileFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }

        .profile-shell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: profileFadeIn 0.6s cubic-bezier(0.34,1.2,0.64,1) both;
        }

        /* Outer glow ring */
        .profile-ring-outer {
          position: relative;
          width: 176px;
          height: 176px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-ring-outer::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            var(--brand-background-strong) 0%,
            var(--accent-background-strong) 40%,
            transparent 60%,
            var(--brand-background-strong) 100%
          );
          animation: profileRingPulse 3.5s ease-in-out infinite;
          z-index: 0;
        }
        .profile-ring-outer::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          background: var(--page-background);
          z-index: 1;
        }

        /* Photo frame */
        .profile-img-frame {
          position: relative;
          width: 164px;
          height: 164px;
          border-radius: 50%;
          overflow: hidden;
          z-index: 2;
          background: var(--neutral-alpha-weak);
          border: 2px solid var(--neutral-alpha-medium);
          flex-shrink: 0;
        }
        .profile-img-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1);
        }
        .profile-img-frame:hover img {
          transform: scale(1.04);
        }

        /* Status badge */
        .profile-status {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px 4px 6px;
          border-radius: 20px;
          background: var(--neutral-background-strong);
          border: 1.5px solid var(--neutral-alpha-medium);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.25);
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
          animation: statusBlink 2.4s ease-in-out infinite;
          box-shadow: 0 0 5px rgba(34,197,94,0.6);
        }
        .status-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--neutral-on-background-strong);
          white-space: nowrap;
          font-family: inherit;
        }

        /* Info card below photo */
        .profile-card {
          width: 100%;
          margin-top: 20px;
          border-radius: 16px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          overflow: hidden;
        }
        .profile-card-inner {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .profile-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .profile-info-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--neutral-alpha-weak);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--neutral-on-background-weak);
        }
        .profile-info-content {
          flex: 1;
          min-width: 0;
        }
        .profile-info-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: var(--neutral-on-background-weak);
          line-height: 1;
          margin-bottom: 2px;
          font-family: inherit;
        }
        .profile-info-value {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--neutral-on-background-strong);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: inherit;
          line-height: 1.3;
        }
        .profile-divider {
          height: 1px;
          background: var(--neutral-alpha-weak);
          margin: 0 -16px;
        }

        /* Lang pills */
        .profile-langs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .profile-lang-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background-medium);
          border: 1px solid var(--brand-alpha-medium);
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        /* CTA button */
        .profile-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          background: var(--brand-background-strong);
          color: var(--brand-on-solid-strong);
          font-size: 12.5px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: opacity 0.16s, transform 0.14s;
        }
        .profile-cta:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .profile-cta:active {
          transform: scale(0.97);
        }

        @media (max-width: 680px) {
          .profile-ring-outer { width: 148px; height: 148px; }
          .profile-img-frame  { width: 138px; height: 138px; }
          .profile-card { margin-top: 16px; }
        }
      `}</style>

      <div className="profile-shell">
        {/* ── Photo ring ── */}
        <div className="profile-ring-outer">
          <div className="profile-img-frame">
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

            {/* Status badge */}
            <div className="profile-status">
              <div className="status-dot" />
              <span className="status-text">Open to work</span>
            </div>
          </div>
        </div>

        {/* ── Info card ── */}
        <div className="profile-card">
          <div className="profile-card-inner">

            {/* Location */}
            <div className="profile-info-row">
              <div className="profile-info-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="profile-info-content">
                <div className="profile-info-label">Lokasi</div>
                <div className="profile-info-value">Makassar, Indonesia</div>
              </div>
            </div>

            <div className="profile-divider" />

            {/* Role */}
            <div className="profile-info-row">
              <div className="profile-info-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
              <div className="profile-info-content">
                <div className="profile-info-label">Spesialisasi</div>
                <div className="profile-info-value">Full Stack · Data Eng</div>
              </div>
            </div>

            <div className="profile-divider" />

            {/* Languages */}
            <div className="profile-info-row" style={{ alignItems: "flex-start" }}>
              <div className="profile-info-icon" style={{ marginTop: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div className="profile-info-content">
                <div className="profile-info-label" style={{ marginBottom: 6 }}>Bahasa</div>
                <div className="profile-langs">
                  {(person.languages ?? ["Indonesia", "English"]).map((lang, i) => (
                    <span key={i} className="profile-lang-pill">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-divider" />

            {/* CTA */}
            <a
              href="mailto:rezarefka@gmail.com"
              className="profile-cta"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Hubungi Saya
            </a>

          </div>
        </div>
      </div>
    </>
  );
}
