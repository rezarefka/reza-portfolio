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
import { EduJournalModal } from "@/components/about/EduJournalModal";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

/** Parse deskripsi: jika mengandung baris bullet (- / • / *), render sebagai <ul><li>.
 *  Jika tidak, render sebagai <p> biasa dengan justify. */
function renderDescription(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const bulletLines = lines.filter(l => /^[-•*]\s/.test(l));

  if (bulletLines.length > 0) {
    // Mode campuran: ada baris biasa (intro) + bullet
    const introLines: string[] = [];
    const listItems: string[] = [];
    let inList = false;

    for (const line of lines) {
      if (/^[-•*]\s/.test(line)) {
        inList = true;
        listItems.push(line.replace(/^[-•*]\s+/, ""));
      } else if (!inList) {
        introLines.push(line);
      }
    }

    return (
      <>
        {introLines.length > 0 && (
          <p className="tl-desc" style={{ marginBottom: listItems.length ? 10 : 0 }}>
            {introLines.join(" ")}
          </p>
        )}
        {listItems.length > 0 && (
          <ul className="tl-desc-list">
            {listItems.map((item, idx) => (
              <li key={idx}>
                <span className="tl-desc-bullet" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  // Plain text — justify
  return <p className="tl-desc">{text}</p>;
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
        }
        @media (max-width: 768px) {
          .about-wrap { flex-direction: column; align-items: center; }
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
          padding-bottom: 28px;
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
          margin-top: 6px;
        }
        .tl-content { flex: 1; min-width: 0; }

        /* ══ Experience card ══════════════════════════════════════ */
        .tl-card {
          background: var(--neutral-background-medium);
          border: 1px solid var(--neutral-alpha-weak);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .tl-card:hover {
          border-color: var(--brand-alpha-weak);
          box-shadow: 0 6px 24px color-mix(in srgb, var(--brand-background-strong) 8%, transparent);
          transform: translateY(-2px);
        }
        .tl-card-strip {
          height: 3px;
          background: linear-gradient(90deg, var(--brand-background-strong) 0%, var(--accent-background-strong) 100%);
        }
        .tl-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px 14px;
        }
        .tl-company {
          font-size: 15px;
          font-weight: 700;
          color: var(--neutral-on-background-strong);
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .tl-role {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-on-background-medium);
          background: color-mix(in srgb, var(--brand-background-strong) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--brand-background-strong) 20%, transparent);
          padding: 3px 10px;
          border-radius: 99px;
        }
        .tl-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          background: var(--neutral-alpha-weak);
          border: 1px solid var(--neutral-alpha-weak);
          font-size: 11px;
          color: var(--neutral-on-background-weak);
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tl-divider {
          height: 1px;
          background: var(--neutral-alpha-weak);
          margin: 0 18px;
        }
        .tl-card-body {
          padding: 14px 18px 16px;
        }
        .tl-desc {
          font-size: 13.5px;
          color: var(--neutral-on-background-weak);
          line-height: 1.7;
          margin: 0;
          text-align: justify;
          hyphens: auto;
          -webkit-hyphens: auto;
        }
        .tl-desc-list {
          margin: 0;
          padding-left: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tl-desc-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--neutral-on-background-weak);
          line-height: 1.65;
        }
        .tl-desc-bullet {
          flex-shrink: 0;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--brand-background-strong);
          margin-top: 7px;
        }
        @media (max-width: 480px) {
          .tl-line { display: none; }
          .tl-dot { display: none; }
          .tl-row { gap: 0; }
          .tl-card-header { flex-direction: column; gap: 8px; }
          .tl-badge { align-self: flex-start; }
        }

        /* ══ Education cards ══════════════════════════════════════ */
        .edu-card {
          border-radius: 14px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .edu-card:hover {
          border-color: var(--neutral-alpha-medium);
          box-shadow: 0 4px 24px color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
          transform: translateY(-2px);
        }
        .edu-strip {
          height: 3px;
          background: linear-gradient(90deg, var(--brand-background-strong) 0%, var(--accent-background-strong) 100%);
        }
        .edu-body { padding: 20px 20px 0; }
        .edu-identity { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
        .edu-logo {
          flex-shrink: 0;
          width: 52px; height: 52px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
          border: 1.5px solid color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent);
          display: flex; align-items: center; justify-content: center;
        }
        .edu-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; padding: 5px; display: block; }
        .edu-name { flex: 1; min-width: 0; }
        .edu-univ { font-size: 15px; font-weight: 700; line-height: 1.3; color: var(--neutral-on-background-strong); margin: 0 0 3px; word-break: break-word; }
        .edu-major { font-size: 12px; color: var(--neutral-on-background-weak); line-height: 1.4; margin: 0; }
        .edu-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .edu-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; line-height: 1;
        }
        .chip-degree { background: var(--brand-alpha-weak); color: var(--brand-on-background-strong); border: 1px solid var(--brand-alpha-medium); }
        .chip-year { background: var(--neutral-alpha-weak); color: var(--neutral-on-background-weak); border: 1px solid var(--neutral-alpha-weak); }
        .chip-gpa { background: var(--accent-alpha-weak); color: var(--accent-on-background-strong); border: 1px solid var(--accent-alpha-medium); }
        .edu-details { border-top: 1px solid var(--neutral-alpha-weak); display: flex; flex-direction: column; }
        .edu-drow {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 20px; border-bottom: 1px solid var(--neutral-alpha-weak);
        }
        .edu-drow:last-child { border-bottom: none; }
        .edu-dicon {
          flex-shrink: 0; margin-top: 1px;
          width: 26px; height: 26px; border-radius: 7px;
          background: var(--neutral-alpha-weak);
          display: flex; align-items: center; justify-content: center;
          color: var(--neutral-on-background-weak);
        }
        .edu-dlabel { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--neutral-on-background-weak); display: block; margin-bottom: 3px; }
        .edu-dvalue { font-size: 13px; color: var(--neutral-on-background-strong); line-height: 1.55; }
        .edu-dvalue em { font-style: italic; }
        .edu-dgoal { font-size: 12px; color: var(--neutral-on-background-weak); margin-top: 4px; line-height: 1.5; }
        @media (max-width: 480px) {
          .edu-body { padding: 16px 16px 0; }
          .edu-logo { width: 44px; height: 44px; }
          .edu-univ { font-size: 13.5px; }
          .edu-drow { padding: 10px 16px; }
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
        /* Thumbnail menyesuaikan rasio asli gambar (portrait & landscape) */
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
      `}</style>

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

        <Column className={styles.blockAlign} flex={1} maxWidth={40}>

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
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        <path d="M2 12h20"/>
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="tl-content">
                      <div className="tl-card">
                        <div className="tl-card-strip" />
                        <div className="tl-card-header">
                          <div style={{ minWidth: 0 }}>
                            <p className="tl-company">
                              {isCms ? (exp as typeof experiences[0]).company : (exp as typeof about.work.experiences[0]).company}
                            </p>
                            <span className="tl-role">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>
                              </svg>
                              {isCms ? (exp as typeof experiences[0]).role_id : (exp as typeof about.work.experiences[0]).role}
                            </span>
                          </div>
                          <span className="tl-badge">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                            {isCms ? (exp as typeof experiences[0]).timeframe : (exp as typeof about.work.experiences[0]).timeframe}
                          </span>
                        </div>
                        {isCms && (exp as typeof experiences[0]).description_id && (
                          <>
                            <div className="tl-divider" />
                            <div className="tl-card-body">
                              {renderDescription((exp as typeof experiences[0]).description_id!)}
                            </div>
                          </>
                        )}
                      </div>
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

          <Column fillWidth gap="12" marginBottom="48">
            {educations.length > 0 ? educations.map((edu, i) => (
              <ScrollReveal key={edu.id} delay={i * 80}>
                <div className="edu-card">
                  <div className="edu-strip" />
                  <div className="edu-body">
                    <div className="edu-identity">
                      <div className="edu-logo">
                        {edu.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={edu.logo} alt={edu.university_name} />
                        ) : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        )}
                      </div>
                      <div className="edu-name">
                        <p className="edu-univ">{edu.university_name}</p>
                        {(edu.faculty || edu.major) && (
                          <p className="edu-major">
                            {edu.faculty && <>{edu.faculty}{edu.major ? " · " : ""}</>}{edu.major}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="edu-chips">
                      <span className="edu-chip chip-degree">{edu.degree}</span>
                      <span className="edu-chip chip-year">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {edu.year_start} – {edu.year_end || "Sekarang"}
                      </span>
                      {edu.gpa && (
                        <span className="edu-chip chip-gpa">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          IPK {edu.gpa}
                        </span>
                      )}
                    </div>
                  </div>
                  {(edu.field_of_study || edu.thesis_title) && (
                    <div className="edu-details">
                      {edu.field_of_study && (
                        <div className="edu-drow">
                          <div className="edu-dicon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
                          <div><span className="edu-dlabel">Rumpun Ilmu</span><div className="edu-dvalue">{edu.field_of_study}</div></div>
                        </div>
                      )}
                      {edu.thesis_title && (
                        <div className="edu-drow">
                          <div className="edu-dicon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="edu-dlabel">Skripsi / Tugas Akhir</span>
                            <div className="edu-dvalue"><em>&ldquo;{edu.thesis_title}&rdquo;</em></div>
                            {edu.thesis_goal && <div className="edu-dgoal">{edu.thesis_goal}</div>}
                            {(edu.journal_pdf || edu.journal_url) && (
                              <div style={{ marginTop: 10 }}>
                                <EduJournalModal title={edu.thesis_title} pdfUrl={edu.journal_pdf} externalUrl={edu.journal_url} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )) : about.studies.institutions.map((inst, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="edu-card">
                  <div className="edu-strip" />
                  <div className="edu-body">
                    <div className="edu-identity">
                      <div className="edu-logo">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                      </div>
                      <div className="edu-name">
                        <p className="edu-univ">{inst.name}</p>
                        {inst.description && <p className="edu-major">{inst.description}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </Column>

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
    </Column>
  );
}
