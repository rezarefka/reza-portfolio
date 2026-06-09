export const dynamic = "force-dynamic";

import { Column, Meta, Schema } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { WorkPageClient } from "@/components/work/WorkPageClient";
import { getPublishedProjects } from "@/lib/db";

export async function generateMetadata() {
  return Meta.generate({
    title: work.title,
    description: work.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(work.title)}`,
    path: work.path,
  });
}

export default async function Work() {
  const projects = await getPublishedProjects().catch(() => []);

  return (
    <Column maxWidth="m" paddingTop="0">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* ── Creative Hero Header ─────────────────────────────── */}
      <style>{`
        @keyframes workHeroIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes workLineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes workDotPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.5); }
        }
        @keyframes workGridFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .work-hero {
          position: relative;
          width: 100%;
          padding: 56px 0 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          overflow: hidden;
        }

        /* Subtle grid background */
        .work-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px),
            linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%);
          animation: workGridFade 1s ease 0.1s both;
          pointer-events: none;
        }

        /* Glow orb top center */
        .work-hero-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(ellipse,
            color-mix(in srgb, var(--brand-background-strong) 18%, transparent) 0%,
            transparent 70%);
          pointer-events: none;
        }

        /* Eyebrow label */
        .work-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          border-radius: 99px;
          border: 1px solid var(--neutral-alpha-medium);
          background: var(--neutral-alpha-weak);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--neutral-on-background-weak);
          margin-bottom: 20px;
          position: relative;
          animation: workHeroIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .work-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--brand-background-strong);
          animation: workDotPulse 2s ease-in-out infinite;
        }

        /* Main title */
        .work-hero-title {
          position: relative;
          font-size: clamp(32px, 6vw, 52px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--neutral-on-background-strong);
          margin: 0 0 6px;
          animation: workHeroIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.18s both;
        }
        /* Gradient highlight on last word */
        .work-hero-title span {
          background: linear-gradient(
            135deg,
            var(--brand-background-strong) 0%,
            var(--accent-background-strong) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Animated underline */
        .work-hero-underline {
          width: 72px;
          height: 3px;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--brand-background-strong), var(--accent-background-strong));
          margin: 18px auto 20px;
          transform-origin: left center;
          animation: workLineGrow 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both;
        }

        /* Subtitle */
        .work-hero-sub {
          font-size: 14px;
          color: var(--neutral-on-background-weak);
          line-height: 1.6;
          max-width: 380px;
          margin: 0 auto;
          animation: workHeroIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.28s both;
        }

        /* Stats row */
        .work-hero-stats {
          display: flex;
          gap: 0;
          margin-top: 28px;
          border: 1px solid var(--neutral-alpha-weak);
          border-radius: 12px;
          overflow: hidden;
          background: var(--neutral-alpha-weak);
          animation: workHeroIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.38s both;
        }
        .work-stat-item {
          padding: 12px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .work-stat-item + .work-stat-item {
          border-left: 1px solid var(--neutral-alpha-weak);
        }
        .work-stat-num {
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          color: var(--neutral-on-background-strong);
          font-variant-numeric: tabular-nums;
        }
        .work-stat-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--neutral-on-background-weak);
        }

        @media (max-width: 480px) {
          .work-hero { padding: 40px 0 36px; }
          .work-stat-item { padding: 10px 16px; }
          .work-stat-num { font-size: 18px; }
        }
      `}</style>

      <div className="work-hero">
        <div className="work-hero-grid" />
        <div className="work-hero-glow" />

        {/* Eyebrow */}
        <div className="work-eyebrow">
          <span className="work-eyebrow-dot" />
          Portofolio Karya
        </div>

        {/* Title */}
        <h1 className="work-hero-title">
          Proyek &amp; <span>Kreasi</span>
        </h1>

        {/* Animated line */}
        <div className="work-hero-underline" />

        {/* Subtitle */}
        <p className="work-hero-sub">
          Kumpulan karya nyata — dari web app, mobile, visualisasi data, hingga desain kreatif.
        </p>

        {/* Stats */}
        <div className="work-hero-stats">
          <div className="work-stat-item">
            <span className="work-stat-num">{projects.length}</span>
            <span className="work-stat-label">Total Proyek</span>
          </div>
          <div className="work-stat-item">
            <span className="work-stat-num">
              {new Set(projects.map((p) => p.category).filter(Boolean)).size}
            </span>
            <span className="work-stat-label">Kategori</span>
          </div>
          <div className="work-stat-item">
            <span className="work-stat-num">
              {projects.filter((p) => p.live_demo_url).length}
            </span>
            <span className="work-stat-label">Live Demo</span>
          </div>
        </div>
      </div>

      {/* ── Project List ──────────────────────────────────────── */}
      {projects.length > 0 ? (
        <WorkPageClient projects={projects} />
      ) : (
        <></>
      )}
    </Column>
  );
}
