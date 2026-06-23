"use client";

import { RevealFx, Column } from "@once-ui-system/core";
import { about, person } from "@/resources";
import { useLang } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { ShimmerButton } from "./ShimmerButton";
import { HeroSkeleton } from "@/components/Skeletons";

interface HeroSectionProps {
  settings: SiteSettings | null;
}

export function HeroSection({ settings: initialSettings }: HeroSectionProps) {
  const { lang } = useLang();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [avatarSrc, setAvatarSrc] = useState<string>(person.avatar);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSettings);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

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

  /* ── Subtle dot-grid canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width  = rect.width;
      h = canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    type Dot = { x: number; y: number; alpha: number; dir: number; speed: number };
    const dots: Dot[] = [];
    const GAP = 40;
    const rebuildDots = () => {
      dots.length = 0;
      for (let x = GAP; x < w; x += GAP)
        for (let y = GAP; y < h; y += GAP)
          dots.push({ x, y, alpha: Math.random() * 0.3 + 0.05, dir: Math.random() > 0.5 ? 1 : -1, speed: Math.random() * 0.003 + 0.001 });
    };
    rebuildDots();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.alpha += d.dir * d.speed;
        if (d.alpha > 0.35 || d.alpha < 0.04) d.dir *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${d.alpha})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [isLoading]);

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
          padding: 0 24px 24px;
          overflow: hidden;
        }

        /* ── Canvas bg ── */
        .hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
        }

        /* ── Radial vignette to fade canvas at edges ── */
        .hero-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 70% at 50% 50%,
            transparent 0%, var(--neutral-background-page, #09090b) 100%);
          pointer-events: none;
          z-index: 1;
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
          0%   { opacity:0;    transform:translateY(16px) scale(0.985); filter: blur(8px); }
          60%  { opacity:0.9;  filter: blur(1px); }
          100% { opacity:0.82; transform:translateY(0)     scale(1);    filter: blur(0); }
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

        /* ── Scroll indicator ── */
        @keyframes scrollBounce {
          0%,100% { transform:translateY(0) translateX(-50%); opacity:0.6; }
          50%      { transform:translateY(6px) translateX(-50%); opacity:1; }
        }
        .hero-scroll-hint {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          animation: scrollBounce 2s ease-in-out infinite;
          z-index: 2;
          pointer-events: none;
        }
        .hero-scroll-line {
          width: 1px; height: 32px;
          background: linear-gradient(to bottom, var(--neutral-alpha-medium), transparent);
        }

        @media (max-width: 640px) {
          .hero-word span { font-size: clamp(1.9rem, 7vw, 2.6rem); }
          .hero-desc { font-size: 1rem; margin-bottom: 32px; }
          .hero-root { padding: 0 16px 48px; }
        }
      `}</style>

      {/* Dot-grid canvas */}
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

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

      {/* Scroll hint */}
      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="hero-scroll-line" />
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-alpha-strong)" strokeWidth="2" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  );
}
