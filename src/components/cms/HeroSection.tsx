"use client";

import { RevealFx, Column, Heading, Text } from "@once-ui-system/core";
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

/* ── Main Component ──────────────────────────────────────────────────────── */
export function HeroSection({ settings: initialSettings }: HeroSectionProps) {
  const { lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [avatarSrc, setAvatarSrc] = useState<string>(person.avatar);
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

  return (
    <Column fillWidth horizontal="center" paddingX="l" style={{ paddingBottom: 16 }}>
      <style>{`
        /* ── P8: Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .hero-dot-pulse { animation-duration: 0.01ms !important; }
        }

        @keyframes heroDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(1.5); }
        }

        /* ── P1: Headline — dominant element on page ── */
        .hero-headline {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: var(--neutral-on-background-strong);
          text-align: center;
          margin: 0;
          word-wrap: break-word;
          text-wrap: balance;
        }

        /* ── P1 + P6: Description — secondary, text-shadow for contrast guarantee ── */
        .hero-description {
          font-size: 1.125rem;
          font-weight: 400;
          line-height: 1.6;
          color: var(--neutral-on-background-weak);
          opacity: 0.82;
          text-align: center;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
          text-wrap: balance;
        }

        /* ── P1: Motto pill — smallest weight, must not compete with headline ── */
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

        /* ── P1 + P6: motto text small + min opacity 0.85 for WCAG contrast ── */
        .hero-motto-text {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: var(--neutral-on-background-weak);
          opacity: 0.85;
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

        @media (max-width: 640px) {
          /* P2: mobile whitespace 60% of desktop */
          .hero-headline { font-size: clamp(2rem, 7vw, 2.5rem); }
          .hero-description { font-size: 1rem; }
        }

        @media (max-width: 400px) {
          .hero-cta-row { flex-direction: column; align-items: stretch; }
          .hero-cta-row > * { width: 100%; justify-content: center; }
        }
      `}</style>

      <Column maxWidth="s" horizontal="center" align="center" fillWidth>

        {/* ── Motto pill — P1: smallest visual weight, P5: accent ONLY on this dot ── */}
        {heroMotto?.trim() && (
          <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="24">
            <div className="hero-motto-pill">
              <span
                className="hero-dot-pulse"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--brand-solid-strong, #6366f1)",
                  flexShrink: 0,
                  animation: "heroDotPulse 2.4s ease-in-out infinite",
                  display: "inline-block",
                }}
              />
              <span className="hero-motto-text">{heroMotto}</span>
            </div>
          </RevealFx>
        )}

        {/* ── Headline — P1: 1x spacing above, dominant visual weight ── */}
        <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="24">
          <Heading
            as="h1"
            wrap="balance"
            variant="display-strong-l"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "var(--neutral-on-background-strong)",
              textAlign: "center",
            }}
          >
            {heroHeadline}
          </Heading>
        </RevealFx>

        {/* ── Description — P1: 0.75x gap (smaller), P6: contrast via opacity + shadow ── */}
        <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="16">
          <Text
            wrap="balance"
            variant="heading-default-xl"
            style={{
              fontSize: "1.125rem",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "var(--neutral-on-background-weak)",
              opacity: 0.82,
              textAlign: "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {heroDescription}
          </Text>
        </RevealFx>

        {/* ── CTA — P1: 1.5x = most breathing room, paddingTop 40px ── */}
        <RevealFx delay={0.4} fillWidth horizontal="center" style={{ paddingTop: "40px" }}>
          <div className="hero-cta-row">
            <ShimmerButton
              href={ctaLink}
              avatarSrc={avatarSrc}
              label={ctaText}
              personName={person.name}
            />
          </div>
        </RevealFx>

      </Column>
    </Column>
  );
}
