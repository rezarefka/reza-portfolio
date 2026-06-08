"use client";

import { Heading, Text, RevealFx, Column, Row } from "@once-ui-system/core";
import { about, person } from "@/resources";
import { useLang } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";
import { useEffect, useState } from "react";
import { ShimmerButton } from "./ShimmerButton";

interface HeroSectionProps {
  settings: SiteSettings | null;
}

/* ── Download CV Button — Elegant Minimal ───────────────────────────────── */
function DownloadCVButton({ cvUrl, label }: { cvUrl: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleDownload = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 1800);
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "CV-Reza-Refka.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <style>{`
        @keyframes cv-shimmer {
          0%   { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(280%)  skewX(-18deg); }
        }
        @keyframes cv-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cv-check-draw {
          from { stroke-dashoffset: 20; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes cv-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-1.5px); }
        }

        .cv-elegant-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          text-decoration: none;
          font-family: inherit;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Outer ring — thin orbit */
        .cv-ring {
          position: absolute;
          inset: -5px;
          border-radius: 999px;
          border: 1px solid transparent;
          background:
            linear-gradient(var(--neutral-background-weak, #0a0a0a), var(--neutral-background-weak, #0a0a0a)) padding-box,
            linear-gradient(135deg,
              rgba(255,255,255,0.08) 0%,
              rgba(255,255,255,0.22) 40%,
              rgba(255,255,255,0.04) 60%,
              rgba(255,255,255,0.18) 100%
            ) border-box;
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .cv-elegant-btn:hover .cv-ring,
        .cv-elegant-btn:focus-visible .cv-ring { opacity: 1; }

        /* Main pill */
        .cv-pill {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 18px 9px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.3s ease;
          animation: cv-float 4s ease-in-out infinite;
        }
        .cv-elegant-btn:hover .cv-pill {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.25),
            0 2px 8px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.12);
          animation: none;
        }
        .cv-elegant-btn:active .cv-pill {
          transform: translateY(0) scale(0.97);
          box-shadow: none;
        }

        /* Shimmer sweep */
        .cv-pill::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.07) 40%,
            rgba(255,255,255,0.14) 50%,
            rgba(255,255,255,0.07) 60%,
            transparent
          );
          animation: cv-shimmer 4.5s ease-in-out infinite 1s;
          pointer-events: none;
        }
        .cv-elegant-btn:hover .cv-pill::before {
          animation: cv-shimmer 1.8s ease-in-out infinite;
        }

        /* Top rim highlight */
        .cv-pill::after {
          content: "";
          position: absolute;
          top: 0; left: 15%; right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 50%, transparent);
          pointer-events: none;
        }

        /* Icon wrapper */
        .cv-icon-wrap {
          position: relative;
          z-index: 2;
          width: 28px; height: 28px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cv-elegant-btn:hover .cv-icon-wrap {
          background: rgba(255,255,255,0.14);
          transform: translateY(1px);
        }

        /* Text group */
        .cv-text-group {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }
        .cv-sublabel {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 2px;
        }
        .cv-mainlabel {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.82);
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }
        .cv-elegant-btn:hover .cv-mainlabel { color: rgba(255,255,255,0.95); }

        /* Badge */
        .cv-badge {
          position: relative;
          z-index: 2;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s, color 0.2s;
        }
        .cv-elegant-btn:hover .cv-badge {
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65);
        }

        /* Success state */
        .cv-check {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          animation: cv-check-draw 0.4s ease forwards;
        }
      `}</style>

      <button
        className="cv-elegant-btn"
        onClick={handleDownload}
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={label}
      >
        <div className="cv-ring" />
        <div className="cv-pill">
          {/* Icon box */}
          <div className="cv-icon-wrap">
            {clicked ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline className="cv-check" points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
          </div>

          {/* Text */}
          <div className="cv-text-group">
            <span className="cv-sublabel">Curriculum Vitae</span>
            <span className="cv-mainlabel">
              {clicked ? "Mengunduh…" : label}
            </span>
          </div>

          {/* PDF badge */}
          <span className="cv-badge">PDF</span>
        </div>
      </button>
    </>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export function HeroSection({ settings: initialSettings }: HeroSectionProps) {
  const { lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [avatarSrc, setAvatarSrc] = useState<string>(person.avatar);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings(data);
          if (data.avatar) setAvatarSrc(data.avatar.split("?")[0]);
        }
      });
  }, []);

  const heroHeadline = settings
    ? lang === "en" ? settings.hero_headline_en : settings.hero_headline_id
    : "Membangun solusi digital yang bermakna";

  const heroDescription = settings
    ? lang === "en" ? settings.hero_description_en : settings.hero_description_id
    : "Saya Reza, seorang developer yang bersemangat membangun solusi digital.";

  const ctaText = settings
    ? lang === "en" ? settings.hero_cta_text_en : settings.hero_cta_text_id
    : lang === "en" ? "About Me" : "Tentang Saya";

  const ctaLink = settings?.hero_cta_link || about.path;
  const cvUrl = settings?.cv_file ?? null;
  const cvLabel = lang === "en" ? "Download CV" : "Unduh CV";

  return (
    <Column fillWidth horizontal="center" gap="m">
      <Column maxWidth="s" horizontal="center" align="center">
        <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16">
          <Heading wrap="balance" variant="display-strong-l">
            {heroHeadline}
          </Heading>
        </RevealFx>
        <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
          <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
            {heroDescription}
          </Text>
        </RevealFx>
        <RevealFx paddingTop="12" delay={0.4} horizontal="center">
          <Row gap="12" horizontal="center" wrap>
            <ShimmerButton
              href={ctaLink}
              avatarSrc={avatarSrc}
              label={ctaText}
              personName={person.name}
            />
            {cvUrl && (
              <DownloadCVButton cvUrl={cvUrl} label={cvLabel} />
            )}
          </Row>
        </RevealFx>
      </Column>
    </Column>
  );
}
