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

/* ── Download CV Button — Accent CTA ────────────────────────────────────── */
function DownloadCVButton({ cvUrl, label }: { cvUrl: string; label: string }) {
  const [clicked, setClicked] = useState(false);

  const handleDownload = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
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
          0%   { transform: translateX(-130%) rotate(-15deg); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateX(230%)  rotate(-15deg); opacity: 0; }
        }
        @keyframes cv-check-draw {
          from { stroke-dashoffset: 22; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes cv-breathe {
          0%, 100% { box-shadow: 0 2px 16px var(--brand-alpha-medium); }
          50%       { box-shadow: 0 4px 26px var(--brand-alpha-strong); }
        }
        .cv-cta-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid var(--brand-alpha-strong);
          background: var(--brand-background-strong);
          color: var(--brand-on-solid-strong);
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s;
          animation: cv-breathe 4s ease-in-out infinite;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          text-decoration: none;
          white-space: nowrap;
        }
        .cv-cta-btn::before {
          content: "";
          position: absolute;
          top: -40%; left: 0;
          width: 30%; height: 180%;
          background: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.22) 50%,
            rgba(255,255,255,0.06) 75%,
            transparent 100%
          );
          animation: cv-shimmer 4.4s cubic-bezier(0.45,0,0.55,1) infinite;
          pointer-events: none;
          filter: blur(0.5px);
        }
        .cv-cta-btn::after {
          content: "";
          position: absolute;
          top: 0; left: 12%; right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent);
          pointer-events: none;
        }
        .cv-cta-btn:hover {
          transform: translateY(-2px) scale(1.04);
          opacity: 0.92;
          animation: none;
        }
        .cv-cta-btn:active {
          transform: scale(0.97);
        }
        .cv-check {
          stroke-dasharray: 22;
          stroke-dashoffset: 22;
          animation: cv-check-draw 0.35s ease forwards;
        }
        .cv-icon { position: relative; z-index: 2; }
        .cv-label { position: relative; z-index: 2; }
      `}</style>

      <button
        className="cv-cta-btn"
        onClick={handleDownload}
        type="button"
        aria-label={label}
      >
        <span className="cv-icon">
          {clicked ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="cv-check" points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
        </span>
        <span className="cv-label">{clicked ? (label === "Download CV" ? "Downloading…" : "Mengunduh…") : label}</span>
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
