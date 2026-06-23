"use client";

import { useEffect, useRef, useState, Fragment } from "react";
import { RevealFx } from "@once-ui-system/core";
import { useLang } from "@/lib/lang-context";
import type { SiteSettings } from "@/lib/types";

interface StatisticsProps {
  settings: SiteSettings | null;
  projectsCount: number;
  blogsCount: number;
}

function useCountUp(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.25 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);
  return { count, ref };
}

function AnimNum({ value, suffix="" }: { value:number; suffix?:string }) {
  const { count, ref } = useCountUp(value);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const IconBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2.5"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <path d="M2 12.5h8M14 12.5h8"/><path d="M12 12.5v1"/>
  </svg>
);
const IconFolder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L12 7h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
    <path d="M3 10h18" strokeOpacity="0.4"/>
  </svg>
);
const IconPen = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    <path d="M15 5l3 3" strokeOpacity="0.4"/>
  </svg>
);

/* P5: 1st = brand accent on number; 2nd & 3rd = calm neutrals */
const ACCENTS = [
  "var(--brand-solid-strong, #6366f1)",
  "var(--neutral-on-background-medium)",
  "var(--neutral-on-background-weak)",
];

function StatCard({ icon, value, suffix, label, sublabel, accentColor, index }: {
  icon:React.ReactNode; value:number; suffix?:string;
  label:string; sublabel:string; accentColor:string; index:number;
}) {
  return (
    <div className="psc-card" style={{"--acc":accentColor} as React.CSSProperties}>
      <div className="psc-icon">{icon}</div>
      <div className="psc-body">
        {/* P5: number gets accent; icon + label stay neutral */}
        <div className="psc-num"><AnimNum value={value} suffix={suffix}/></div>
        <div className="psc-label">{label}</div>
        <div className="psc-sub">{sublabel}</div>
      </div>
    </div>
  );
}

export function StatisticsSection({ settings, projectsCount, blogsCount }: StatisticsProps) {
  const { lang } = useLang();
  const isID = lang === "id";
  const yearsExp = settings?.stats_years_experience ?? 0;
  if (!yearsExp && !projectsCount && !blogsCount) return null;

  const stats = [
    yearsExp>0      && { icon:<IconBriefcase/>, value:yearsExp,      suffix:"+", label:isID?"Tahun Pengalaman":"Years of Experience",   sublabel:isID?"Membangun solusi digital profesional":"Building professional digital solutions" },
    projectsCount>0 && { icon:<IconFolder/>,    value:projectsCount,             label:isID?"Proyek Dipublikasikan":"Published Projects",   sublabel:isID?"Dari web app hingga visualisasi data":"From web apps to data visualization" },
    blogsCount>0    && { icon:<IconPen/>,        value:blogsCount,                label:isID?"Artikel Diterbitkan":"Published Articles",      sublabel:isID?"Insight seputar teknologi & engineering":"Insights on technology & engineering" },
  ].filter(Boolean) as { icon:React.ReactNode; value:number; suffix?:string; label:string; sublabel:string }[];

  if (!stats.length) return null;

  return (
    <RevealFx translateY="12" delay={0.1} fillWidth>
      <style>{`
        .psc-wrap {
          width: 100%;
          display: flex; flex-direction: column; align-items: center; gap: 40px;
        }

        /* ── Eyebrow ── */
        .psc-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 16px; border-radius: 99px;
          border: 1px solid var(--neutral-alpha-medium);
          background: var(--neutral-background-weak);
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--neutral-on-background-weak);
        }
        .psc-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--neutral-on-background-weak); opacity: 0.5;
        }

        /* ── Heading ── */
        .psc-heading {
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 800; letter-spacing: -0.025em; line-height: 1.15;
          text-align: center;
          color: var(--neutral-on-background-strong);
          margin: 0;
        }
        .psc-subheading {
          font-size: 14px; line-height: 1.6;
          color: var(--neutral-on-background-weak);
          text-align: center; max-width: 380px;
          padding: 0 16px; margin: 0;
        }

        /* ── Divider ornament ── */
        .psc-ornament {
          display: flex; align-items: center; gap: 16px; max-width: 200px; width: 100%;
        }
        .psc-ornament-line {
          flex:1; height:1px;
          background: linear-gradient(90deg, var(--neutral-alpha-weak), transparent);
        }
        .psc-ornament-line.r { background: linear-gradient(270deg, var(--neutral-alpha-weak), transparent); }

        /* ── Row ── */
        .psc-row {
          display: flex; flex-direction: row; gap: 0;
          width: 100%;
          border: 1px solid var(--neutral-alpha-weak);
          border-radius: 16px;
          overflow: hidden;
          background: var(--neutral-background-weak);
        }

        /* ── Card ── */
        .psc-card {
          position: relative;
          flex: 1; min-width: 0;
          display: flex; flex-direction: row; align-items: center; gap: 16px;
          padding: 24px 22px;
          overflow: hidden;
          cursor: default;
          transition: background 0.3s ease;
        }
        /* Subtle top-line accent */
        .psc-card::before {
          content:"";
          position: absolute; top:0; left:12%; right:12%; height:1px;
          background: linear-gradient(90deg,transparent,var(--acc) 50%,transparent);
          opacity: 0.35; pointer-events:none;
        }
        /* Subtle glow */
        .psc-card::after {
          content:"";
          position: absolute; top:-20px; left:-20px;
          width:100px; height:100px; border-radius:50%;
          background: var(--acc); opacity:0.03;
          filter: blur(20px); pointer-events:none;
          transition: opacity 0.3s;
        }
        .psc-card:hover { background: var(--neutral-background-medium); }
        .psc-card:hover::after { opacity:0.08; }

        /* P5: Icon badge — neutral color */
        .psc-icon {
          flex-shrink: 0; width: 48px; height: 48px; border-radius: 12px;
          border: 1px solid var(--neutral-alpha-medium);
          background: var(--neutral-background-medium);
          display: flex; align-items: center; justify-content: center;
          color: var(--neutral-on-background-medium); /* P5: neutral, not accent */
          transition: background 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; z-index:1;
        }
        .psc-card:hover .psc-icon {
          background: var(--neutral-background-strong);
          transform: scale(1.08) rotate(-4deg);
        }

        .psc-body { position:relative; z-index:1; display:flex; flex-direction:column; gap:3px; min-width:0; flex:1; }

        /* P5: Number accent */
        .psc-num {
          font-size: clamp(28px,4vw,40px);
          font-weight: 800; line-height: 1; letter-spacing: -0.035em;
          color: var(--acc); /* P5: ONLY numbers get accent color */
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .psc-label { font-size:13px; font-weight:600; color:var(--neutral-on-background-strong); margin-top:6px; letter-spacing:0.01em; line-height:1.3; }
        .psc-sub   { font-size:11px; color:var(--neutral-on-background-weak); letter-spacing:0.01em; line-height:1.4; }

        /* Divider */
        .psc-divider {
          width:1px; align-self:stretch;
          background: linear-gradient(to bottom,transparent 0%,var(--neutral-alpha-medium) 30%,var(--neutral-alpha-medium) 70%,transparent 100%);
          flex-shrink:0;
        }

        @media (max-width:640px) {
          .psc-row { flex-direction:column; border-radius:16px; }
          .psc-divider { width:100%; height:1px; background:linear-gradient(to right,transparent,var(--neutral-alpha-medium) 30%,var(--neutral-alpha-medium) 70%,transparent); }
          .psc-num { font-size:28px!important; }
          .psc-card { padding:20px 18px; }
        }
      `}</style>

      <div className="psc-wrap">
        {/* Header */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div className="psc-eyebrow">
            <span className="psc-eyebrow-dot"/>
            {isID?"Rekam Jejak":"Track Record"}
            <span className="psc-eyebrow-dot"/>
          </div>
          <h2 className="psc-heading">{isID?"Angka yang Berbicara":"Milestones at a Glance"}</h2>
          <p className="psc-subheading">
            {isID
              ? "Setiap angka adalah cerminan dari dedikasi, kerja nyata, dan pertumbuhan berkelanjutan."
              : "Each number reflects dedication, real-world output, and continuous professional growth."}
          </p>
          <div className="psc-ornament">
            <div className="psc-ornament-line"/>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="2.5" fill="var(--neutral-alpha-medium)"/>
              <circle cx="6" cy="6" r="5" stroke="var(--neutral-alpha-weak)" strokeWidth="1" fill="none"/>
            </svg>
            <div className="psc-ornament-line r"/>
          </div>
        </div>

        {/* Cards */}
        <div className="psc-row">
          {stats.map((s, i) => (
            <Fragment key={i}>
              <StatCard index={i} accentColor={ACCENTS[i % ACCENTS.length]} {...s}/>
              {i < stats.length-1 && <div className="psc-divider"/>}
            </Fragment>
          ))}
        </div>
      </div>
    </RevealFx>
  );
}
