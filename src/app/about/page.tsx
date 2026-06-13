export const dynamic = "force-dynamic";

import {
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Tag,
  Text,
  Meta,
  Schema,
  Row,
  Card,
  Line,
} from "@once-ui-system/core";
import { baseURL, about, person, social } from "@/resources";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";
import React from "react";
import {
  getCertificates,
  getAboutEducation,
  getAboutExperiences,
  getAboutSkills,
  getAboutOrganizations,
} from "@/lib/db";
import { format } from "date-fns";
function safeDate(d: string | null | undefined, fmt: string, opts?: Parameters<typeof format>[2]): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return format(date, fmt, opts);
  } catch { return "—"; }
}

import { ScrollReveal } from "@/components/ScrollReveal";
import { AvatarFromCms } from "@/components/about/AvatarFromCms";
import { SkillsGrid } from "@/components/about/SkillsGrid";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default async function About() {
  const [certificates, educations, experiences, skills, organizations] = await Promise.all([
    getCertificates().catch(() => []),
    getAboutEducation().catch(() => []),
    getAboutExperiences().catch(() => []),
    getAboutSkills().catch(() => []),
    getAboutOrganizations().catch(() => []),
  ]);

  const structure = [
    { title: "Perkenalan",       display: about.intro.display,     items: [], id: "perkenalan" },
    { title: "Pengalaman Kerja", display: true,                     items: [], id: "pengalaman-kerja" },
    { title: "Pendidikan",       display: true,                     items: [], id: "pendidikan" },
    { title: "Keahlian",         display: true,                     items: [], id: "keahlian" },
    { title: "Organisasi",       display: organizations.length > 0, items: [], id: "organisasi" },
    { title: "Sertifikat",       display: certificates.length > 0,  items: [], id: "sertifikat" },
  ];

  return (
    <Column maxWidth="m" style={{ overflow: "visible" }}>

      {/* ── Global styles ───────────────────────────────────────── */}
      <style>{`
        /* ══ Layout ═══════════════════════════════════════════════ */
        .about-wrap {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          width: 100%;
          gap: 0;
          min-width: 0;
        }
        .about-content-col {
          min-width: 0;
          flex: 1 1 0;
          overflow: visible;
          width: 100%;
        }
        @media (max-width: 768px) {
          .about-wrap { flex-direction: column; align-items: stretch; }
        }

        /* ══ Section header bar ═══════════════════════════════════ */
        .section-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .section-bar {
          width: 4px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .section-eyebrow {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--neutral-on-background-weak);
          margin-bottom: 2px;
        }

        /* ══ Timeline (Experience) ════════════════════════════════ */
        .tl-wrap { position: relative; }
        .tl-line {
          position: absolute;
          left: 19px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: linear-gradient(to bottom,
            var(--brand-alpha-medium) 0%,
            var(--neutral-alpha-weak) 100%);
          border-radius: 2px;
        }
        .tl-row {
          display: flex;
          gap: 20px;
          padding-bottom: 32px;
          position: relative;
        }
        .tl-dot {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          margin-top: 4px;
        }
        .tl-content { flex: 1; min-width: 0; padding-top: 4px; }
        .tl-company {
          font-size: 16px;
          font-weight: 700;
          color: var(--neutral-on-background-strong);
          margin: 0 0 2px;
        }
        .tl-role {
          font-size: 13px;
          color: var(--brand-on-background-medium);
          font-weight: 600;
          margin: 0 0 6px;
        }
        .tl-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          background: var(--neutral-alpha-weak);
          border: 1px solid var(--neutral-alpha-weak);
          font-size: 11px;
          color: var(--neutral-on-background-weak);
          font-weight: 500;
          margin-bottom: 10px;
        }
        .tl-desc {
          font-size: 13.5px;
          color: var(--neutral-on-background-weak);
          line-height: 1.65;
          margin: 0;
          border-left: 2px solid var(--neutral-alpha-weak);
          padding-left: 12px;
        }
        @media (max-width: 480px) {
          .tl-line { display: none; }
          .tl-dot { display: none; }
          .tl-row { gap: 0; }
        }

        /* ══ Education list & cards ══════════════════════════════ */
        .edu-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin-bottom: 48px;
        }
        .edu-reveal-wrap { display: block; width: 100%; }

        .edu-card {
          display: block;
          width: 100%;
          border-radius: 16px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          overflow: hidden;
          box-sizing: border-box;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .edu-card:hover {
          border-color: var(--neutral-alpha-medium);
          box-shadow: 0 8px 32px color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
          transform: translateY(-2px);
        }
        .edu-strip {
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, var(--brand-background-strong) 0%, var(--accent-background-strong) 100%);
        }

        /* ── Logo kilau looping animation ── */
        @keyframes logoShimmer {
          0%   { box-shadow: 0 0 0 0 transparent, inset 0 0 0 0 transparent; }
          30%  { box-shadow: 0 0 16px 3px color-mix(in srgb, var(--brand-background-strong) 35%, transparent),
                             inset 0 0 8px 0 color-mix(in srgb, var(--brand-background-strong) 15%, transparent); }
          60%  { box-shadow: 0 0 22px 5px color-mix(in srgb, var(--accent-background-strong) 30%, transparent),
                             inset 0 0 10px 0 color-mix(in srgb, var(--accent-background-strong) 12%, transparent); }
          100% { box-shadow: 0 0 0 0 transparent, inset 0 0 0 0 transparent; }
        }
        @keyframes logoShimmerRing {
          0%   { opacity: 0; transform: scale(0.88); }
          20%  { opacity: 1; }
          70%  { opacity: 0.6; transform: scale(1.08); }
          100% { opacity: 0; transform: scale(1.18); }
        }

        /* ── Header area: logo + nama (no rumpun ilmu) ── */
        .edu-header {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 22px 16px;
          box-sizing: border-box;
        }
        /* Logo container — lebih besar, dengan kilau */
        .edu-logo-wrap {
          flex: 0 0 64px;
          width: 64px;
          height: 64px;
          position: relative;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .edu-logo {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
          border: 1.5px solid color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: logoShimmer 3.6s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        /* Shimmer ring – outer glow pulse */
        .edu-logo-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid color-mix(in srgb, var(--brand-background-strong) 40%, transparent);
          animation: logoShimmerRing 3.6s ease-in-out infinite;
          pointer-events: none;
        }
        .edu-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; padding: 7px; display: block; }

        /* nama area: full width, tahun di pojok kanan atas */
        .edu-name {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .edu-name-top {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 3px;
        }
        .edu-univ {
          font-size: 15px;
          font-weight: 700;
          line-height: 1.4;
          color: var(--neutral-on-background-strong);
          margin: 0;
          word-break: break-word;
          flex: 1 1 0;
          min-width: 0;
        }
        /* Tahun lulus badge — pojok kanan atas */
        .edu-year-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 99px;
          background: var(--neutral-alpha-weak);
          border: 1px solid var(--neutral-alpha-weak);
          font-size: 11px;
          font-weight: 600;
          color: var(--neutral-on-background-weak);
          white-space: nowrap;
          margin-top: 2px;
        }
        .edu-major {
          font-size: 12px;
          color: var(--neutral-on-background-weak);
          line-height: 1.4;
          margin: 0 0 8px;
          word-break: break-word;
        }

        /* ── Chips: hanya IPK (no degree, no year) ── */
        .edu-chips {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 6px;
          padding: 0 22px 18px;
        }
        .edu-chip {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          line-height: 1;
          height: auto;
        }
        .chip-gpa { background: var(--accent-alpha-weak); color: var(--accent-on-background-strong); border: 1px solid var(--accent-alpha-medium); }

        /* ── Thesis section ── */
        .edu-thesis {
          border-top: 1px solid var(--neutral-alpha-weak);
          padding: 18px 22px 20px;
          box-sizing: border-box;
        }
        .edu-thesis-label {
          display: block;
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--neutral-on-background-weak);
          margin-bottom: 8px;
        }
        .edu-thesis-title {
          font-size: 13.5px;
          font-style: italic;
          font-weight: 600;
          color: var(--neutral-on-background-strong);
          line-height: 1.55;
          margin: 0 0 14px;
          word-break: break-word;
        }
        .edu-thesis-boxes {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 14px;
        }
        .edu-tbox {
          border-radius: 10px;
          border: 1px solid var(--neutral-alpha-weak);
          overflow: hidden;
        }
        .edu-tbox-head {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--neutral-alpha-weak);
        }
        .edu-tbox-output .edu-tbox-head { color: #818cf8; background: color-mix(in srgb, #818cf8 9%, transparent); }
        .edu-tbox-impact .edu-tbox-head { color: #34d399; background: color-mix(in srgb, #34d399 9%, transparent); }
        .edu-tbox-body {
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.65;
          color: var(--neutral-on-background-medium);
          word-break: break-word;
        }
        .edu-thesis-goal {
          font-size: 13px;
          color: var(--neutral-on-background-weak);
          line-height: 1.65;
          margin: 0 0 14px;
          word-break: break-word;
        }

        /* ── Akses Jurnal CTA button ── */
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand-background-strong) 45%, transparent); }
          50%       { box-shadow: 0 0 0 7px color-mix(in srgb, var(--brand-background-strong) 0%, transparent); }
        }
        @keyframes ctaShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .edu-journal-cta {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(
            105deg,
            var(--brand-background-strong) 0%,
            var(--accent-background-strong) 50%,
            var(--brand-background-strong) 100%
          );
          background-size: 200% auto;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s;
          animation: ctaPulse 2.4s ease-in-out infinite, ctaShimmer 3s linear infinite;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0,0,0,0.18);
          white-space: nowrap;
        }
        .edu-journal-cta:hover {
          transform: translateY(-2px) scale(1.03);
          opacity: 0.92;
          animation: ctaShimmer 1.2s linear infinite;
        }
        .edu-journal-cta:active { transform: scale(0.97); }

        /* ── Journal modal (preview jurnal) ── */
        .journal-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          background: rgba(0,0,0,0.55);
          animation: modalFadeIn 0.22s ease;
          box-sizing: border-box;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to   { opacity: 1; backdrop-filter: blur(16px); }
        }
        .journal-modal {
          width: 100%;
          max-width: 860px;
          max-height: calc(100vh - 48px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.10);
          background: var(--neutral-background-strong);
          box-shadow: 0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes modalSlideUp {
          from { transform: translateY(32px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        .journal-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--neutral-alpha-weak);
          flex-shrink: 0;
          gap: 12px;
        }
        .journal-modal-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--neutral-on-background-strong);
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .journal-modal-close {
          flex-shrink: 0;
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1px solid var(--neutral-alpha-medium);
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-strong);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: background 0.15s, transform 0.15s;
          line-height: 1;
        }
        .journal-modal-close:hover { background: var(--neutral-alpha-medium); transform: scale(1.1); }
        .journal-modal-body {
          flex: 1;
          overflow: hidden;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .journal-modal-body iframe {
          width: 100%;
          flex: 1;
          border: none;
          display: block;
          background: #fff;
        }
        .journal-modal-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--neutral-alpha-weak);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .journal-open-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          color: var(--brand-on-background-medium);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--brand-alpha-medium);
          background: var(--brand-alpha-weak);
          transition: background 0.15s;
        }
        .journal-open-link:hover { background: var(--brand-alpha-medium); }
        @media (max-width: 480px) {
          .journal-modal { border-radius: 14px; }
          .journal-modal-overlay { padding: 12px; }
        }

        /* ══ Org cards ════════════════════════════════════════════ */
        .org-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1px solid var(--neutral-alpha-weak);
          border-left: 4px solid #a78bfa;
          background: var(--neutral-background-medium);
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
        }
        .org-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 18px color-mix(in srgb, #a78bfa 12%, transparent);
        }
        .org-logo {
          flex-shrink: 0;
          width: 48px; height: 48px;
          border-radius: 10px;
          background: var(--neutral-alpha-weak);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .org-logo img { width: 100%; height: 100%; object-fit: contain; }
        .org-info { flex: 1; min-width: 0; }
        .org-name { font-size: 14px; font-weight: 700; color: var(--neutral-on-background-strong); margin: 0 0 2px; }
        .org-role { font-size: 12.5px; color: var(--brand-on-background-medium); font-weight: 600; margin: 0 0 2px; }
        .org-year { font-size: 11.5px; color: var(--neutral-on-background-weak); }
        .org-year-badge {
          flex-shrink: 0;
          padding: 4px 10px;
          border-radius: 99px;
          background: color-mix(in srgb, #a78bfa 12%, transparent);
          border: 1px solid color-mix(in srgb, #a78bfa 30%, transparent);
          font-size: 11px;
          font-weight: 600;
          color: #a78bfa;
        }

        /* ══ Certificate grid ═════════════════════════════════════ */
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
        }
        .cert-card {
          border-radius: 12px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          overflow: hidden;
          text-decoration: none;
          display: block;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, border-color 0.2s;
        }
        .cert-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 24px color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent);
          border-color: var(--neutral-alpha-medium);
        }
        .cert-thumb-wrap {
          width: 100%;
          overflow: hidden;
          background: var(--neutral-alpha-weak);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cert-thumb {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
        }
        .cert-nothumb {
          width: 100%; height: 80px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--brand-alpha-weak), var(--accent-alpha-weak));
          color: var(--brand-on-background-medium);
        }
        .cert-body { padding: 14px 16px 16px; }
        .cert-issuer {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--brand-on-background-medium);
          margin-bottom: 6px;
        }
        .cert-title {
          font-size: 13.5px; font-weight: 700;
          color: var(--neutral-on-background-strong);
          line-height: 1.4;
          margin: 0 0 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cert-date { font-size: 11.5px; color: var(--neutral-on-background-weak); display: flex; align-items: center; gap: 5px; }

        /* ══ Intro section ════════════════════════════════════════ */
        .intro-text {
          font-size: 15.5px;
          line-height: 1.8;
          color: var(--neutral-on-background-medium);
          margin: 0;
        }

        /* ══ Journal modal trigger script styles ════════════════ */
        #journal-modal-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          display: none;
        }
        #journal-modal-root.open {
          pointer-events: all;
          display: block;
        }
      `}</style>

      {/* ── Journal Modal (rendered once, controlled by JS) ─────── */}
      <div id="journal-modal-root" aria-modal="true" role="dialog">
        <div className="journal-modal-overlay" id="journal-modal-overlay">
          <div className="journal-modal">
            <div className="journal-modal-header">
              <span className="journal-modal-title" id="journal-modal-title">Preview Jurnal</span>
              <button className="journal-modal-close" id="journal-modal-close-btn" aria-label="Tutup">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="journal-modal-body">
              <iframe id="journal-modal-iframe" src="" title="Preview Jurnal" />
            </div>
            <div className="journal-modal-footer">
              <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>Scroll untuk membaca · Tekan ESC untuk tutup</span>
              <a id="journal-modal-open-link" href="#" target="_blank" rel="noopener noreferrer" className="journal-open-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal JS ────────────────────────────────────────────── */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var root = document.getElementById('journal-modal-root');
          var iframe = document.getElementById('journal-modal-iframe');
          var title = document.getElementById('journal-modal-title');
          var openLink = document.getElementById('journal-modal-open-link');
          var closeBtn = document.getElementById('journal-modal-close-btn');
          var overlay = document.getElementById('journal-modal-overlay');
          function openModal(url, label) {
            var proxyUrl = url.startsWith('http') && !url.includes('/api/') ? '/api/pdf-proxy?url=' + encodeURIComponent(url) : url;
            iframe.src = proxyUrl;
            title.textContent = label || 'Preview Jurnal';
            openLink.href = url;
            root.classList.add('open');
            document.body.style.overflow = 'hidden';
          }
          function closeModal() {
            root.classList.remove('open');
            iframe.src = '';
            document.body.style.overflow = '';
          }
          window.__openJournalModal = openModal;
          if (closeBtn) closeBtn.addEventListener('click', closeModal);
          if (overlay) overlay.addEventListener('click', function(e){ if(e.target===overlay) closeModal(); });
          document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });
        })();
      ` }} />

      <Schema as="webPage" baseURL={baseURL} title={about.title} description={about.description}
        path={about.path} image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: `${baseURL}${person.avatar}` }} />

      {about.tableOfContent.display && (
        <Column left="0" style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed" paddingLeft="24" gap="32" s={{ hide: true }}>
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}

      <div className="about-wrap">

        {/* ── Avatar Sidebar ─────────────────────────────────── */}
        {about.avatar.display && (
          <div className={styles.avatar}>
            <ScrollReveal type="scale">
              <AvatarFromCms />
            </ScrollReveal>
          </div>
        )}

        <Column className={`${styles.blockAlign} about-content-col`} flex={1}>

          {/* ══ PERKENALAN ══════════════════════════════════════ */}
          <ScrollReveal>
            <Column id="perkenalan" fillWidth marginBottom="48">
              {/* Name + role */}
              <Column marginBottom="20">
                <Heading className={styles.textAlign} variant="display-strong-xl">{person.name}</Heading>
                <Text className={styles.textAlign} variant="display-default-xs" onBackground="neutral-weak">
                  {person.role}
                </Text>
              </Column>

              {/* Social buttons */}
              {social.length > 0 && (
                <Row className={styles.blockAlign} paddingBottom="24" gap="8" wrap horizontal="center" fitWidth data-border="rounded">
                  {social.filter((s) => s.essential).map((item) =>
                    item.link ? (
                      <React.Fragment key={item.name}>
                        <Row s={{ hide: true }}>
                          <Button href={item.link} prefixIcon={item.icon} label={item.name}
                            size="s" weight="default" variant="secondary" />
                        </Row>
                        <Row hide s={{ hide: false }}>
                          <IconButton size="l" href={item.link} icon={item.icon} variant="secondary" />
                        </Row>
                      </React.Fragment>
                    ) : null
                  )}
                </Row>
              )}

              {/* Intro text */}
              {about.intro.display && (
                <Column fillWidth gap="m" style={{
                  padding: "20px 24px",
                  borderRadius: 14,
                  border: "1px solid var(--neutral-alpha-weak)",
                  background: "var(--neutral-alpha-weak)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "var(--brand-background-strong)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--neutral-on-background-weak)" }}>Tentang Saya</span>
                  </div>
                  <p className="intro-text">{about.intro.description}</p>
                </Column>
              )}
            </Column>
          </ScrollReveal>

          {/* ══ PENGALAMAN KERJA ══════════════════════════════════ */}
          <ScrollReveal delay={80}>
            <div className="section-head">
              <div className="section-bar" style={{ height: 28, background: "var(--brand-background-strong)" }} />
              <div>
                <div className="section-eyebrow">Karir</div>
                <Heading as="h2" id="pengalaman-kerja" variant="display-strong-s">{about.work.title}</Heading>
              </div>
            </div>
          </ScrollReveal>

          <div className="tl-wrap" style={{ marginBottom: 48 }}>
            <div className="tl-line" />
            {(experiences.length > 0 ? experiences : about.work.experiences).map((exp, i) => {
              const isCms = experiences.length > 0;
              const isLatest = i === 0;
              return (
                <ScrollReveal key={isCms ? (exp as typeof experiences[0]).id : i} delay={i * 70}>
                  <div className="tl-row">
                    {/* Dot */}
                    <div className="tl-dot" style={{
                      background: isLatest ? "var(--brand-background-strong)" : "var(--neutral-background-strong)",
                      border: `2px solid ${isLatest ? "var(--brand-background-strong)" : "var(--neutral-alpha-medium)"}`,
                      boxShadow: isLatest ? "0 0 14px var(--brand-alpha-medium)" : "none",
                      color: isLatest ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="tl-content">
                      <p className="tl-company">
                        {isCms ? (exp as typeof experiences[0]).company : (exp as typeof about.work.experiences[0]).company}
                      </p>
                      <p className="tl-role">
                        {isCms ? (exp as typeof experiences[0]).role_id : (exp as typeof about.work.experiences[0]).role}
                      </p>
                      <span className="tl-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {isCms ? (exp as typeof experiences[0]).timeframe : (exp as typeof about.work.experiences[0]).timeframe}
                      </span>
                      {isCms && (exp as typeof experiences[0]).description_id && (
                        <p className="tl-desc">{(exp as typeof experiences[0]).description_id}</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* ══ PENDIDIKAN ══════════════════════════════════════════ */}
          <ScrollReveal delay={100}>
            <div className="section-head">
              <div className="section-bar" style={{ height: 28, background: "var(--accent-background-strong)" }} />
              <div>
                <div className="section-eyebrow">Akademik</div>
                <Heading as="h2" id="pendidikan" variant="display-strong-s">{about.studies.title}</Heading>
              </div>
            </div>
          </ScrollReveal>

          <div className="edu-list">
            {educations.length > 0 ? educations.map((edu, i) => (
              <div key={edu.id} className="edu-reveal-wrap">
                <ScrollReveal delay={i * 80}>
                  <div className="edu-card">
                    <div className="edu-strip" />

                    {/* ── Header: logo + nama + tahun di kanan atas ── */}
                    <div className="edu-header">
                      {/* Logo dengan kilau */}
                      <div className="edu-logo-wrap">
                        <div className="edu-logo-ring" />
                        <div className="edu-logo">
                          {edu.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={edu.logo} alt={edu.university_name} />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="edu-name">
                        {/* Baris atas: nama + badge jenjang + tahun */}
                        <div className="edu-name-top">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                            <p className="edu-univ" style={{ margin: 0 }}>{edu.university_name}</p>
                            {edu.education_level && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                                background: edu.education_level === "SMA/SMK"
                                  ? "color-mix(in srgb, #fb923c 14%, transparent)"
                                  : edu.education_level === "S2" || edu.education_level === "S3"
                                    ? "color-mix(in srgb, #a78bfa 14%, transparent)"
                                    : "color-mix(in srgb, #818cf8 14%, transparent)",
                                color: edu.education_level === "SMA/SMK" ? "#fb923c"
                                  : edu.education_level === "S2" || edu.education_level === "S3" ? "#a78bfa"
                                  : "#818cf8",
                                border: `1px solid ${edu.education_level === "SMA/SMK"
                                  ? "color-mix(in srgb, #fb923c 30%, transparent)"
                                  : "color-mix(in srgb, #818cf8 30%, transparent)"}`,
                                letterSpacing: "0.05em", flexShrink: 0,
                              }}>{edu.education_level}</span>
                            )}
                          </div>
                          <span className="edu-year-badge">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                            {edu.year_start} – {edu.year_end || "Sekarang"}
                          </span>
                        </div>
                        {/* Fakultas · Jurusan */}
                        {(edu.faculty || edu.major) && (
                          <p className="edu-major">
                            {edu.faculty && <>{edu.faculty}{edu.major ? " · " : ""}</>}{edu.major}
                          </p>
                        )}
                        {/* IPK / Nilai chip */}
                        {edu.gpa && (
                          <span className="edu-chip chip-gpa" style={{ alignSelf: "flex-start" }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {edu.education_level === "SMA/SMK" ? "Nilai" : "IPK"} {edu.gpa}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Thesis (hanya untuk jenjang universitas) ── */}
                    {edu.education_level !== "SMA/SMK" && edu.thesis_title && (
                      <div className="edu-thesis">
                        <span className="edu-thesis-label">
                          {edu.education_level === "S2" ? "Tesis"
                            : edu.education_level === "S3" ? "Disertasi"
                            : edu.education_level === "D3" ? "Proyek Akhir"
                            : "Skripsi / Tugas Akhir"}
                        </span>
                        <p className="edu-thesis-title">&ldquo;{edu.thesis_title}&rdquo;</p>

                        {edu.thesis_goal && !edu.thesis_output && !edu.thesis_impact && (
                          <p className="edu-thesis-goal">{edu.thesis_goal}</p>
                        )}

                        {(edu.thesis_output || edu.thesis_impact) && (
                          <div className="edu-thesis-boxes">
                            {edu.thesis_output && (
                              <div className="edu-tbox edu-tbox-output">
                                <div className="edu-tbox-head">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                                  </svg>
                                  Output
                                </div>
                                <div className="edu-tbox-body">{edu.thesis_output}</div>
                              </div>
                            )}
                            {edu.thesis_impact && (
                              <div className="edu-tbox edu-tbox-impact">
                                <div className="edu-tbox-head">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                                  </svg>
                                  Dampak
                                </div>
                                <div className="edu-tbox-body">{edu.thesis_impact}</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tombol CTA Akses Jurnal */}
                        {(edu.journal_pdf || edu.journal_url) && (() => {
                          const journalUrl = edu.journal_pdf ?? edu.journal_url!;
                          const journalLabel = edu.thesis_title ? `${edu.thesis_title.substring(0, 60)}${edu.thesis_title.length > 60 ? "…" : ""}` : "Preview Jurnal";
                          return (
                            <button
                              className="edu-journal-cta"
                              type="button"
                              data-journal-url={journalUrl}
                              data-journal-label={journalLabel}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                              Baca Jurnal
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            )) : about.studies.institutions.map((inst, i) => (
              <div key={i} className="edu-reveal-wrap">
                <ScrollReveal delay={i * 80}>
                  <div className="edu-card">
                    <div className="edu-strip" />
                    <div className="edu-header">
                      <div className="edu-logo-wrap">
                        <div className="edu-logo-ring" />
                        <div className="edu-logo">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        </div>
                      </div>
                      <div className="edu-name">
                        <div className="edu-name-top">
                          <p className="edu-univ">{inst.name}</p>
                        </div>
                        {inst.description && <p className="edu-major">{inst.description}</p>}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            ))}
          </div>

          {/* ══ KEAHLIAN ════════════════════════════════════════════ */}
          <ScrollReveal delay={120}>
            <div className="section-head">
              <div className="section-bar" style={{ height: 28, background: "#22d3ee", flexShrink: 0 }} />
              <div>
                <div className="section-eyebrow">Tech Stack</div>
                <Heading as="h2" id="keahlian" variant="display-strong-s">Keahlian</Heading>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={140}>
            <Column fillWidth marginBottom="48" gap="m">
              {skills.length > 0 ? (
                <SkillsGrid initialSkills={skills} />
              ) : (
                <Text variant="body-default-m" onBackground="neutral-weak">Belum ada keahlian yang ditambahkan.</Text>
              )}
            </Column>
          </ScrollReveal>

          {/* ══ ORGANISASI ══════════════════════════════════════════ */}
          {organizations.length > 0 && (
            <>
              <ScrollReveal delay={160}>
                <div className="section-head">
                  <div className="section-bar" style={{ height: 28, background: "#a78bfa", flexShrink: 0 }} />
                  <div>
                    <div className="section-eyebrow">Aktivitas</div>
                    <Heading as="h2" id="organisasi" variant="display-strong-s">Organisasi</Heading>
                  </div>
                </div>
              </ScrollReveal>
              <Column fillWidth gap="m" marginBottom="48">
                {organizations.map((org, i) => (
                  <ScrollReveal key={org.id} delay={i * 55}>
                    <div className="org-card">
                      <div className="org-logo">
                        {org.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={org.logo} alt={org.name} />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        )}
                      </div>
                      <div className="org-info">
                        <p className="org-name">{org.name}</p>
                        <p className="org-role">{org.role_id}</p>
                      </div>
                      <span className="org-year-badge">{org.year}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </Column>
            </>
          )}

          {/* ══ SERTIFIKAT ══════════════════════════════════════════ */}
          {certificates.length > 0 && (
            <>
              <ScrollReveal delay={180}>
                <div className="section-head">
                  <div className="section-bar" style={{ height: 28, background: "#f59e0b", flexShrink: 0 }} />
                  <div>
                    <div className="section-eyebrow">Pencapaian</div>
                    <Heading as="h2" id="sertifikat" variant="display-strong-s">Sertifikat</Heading>
                  </div>
                </div>
              </ScrollReveal>
              <div className="cert-grid" style={{ marginBottom: 48 }}>
                {certificates.map((cert, i) => (
                  <ScrollReveal key={cert.id} delay={i * 35}>
                    <a href={`/certificate/${cert.id}`} className="cert-card">
                      {cert.thumbnail ? (
                        <div className="cert-thumb-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cert.thumbnail} alt={cert.title_id} className="cert-thumb" />
                        </div>
                      ) : (
                        <div className="cert-nothumb">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="5"/><path d="M9 21v-4l3 1 3-1v4"/>
                            <path d="M6 13.18A7 7 0 0 0 5 17v4"/><path d="M18 13.18A7 7 0 0 1 19 17v4"/>
                          </svg>
                        </div>
                      )}
                      <div className="cert-body">
                        <div className="cert-issuer">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {cert.issuer}
                        </div>
                        <p className="cert-title">{cert.title_id}</p>
                        <div className="cert-date">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                          {safeDate(cert.issue_date, "MMMM yyyy")}
                        </div>
                      </div>
                    </a>
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}

        </Column>
      </div>

      {/* ── Modal onclick handler via script ─────────────────────── */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          // Attach onclick to all CTA buttons after hydration
          function attachJournalBtns() {
            var btns = document.querySelectorAll('[data-journal-url]');
            btns.forEach(function(btn) {
              btn.onclick = function(e) {
                e.preventDefault();
                var url = btn.getAttribute('data-journal-url');
                var label = btn.getAttribute('data-journal-label');
                if (window.__openJournalModal) window.__openJournalModal(url, label);
              };
            });
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachJournalBtns);
          } else {
            attachJournalBtns();
          }
        })();
      ` }} />
    </Column>
  );
}
