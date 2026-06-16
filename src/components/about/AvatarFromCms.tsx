"use client";

import { createClient } from "@/lib/supabase/client";
import { person } from "@/resources";
import { useEffect, useState } from "react";
import { Tilt3DCard } from "./Tilt3DCard";

export function AvatarFromCms() {
  const [src, setSrc]             = useState<string>(person.avatar);
  const [cvUrl, setCvUrl]         = useState<string | null>(null);
  const [cvClicked, setCvClicked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings")
      .select("avatar, cv_file")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.avatar) setSrc(data.avatar.split("?")[0]);
        if (data?.cv_file) setCvUrl(data.cv_file);
      });
  }, []);

  const handleCvDownload = () => {
    if (!cvUrl) return;
    setCvClicked(true);
    setTimeout(() => setCvClicked(false), 2000);
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "Resume-Reza-Refka.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <style>{`
        @keyframes avatarPanelIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes locationDotBlink {
          0%, 100% { opacity: 1;    transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(0.75); }
        }
        @keyframes ctaShimmer {
          0%  { left: -100%; }
          50% { left: 150%; }
          100%{ left: 150%; }
        }
        @keyframes avResumeCheck {
          from { stroke-dashoffset: 22; }
          to   { stroke-dashoffset: 0; }
        }

        /* ── Panel wrapper ──────────────────────────────── */
        .av-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 0;
          animation: avatarPanelIn 0.55s cubic-bezier(0.34, 1.2, 0.64, 1) both;
        }

        /* ── Card area ───────────────────────────────────── */
        .av-card-area {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          /* extra ruang untuk shadow 3D tilt */
          padding: 8px 20px 16px;
          box-sizing: border-box;
        }

        /* ── Info bawah ──────────────────────────────────── */
        .av-info {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0 8px;
          box-sizing: border-box;
        }

        .av-location {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .av-loc-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--brand-background-strong);
          flex-shrink: 0;
          animation: locationDotBlink 2.6s ease-in-out infinite;
        }
        .av-loc-text {
          font-size: 12px;
          font-weight: 500;
          color: var(--neutral-on-background-weak);
          white-space: nowrap;
        }

        .av-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 9px 14px;
          border-radius: 10px;
          background: var(--brand-background-strong);
          color: var(--brand-on-solid-strong);
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          border: none;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
          transition: opacity 0.15s, transform 0.13s;
          box-sizing: border-box;
        }
        .av-cta::after {
          content: "";
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
          animation: ctaShimmer 3.2s ease-in-out infinite;
        }
        .av-cta:hover  { opacity: 0.88; transform: translateY(-1px); }
        .av-cta:active { transform: scale(0.97); }

        .av-resume {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 9px 14px;
          border-radius: 10px;
          background: transparent;
          color: var(--neutral-on-background-strong);
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          border: 1px solid var(--neutral-alpha-medium);
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.15s, border-color 0.15s, transform 0.13s;
          box-sizing: border-box;
        }
        .av-resume:hover  { background: var(--neutral-alpha-weak); border-color: var(--neutral-alpha-strong); }
        .av-resume:active { transform: scale(0.97); }
        .av-resume.av-resume-ok {
          color: rgb(74,222,128);
          border-color: rgba(34,197,94,0.38);
          background: rgba(34,197,94,0.10);
        }
        .av-resume-check {
          stroke-dasharray: 22;
          stroke-dashoffset: 22;
          animation: avResumeCheck 0.35s ease forwards;
        }

        /* ── Mobile: handled by parent SCSS ─────────────── */
        @media (max-width: 768px) {
          .av-panel {
            max-width: 240px;
            margin: 0 auto;
          }
        }
      `}</style>

      <div className="av-panel">
        {/* Kartu tilt 3D */}
        <div className="av-card-area">
          <Tilt3DCard
            src={src}
            alt={person.name}
            onLoad={() => {}}
            onError={(e) => {
              (e.target as HTMLImageElement).src = person.avatar;
            }}
          />
        </div>

        {/* Info & CTA */}
        <div className="av-info">
          {/* Lokasi */}
          <div className="av-location">
            <div className="av-loc-dot" />
            <span className="av-loc-text">Makassar, Indonesia</span>
          </div>

          {/* Hubungi */}
          <a href="mailto:rezarefka@gmail.com" className="av-cta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Hubungi Saya
          </a>

          {/* Resume */}
          {cvUrl && (
            <button
              type="button"
              className={`av-resume${cvClicked ? " av-resume-ok" : ""}`}
              onClick={handleCvDownload}
              aria-label="Unduh Resume"
            >
              {cvClicked ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline className="av-resume-check" points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              {cvClicked ? "Tersimpan!" : "Resume"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
