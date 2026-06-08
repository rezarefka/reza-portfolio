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

/* ── Download CV Button — Minimal ───────────────────────────────────────── */
function DownloadCVButton({ cvUrl, label }: { cvUrl: string; label: string }) {
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
        @keyframes cv-check-draw {
          from { stroke-dashoffset: 20; }
          to   { stroke-dashoffset: 0; }
        }
        .cv-min-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid var(--neutral-alpha-medium);
          background: transparent;
          color: var(--neutral-on-background-strong);
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          text-decoration: none;
        }
        .cv-min-btn:hover {
          background: var(--neutral-alpha-weak);
          border-color: var(--neutral-alpha-strong);
        }
        .cv-min-btn:active {
          background: var(--neutral-alpha-medium);
        }
        .cv-check {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          animation: cv-check-draw 0.35s ease forwards;
        }
      `}</style>

      <button
        className="cv-min-btn"
        onClick={handleDownload}
        type="button"
        aria-label={label}
      >
        {clicked ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline className="cv-check" points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        )}
        {clicked ? "Mengunduh…" : label}
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
