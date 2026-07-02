"use client";

import { RevealFx, Column } from "@once-ui-system/core";
import { about, person } from "@/resources";
import { useLang } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShimmerButton } from "./ShimmerButton";
import { HeroSkeleton } from "@/components/Skeletons";

/* ── Live clock, Makassar (UTC+8 / WITA) ── */
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
      setTime(now);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time ? `${time} WITA` : ""}</span>;
}

interface HeroSectionProps {
  settings: SiteSettings | null;
}

export function HeroSection({ settings: initialSettings }: HeroSectionProps) {
  const { lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [avatarSrc, setAvatarSrc] = useState<string>(person.avatar);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  /* ── Supabase refresh ── */
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings").select("*")
      .order("updated_at", { ascending: false })
      .limit(1).single()
      .then(({ data }) => {
        if (data) { setSettings(data); if (data.avatar) setAvatarSrc(data.avatar.split("?")[0]); }
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <Column fillWidth horizontal="center" gap="m"><HeroSkeleton /></Column>;

  const heroHeadline    = settings ? (lang === "en" ? settings.hero_headline_en    : settings.hero_headline_id)    : "Membangun solusi digital yang bermakna";
  const heroDescription = settings ? (lang === "en" ? settings.hero_description_en : settings.hero_description_id) : "Saya Reza, developer yang membangun solusi digital.";
  const heroMotto       = settings ? (lang === "en" ? settings.hero_motto_en        : settings.hero_motto_id)       : "";
  const ctaText         = settings ? (lang === "en" ? settings.hero_cta_text_en    : settings.hero_cta_text_id)    : (lang === "en" ? "About Me" : "Tentang Saya");
  const ctaLink         = settings?.hero_cta_link || about.path;

  /* Split headline into words for stagger animation */
  const words = heroHeadline.split(" ");

  return (
    <div className="hero-root">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hero-word, .hero-motto-pill, .hero-desc, .hero-cta,
          .hero-word span, .hero-dot { animation-duration:0.01ms!important; transition-duration:0.01ms!important; }
        }

        /* ── Root ── */
        .hero-root {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 56px 24px 24px;
          overflow: hidden;
        }

        /* ── Canvas bg ── */
        .hero-canvas {
          display: none;
        }

        /* ── Radial vignette — dihapus ── */
        .hero-vignette {
          display: none;
        }

        /* ── Content wrapper ── */
        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 720px;
          width: 100%;
          gap: 0;
        }

        /* ── Status bar: location (fixed top-left) + live clock (fixed top-right) ── */
        .hero-statusbar {
          position: fixed;
          top: 28px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0 22px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--neutral-on-background-weak);
          z-index: 8;
          pointer-events: none;
        }
        .hero-status-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          pointer-events: auto;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }
        .hero-status-item:hover { opacity: 1; }
        .hero-status-item svg {
          width: 11px;
          height: 11px;
          flex-shrink: 0;
          opacity: 0.7;
        }
        @media (max-width: 640px) {
          .hero-statusbar { top: 18px; padding: 0 14px; font-size: 9px; }
        }


        /* ── Motto pill ── */
        @keyframes pillSlideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hero-motto-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px 6px 8px;
          border-radius: 999px;
          border: 1px solid var(--neutral-alpha-medium);
          background: color-mix(in srgb, var(--neutral-background-medium) 80%, transparent);
          backdrop-filter: blur(12px);
          max-width: 100%;
          overflow: hidden;
          animation: pillSlideDown 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both;
          margin-bottom: 32px;
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(1.6); }
        }
        .hero-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--brand-solid-strong, #6366f1);
          flex-shrink: 0;
          animation: dotPulse 2.4s ease-in-out infinite;
        }
        .hero-motto-text {
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--neutral-on-background-medium);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Word-by-word headline reveal ── */
        @keyframes wordUp {
          from { opacity:0; transform:translateY(24px) skewY(2deg); }
          to   { opacity:1; transform:translateY(0)    skewY(0deg); }
        }
        .hero-headline {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.25em;
          margin-bottom: 24px;
        }
        .hero-word {
          overflow: hidden;
          display: inline-block;
        }
        .hero-word span {
          display: inline-block;
          font-size: clamp(2.5rem, 5.5vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--neutral-on-background-strong);
          animation: wordUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }
        /* Last word gets gradient accent */
        .hero-word:last-child span {
          background: linear-gradient(
            135deg,
            var(--brand-solid-strong, #6366f1) 0%,
            color-mix(in srgb, var(--brand-solid-strong, #6366f1) 60%, #a78bfa) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── Description ── */
        @keyframes descFade {
          0%   { opacity:0; transform:translateY(16px) scale(0.985); filter: blur(8px); }
          60%  { opacity:1; filter: blur(1px); }
          100% { opacity:1; transform:translateY(0)     scale(1);    filter: blur(0); }
        }
        .hero-desc {
          font-size: 1.125rem;
          font-weight: 400;
          line-height: 1.65;
          color: var(--neutral-on-background-weak);
          text-align: center;
          max-width: 520px;
          margin: 0 0 40px;
          animation: descFade 1s cubic-bezier(0.22,1,0.36,1) 0.45s both;
          will-change: opacity, transform, filter;
        }

        /* ── CTA ── */
        @keyframes ctaRise {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        .hero-cta {
          animation: ctaRise 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.65s both;
        }

        @media (max-width: 640px) {
          .hero-word span { font-size: clamp(1.9rem, 7vw, 2.6rem); }
          .hero-desc { font-size: 1rem; margin-bottom: 32px; }
          .hero-root { padding: 0 16px 48px; }
        }
      `}</style>

      {/* Status bar: location left, live clock right.
          Rendered via portal straight into <body> so `position: fixed` is
          always relative to the real viewport — HeroSection sits inside
          <ScrollAnimate>, whose reveal animation leaves a lingering
          `transform` on its wrapper div, which would otherwise hijack
          fixed-position descendants and trap them inside that wrapper. */}
      {mounted && createPortal(
        <div className="hero-statusbar">
          <span className="hero-status-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Makassar, Indonesia
          </span>
          <span className="hero-status-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <LiveClock />
          </span>
        </div>,
        document.body
      )}

      {/* Dot-grid canvas — hidden */}
      <div className="hero-content">
        {/* Motto pill */}
        {heroMotto?.trim() && (
          <div className="hero-motto-pill">
            <span className="hero-dot" />
            <span className="hero-motto-text">{heroMotto}</span>
          </div>
        )}

        {/* Word-by-word headline */}
        <h1 className="hero-headline" aria-label={heroHeadline}>
          {words.map((word, i) => (
            <span key={i} className="hero-word">
              <span style={{ animationDelay: `${0.2 + i * 0.07}s` }}>{word}</span>
            </span>
          ))}
        </h1>

        {/* Description */}
        <p className="hero-desc">{heroDescription}</p>

        {/* CTA */}
        <div className="hero-cta">
          <ShimmerButton
            href={ctaLink}
            avatarSrc={avatarSrc}
            label={ctaText}
            personName={person.name}
          />
        </div>
      </div>
    </div>
  );
}
