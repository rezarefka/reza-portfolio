"use client";

import { Heading, Text, RevealFx, Column, Row } from "@once-ui-system/core";
import { about, person } from "@/resources";
import { useLang } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";
import { useEffect, useState } from "react";
import { ShimmerButton } from "./ShimmerButton";
import { HeroSkeleton } from "@/components/Skeletons";

interface HeroSectionProps {
  settings: SiteSettings | null;
}

/* ── Download CV Button — Liquid Glass CTA ─────────────────────────────── */
function DownloadCVButton({ cvUrl, label }: { cvUrl: string; label: string }) {
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleDownload = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 2200);
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
        /* ── Keyframes ── */
        @keyframes cv-scan {
          0%   { transform: translateX(-130%) rotate(-20deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(220%)  rotate(-20deg); opacity: 0; }
        }
        @keyframes cv-ring-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.06); }
        }
        @keyframes cv-dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        @keyframes cv-check-draw {
          from { stroke-dashoffset: 22; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes cv-arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(2px); }
        }
        @keyframes cv-success-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* ── Base button ── */
        .cv-glass-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          color: var(--neutral-on-background-strong);
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.25s ease,
                      background 0.25s ease,
                      border-color 0.25s ease;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          text-decoration: none;
          white-space: nowrap;
          /* soft glow ring on idle */
          box-shadow:
            0 0 0 1.5px rgba(99,102,241,0.18),
            0 2px 14px rgba(99,102,241,0.10),
            inset 0 1px 0 rgba(255,255,255,0.12);
          animation: cv-ring-pulse 3.6s ease-in-out infinite;
        }

        /* ── Scan shimmer ── */
        .cv-glass-btn::before {
          content: "";
          position: absolute;
          top: -40%; left: 0;
          width: 28%; height: 180%;
          background: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255,255,255,0.04) 20%,
            rgba(255,255,255,0.20) 50%,
            rgba(255,255,255,0.04) 80%,
            transparent 100%
          );
          animation: cv-scan 4.6s cubic-bezier(0.45,0,0.55,1) infinite;
          pointer-events: none;
          filter: blur(0.5px);
        }

        /* ── Top rim light ── */
        .cv-glass-btn::after {
          content: "";
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.50) 50%, transparent);
          pointer-events: none;
          opacity: 0.6;
          transition: opacity 0.25s;
        }

        /* ── Hover ── */
        .cv-glass-btn:hover {
          transform: translateY(-2px) scale(1.04);
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.28);
          box-shadow:
            0 0 0 2px rgba(99,102,241,0.35),
            0 6px 24px rgba(99,102,241,0.20),
            inset 0 1px 0 rgba(255,255,255,0.18);
          animation: none;
        }
        .cv-glass-btn:hover::after { opacity: 1; }
        .cv-glass-btn:hover .cv-arrow-icon {
          animation: cv-arrow-bounce 0.6s ease-in-out infinite;
        }

        /* ── Active / click ── */
        .cv-glass-btn:active { transform: scale(0.97); }

        /* ── Success state ── */
        .cv-glass-btn.cv-success {
          border-color: rgba(52,211,153,0.4);
          box-shadow:
            0 0 0 2px rgba(52,211,153,0.25),
            0 4px 20px rgba(52,211,153,0.15),
            inset 0 1px 0 rgba(255,255,255,0.15);
          animation: none;
        }

        /* ── CTA pulse dot ── */
        .cv-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand-solid-strong, #6366f1);
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          animation: cv-dot-blink 2.4s ease-in-out infinite;
          transition: background 0.3s;
        }
        .cv-glass-btn.cv-success .cv-dot {
          background: rgb(52,211,153);
          animation: none;
        }

        /* ── Icons ── */
        .cv-icon-wrap {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
        }
        .cv-arrow-icon {
          position: relative;
          z-index: 2;
          opacity: 0.65;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          flex-shrink: 0;
        }
        .cv-success-icon {
          animation: cv-success-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .cv-check {
          stroke-dasharray: 22;
          stroke-dashoffset: 22;
          animation: cv-check-draw 0.4s ease forwards;
        }

        /* ── Label ── */
        .cv-label {
          position: relative;
          z-index: 2;
          transition: opacity 0.15s;
        }

        /* ── Light mode override — keep glass readable ── */
        @media (prefers-color-scheme: light) {
          .cv-glass-btn {
            border-color: rgba(0,0,0,0.12);
            background: rgba(255,255,255,0.55);
            color: var(--neutral-on-background-strong);
            box-shadow:
              0 0 0 1.5px rgba(99,102,241,0.20),
              0 2px 14px rgba(99,102,241,0.08),
              inset 0 1px 0 rgba(255,255,255,0.90);
          }
          .cv-glass-btn:hover {
            background: rgba(255,255,255,0.80);
            border-color: rgba(99,102,241,0.30);
            box-shadow:
              0 0 0 2px rgba(99,102,241,0.28),
              0 6px 24px rgba(99,102,241,0.12),
              inset 0 1px 0 rgba(255,255,255,1);
          }
          .cv-glass-btn::after {
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 50%, transparent);
          }
        }
      `}</style>

      <button
        className={`cv-glass-btn${clicked ? " cv-success" : ""}`}
        onClick={handleDownload}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        type="button"
        aria-label={label}
      >
        {/* CTA blink dot */}
        <span className="cv-dot" />

        {/* Icon area */}
        <span className="cv-icon-wrap">
          {clicked ? (
            <svg className="cv-success-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="cv-check" points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="cv-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
        </span>

        {/* Label */}
        <span className="cv-label">
          {clicked
            ? (label === "Download CV" ? "Downloading…" : "Mengunduh…")
            : label}
        </span>
      </button>
    </>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export function HeroSection({ settings: initialSettings }: HeroSectionProps) {
  const { lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [avatarSrc, setAvatarSrc] = useState<string>(person.avatar);
  // Skeleton hanya muncul jika tidak ada data dari server (SSR kosong)
  const [isLoading, setIsLoading] = useState<boolean>(!initialSettings);

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
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Column fillWidth horizontal="center" gap="m">
        <HeroSkeleton />
      </Column>
    );
  }

  const heroHeadline = settings
    ? lang === "en" ? settings.hero_headline_en : settings.hero_headline_id
    : "Membangun solusi digital yang bermakna";

  const heroDescription = settings
    ? lang === "en" ? settings.hero_description_en : settings.hero_description_id
    : "Saya Reza, seorang developer yang bersemangat membangun solusi digital.";

  const heroMotto = settings
    ? lang === "en" ? settings.hero_motto_en : settings.hero_motto_id
    : "";

  const ctaText = settings
    ? lang === "en" ? settings.hero_cta_text_en : settings.hero_cta_text_id
    : lang === "en" ? "About Me" : "Tentang Saya";

  const ctaLink = settings?.hero_cta_link || about.path;
  const cvUrl = settings?.cv_file ?? null;
  const cvLabel = lang === "en" ? "Download CV" : "Unduh CV";

  return (
    <Column fillWidth horizontal="center" gap="m" paddingX="l" style={{ paddingBottom: 16 }}>
      <style>{`
        @keyframes heroDotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.45; transform:scale(1.5); }
        }
        .hero-motto-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px 5px 8px;
          border-radius: 999px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-alpha-weak);
          backdrop-filter: blur(8px);
          max-width: 100%;
          overflow: hidden;
        }
        .hero-motto-text {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--neutral-on-background-weak);
          font-family: inherit;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        @media (max-width: 400px) {
          .hero-cta-row { flex-direction: column; align-items: stretch; }
          .hero-cta-row > * { width: 100%; justify-content: center; }
        }
      `}</style>
      <Column maxWidth="s" horizontal="center" align="center" fillWidth>

        {/* ── Motto pill ── */}
        {heroMotto?.trim() && (
          <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="20">
            <div className="hero-motto-pill">
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--brand-solid-strong, #6366f1)",
                flexShrink: 0,
                animation: "heroDotPulse 2.4s ease-in-out infinite",
                display: "inline-block",
              }} />
              <span className="hero-motto-text">
                {heroMotto}
              </span>
            </div>
          </RevealFx>
        )}

        <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16">
          <Heading wrap="balance" variant="display-strong-l" style={{ textAlign: "center" }}>
            {heroHeadline}
          </Heading>
        </RevealFx>

        <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
          <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl" style={{ textAlign: "center" }}>
            {heroDescription}
          </Text>
        </RevealFx>

        <RevealFx paddingTop="12" delay={0.4} fillWidth horizontal="center">
          <div className="hero-cta-row">
            <ShimmerButton
              href={ctaLink}
              avatarSrc={avatarSrc}
              label={ctaText}
              personName={person.name}
            />
            {cvUrl && (
              <DownloadCVButton cvUrl={cvUrl} label={cvLabel} />
            )}
          </div>
        </RevealFx>

      </Column>
    </Column>
  );
}
