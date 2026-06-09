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
import { EduLogoImg } from "@/components/about/EduLogoImg";
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
      <style>{`
        @media (max-width: 768px) {
          .about-row-wrap {
            flex-direction: column !important;
            align-items: center !important;
          }
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

      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", width: "100%", gap: 0 }} className="about-row-wrap">

        {/* ── Avatar Sidebar ──────────────────────────────────────────── */}
        {about.avatar.display && (
          <div className={styles.avatar}>
            <ScrollReveal type="scale">
              <AvatarFromCms />
            </ScrollReveal>
          </div>
        )}

        <Column className={styles.blockAlign} flex={1} maxWidth={40}>

          {/* ── Nama + Social ───────────────────────────────────────── */}
          <ScrollReveal>
            <Column id="perkenalan" fillWidth minHeight="160" vertical="center" marginBottom="32">
              <Heading className={styles.textAlign} variant="display-strong-xl">{person.name}</Heading>
              <Text className={styles.textAlign} variant="display-default-xs" onBackground="neutral-weak">
                {person.role}
              </Text>
              {social.length > 0 && (
                <Row className={styles.blockAlign} paddingTop="20" paddingBottom="8"
                  gap="8" wrap horizontal="center" fitWidth data-border="rounded">
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
            </Column>
          </ScrollReveal>

          {/* ── Intro ──────────────────────────────────────────────── */}
          {about.intro.display && (
            <ScrollReveal delay={80}>
              <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
                {about.intro.description}
              </Column>
            </ScrollReveal>
          )}

          {/* ══════════════════════════════════════════════════════════
              PENGALAMAN KERJA — Timeline style
          ══════════════════════════════════════════════════════════ */}
          <ScrollReveal delay={100}>
            <Row fillWidth vertical="center" gap="m" marginBottom="l">
              <div style={{ width: 4, height: 28, borderRadius: 2, background: "var(--brand-background-strong)", flexShrink: 0 }} />
              <Heading as="h2" id="pengalaman-kerja" variant="display-strong-s">
                {about.work.title}
              </Heading>
            </Row>
          </ScrollReveal>

          <style>{`
            @media (max-width: 480px) {
              .timeline-dot-wrap { display: none !important; }
              .timeline-line { display: none !important; }
            }
          `}</style>
          <Column fillWidth gap="0" marginBottom="48" style={{ position: "relative" }}>
            {/* Vertical timeline line */}
            <div className="timeline-line" style={{
              position: "absolute", left: 19, top: 8, bottom: 8, width: 2,
              background: "linear-gradient(to bottom, var(--brand-alpha-medium), var(--neutral-alpha-weak))",
              borderRadius: 2,
            }} />

            {(experiences.length > 0 ? experiences : about.work.experiences).map((exp, i) => {
              const isCms = experiences.length > 0;
              return (
                <ScrollReveal key={isCms ? (exp as typeof experiences[0]).id : i} delay={i * 80}>
                  <Row fillWidth gap="l" paddingBottom="32">
                    {/* Timeline dot */}
                    <div className="timeline-dot-wrap" style={{ position: "relative", flexShrink: 0, paddingTop: 4 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: i === 0 ? "var(--brand-background-strong)" : "var(--neutral-background-strong)",
                        border: `2px solid ${i === 0 ? "var(--brand-background-strong)" : "var(--neutral-alpha-medium)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 1, position: "relative",
                        boxShadow: i === 0 ? "0 0 12px var(--brand-alpha-medium)" : "none",
                        color: i === 0 ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
                      }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2"/>
                          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                          <path d="M2 12h20"/>
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <Column flex={1} gap="8" paddingTop="4">
                      <Row fillWidth horizontal="between" vertical="start" wrap gap="8">
                        <Text variant="heading-strong-l">
                          {isCms ? (exp as typeof experiences[0]).company : (exp as typeof about.work.experiences[0]).company}
                        </Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak"
                          style={{ background: "var(--neutral-alpha-weak)", padding: "3px 10px", borderRadius: 99, flexShrink: 0 }}>
                          {isCms ? (exp as typeof experiences[0]).timeframe : (exp as typeof about.work.experiences[0]).timeframe}
                        </Text>
                      </Row>
                      <Text variant="body-default-s" onBackground="brand-weak">
                        {isCms ? (exp as typeof experiences[0]).role_id : (exp as typeof about.work.experiences[0]).role}
                      </Text>
                      {isCms
                        ? (exp as typeof experiences[0]).description_id && (
                            <Text variant="body-default-m" onBackground="neutral-weak">
                              {(exp as typeof experiences[0]).description_id}
                            </Text>
                          )
                        : (exp as typeof about.work.experiences[0]).achievements?.map((a: React.ReactNode, j: number) => (
                            <Text as="li" variant="body-default-m" key={j} style={{ listStyle: "none", paddingLeft: 12, borderLeft: "2px solid var(--neutral-alpha-weak)" }}>
                              {a}
                            </Text>
                          ))
                      }
                    </Column>
                  </Row>
                </ScrollReveal>
              );
            })}
          </Column>

          {/* ══════════════════════════════════════════════════════════
              PENDIDIKAN — Redesigned: clean structured elegant card
          ══════════════════════════════════════════════════════════ */}
          <ScrollReveal delay={120}>
            <Row fillWidth vertical="center" gap="m" marginBottom="l">
              <div style={{ width: 4, height: 28, borderRadius: 2, background: "var(--accent-background-strong)", flexShrink: 0 }} />
              <Heading as="h2" id="pendidikan" variant="display-strong-s">
                {about.studies.title}
              </Heading>
            </Row>
          </ScrollReveal>

          <Column fillWidth gap="16" marginBottom="48">
            <style>{`
              /* ── Education Card ─────────────────────────────────────── */
              .edu2-card {
                border-radius: 16px;
                border: 1px solid var(--neutral-alpha-weak);
                background: var(--neutral-background-medium);
                overflow: hidden;
                transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
              }
              .edu2-card:hover {
                border-color: var(--neutral-alpha-medium);
                box-shadow: 0 6px 28px color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
                transform: translateY(-2px);
              }

              /* ── Header row inside card ─────────────────────────────── */
              .edu2-header {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px 24px 16px;
                flex-wrap: nowrap;
              }
              .edu2-logo-wrap {
                flex-shrink: 0;
                width: 56px; height: 56px;
                border-radius: 14px;
                overflow: hidden;
                background: color-mix(in srgb, var(--neutral-on-background-strong) 5%, transparent);
                border: 1px solid color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent);
                display: flex; align-items: center; justify-content: center;
              }
              .edu2-logo-wrap img {
                width: 100%; height: 100%;
                object-fit: contain;
                padding: 7px;
              }
              .edu2-title-block {
                flex: 1;
                min-width: 0;
              }
              .edu2-univ-name {
                font-weight: 700;
                font-size: 15px;
                line-height: 1.25;
                color: var(--neutral-on-background-strong);
                word-break: break-word;
                margin-bottom: 6px;
              }
              .edu2-major-text {
                font-size: 12.5px;
                color: var(--neutral-on-background-weak);
                line-height: 1.4;
              }

              /* ── Badge row ──────────────────────────────────────────── */
              .edu2-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                padding: 0 24px 16px;
              }
              .edu2-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 11px;
                border-radius: 99px;
                font-size: 11.5px;
                font-weight: 600;
                letter-spacing: 0.02em;
                white-space: nowrap;
                line-height: 1;
              }
              .edu2-badge-degree {
                background: var(--brand-alpha-weak);
                color: var(--brand-on-background-strong);
                border: 1px solid var(--brand-alpha-medium);
              }
              .edu2-badge-year {
                background: var(--neutral-alpha-weak);
                color: var(--neutral-on-background-weak);
              }
              .edu2-badge-gpa {
                background: var(--accent-alpha-weak);
                color: var(--accent-on-background-strong);
                border: 1px solid var(--accent-alpha-medium);
              }

              /* ── Detail section ─────────────────────────────────────── */
              .edu2-details {
                border-top: 1px solid var(--neutral-alpha-weak);
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
              }
              .edu2-detail-item {
                padding: 14px 24px;
                display: flex;
                gap: 10px;
                align-items: flex-start;
              }
              .edu2-detail-item + .edu2-detail-item {
                border-left: 1px solid var(--neutral-alpha-weak);
              }
              .edu2-detail-full {
                grid-column: 1 / -1;
                padding: 14px 24px;
                display: flex;
                gap: 10px;
                align-items: flex-start;
              }
              .edu2-detail-full + .edu2-detail-full,
              .edu2-detail-full + .edu2-detail-item,
              .edu2-detail-item + .edu2-detail-full {
                border-top: 1px solid var(--neutral-alpha-weak);
              }
              .edu2-detail-icon {
                flex-shrink: 0;
                width: 28px; height: 28px;
                border-radius: 7px;
                background: var(--neutral-alpha-weak);
                display: flex; align-items: center; justify-content: center;
                color: var(--neutral-on-background-weak);
                margin-top: 1px;
              }
              .edu2-detail-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.09em;
                color: var(--neutral-on-background-weak);
                display: block;
                margin-bottom: 3px;
              }
              .edu2-detail-value {
                font-size: 13.5px;
                color: var(--neutral-on-background-strong);
                line-height: 1.55;
              }
              .edu2-detail-value em {
                font-style: italic;
                color: var(--neutral-on-background-strong);
              }
              .edu2-thesis-goal {
                font-size: 12.5px;
                color: var(--neutral-on-background-weak);
                margin-top: 5px;
                line-height: 1.55;
              }
              .edu2-journal-wrap {
                margin-top: 10px;
              }

              /* ── Responsive ─────────────────────────────────────────── */
              @media (max-width: 600px) {
                .edu2-header { padding: 16px 16px 12px; gap: 12px; }
                .edu2-badges { padding: 0 16px 14px; }
                .edu2-logo-wrap { width: 48px; height: 48px; border-radius: 11px; }
                .edu2-details { grid-template-columns: 1fr; }
                .edu2-detail-item + .edu2-detail-item { border-left: none; border-top: 1px solid var(--neutral-alpha-weak); }
                .edu2-detail-item, .edu2-detail-full { padding: 12px 16px; }
                .edu2-univ-name { font-size: 14px; }
              }
            `}</style>

            {educations.length > 0 ? (
              educations.map((edu, i) => (
                <ScrollReveal key={edu.id} delay={i * 80}>
                  <div className="edu2-card">

                    {/* ── Header: Logo + Nama + Jurusan ── */}
                    <div className="edu2-header">
                      {/* Logo */}
                      {edu.logo ? (
                        <div className="edu2-logo-wrap" style={{ borderRadius: "50%" }}>
                          <EduLogoImg
                            src={edu.logo}
                            alt={edu.university_name}
                            shimmerDelay={((i % 4) + 1) as 1 | 2 | 3 | 4}
                          />
                        </div>
                      ) : (
                        <div className="edu2-logo-wrap">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        </div>
                      )}

                      {/* Nama universitas + jurusan */}
                      <div className="edu2-title-block">
                        <div className="edu2-univ-name">{edu.university_name}</div>
                        {(edu.faculty || edu.major) && (
                          <div className="edu2-major-text">
                            {edu.faculty && <>{edu.faculty}{edu.major ? " · " : ""}</>}{edu.major}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Badges: Degree · Tahun · IPK ── */}
                    <div className="edu2-badges">
                      <span className="edu2-badge edu2-badge-degree">{edu.degree}</span>
                      <span className="edu2-badge edu2-badge-year">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                        </svg>
                        {edu.year_start} – {edu.year_end || "Sekarang"}
                      </span>
                      {edu.gpa && (
                        <span className="edu2-badge edu2-badge-gpa">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          IPK {edu.gpa}
                        </span>
                      )}
                    </div>

                    {/* ── Detail rows ── */}
                    {(edu.field_of_study || edu.thesis_title) && (
                      <div className="edu2-details">

                        {/* Rumpun Ilmu — jika ada, full width jika hanya itu, atau setengah jika ada thesis juga */}
                        {edu.field_of_study && !edu.thesis_title && (
                          <div className="edu2-detail-full">
                            <div className="edu2-detail-icon">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <path d="M8 21h8M12 17v4"/>
                              </svg>
                            </div>
                            <div>
                              <span className="edu2-detail-label">Rumpun Ilmu</span>
                              <div className="edu2-detail-value">{edu.field_of_study}</div>
                            </div>
                          </div>
                        )}

                        {edu.field_of_study && edu.thesis_title && (
                          <div className="edu2-detail-item">
                            <div className="edu2-detail-icon">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <path d="M8 21h8M12 17v4"/>
                              </svg>
                            </div>
                            <div>
                              <span className="edu2-detail-label">Rumpun Ilmu</span>
                              <div className="edu2-detail-value">{edu.field_of_study}</div>
                            </div>
                          </div>
                        )}

                        {/* Skripsi / Tugas Akhir */}
                        {edu.thesis_title && (
                          <div className={edu.field_of_study ? "edu2-detail-item" : "edu2-detail-full"}>
                            <div className="edu2-detail-icon" style={{ marginTop: 1 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="edu2-detail-label">Skripsi / Tugas Akhir</span>
                              <div className="edu2-detail-value">
                                <em>&ldquo;{edu.thesis_title}&rdquo;</em>
                              </div>
                              {edu.thesis_goal && (
                                <div className="edu2-thesis-goal">{edu.thesis_goal}</div>
                              )}
                              {(edu.journal_pdf || edu.journal_url) && (
                                <div className="edu2-journal-wrap">
                                  <EduJournalModal
                                    title={edu.thesis_title}
                                    pdfUrl={edu.journal_pdf}
                                    externalUrl={edu.journal_url}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))
            ) : (
              about.studies.institutions.map((inst, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="edu2-card">
                    <div className="edu2-header">
                      <div className="edu2-logo-wrap">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                      </div>
                      <div className="edu2-title-block">
                        <div className="edu2-univ-name">{inst.name}</div>
                        {inst.description && (
                          <div className="edu2-major-text">{inst.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))
            )}
          </Column>

          {/* ══════════════════════════════════════════════════════════
              KEAHLIAN — Marquee logo running horizontal
          ══════════════════════════════════════════════════════════ */}
          <ScrollReveal delay={140}>
            <Row fillWidth vertical="center" gap="m" marginBottom="l">
              <div style={{ width: 4, height: 28, borderRadius: 2, background: "#22d3ee", flexShrink: 0 }} />
              <Heading as="h2" id="keahlian" variant="display-strong-s">Keahlian</Heading>
            </Row>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <Column fillWidth marginBottom="48" gap="m">
              {skills.length > 0 ? (
                <SkillsGrid initialSkills={skills} />
              ) : (
                <Text variant="body-default-m" onBackground="neutral-weak">
                  Belum ada keahlian yang ditambahkan.
                </Text>
              )}
            </Column>
          </ScrollReveal>

          {/* ══════════════════════════════════════════════════════════
              ORGANISASI — Compact list dengan garis kiri warna
          ══════════════════════════════════════════════════════════ */}
          {organizations.length > 0 && (
            <>
              <ScrollReveal delay={180}>
                <Row fillWidth vertical="center" gap="m" marginBottom="l">
                  <div style={{ width: 4, height: 28, borderRadius: 2, background: "#a78bfa", flexShrink: 0 }} />
                  <Heading as="h2" id="organisasi" variant="display-strong-s">Organisasi</Heading>
                </Row>
              </ScrollReveal>
              <Column fillWidth gap="m" marginBottom="48">
                {organizations.map((org, i) => (
                  <ScrollReveal key={org.id} delay={i * 60}>
                    <Row fillWidth gap="m" padding="m"
                      style={{
                        borderRadius: 12,
                        border: "1px solid var(--neutral-alpha-weak)",
                        background: "var(--neutral-background-medium)",
                        borderLeft: "4px solid #a78bfa",
                      }}
                      vertical="center">
                      {org.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={org.logo} alt={org.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--neutral-alpha-weak)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          color: "var(--neutral-on-background-weak)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        </div>
                      )}
                      <Column flex={1} gap="4">
                        <Text variant="heading-strong-m">{org.name}</Text>
                        <Text variant="body-default-s" onBackground="brand-weak">{org.role_id}</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">{org.year}</Text>
                      </Column>
                    </Row>
                  </ScrollReveal>
                ))}
              </Column>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              SERTIFIKAT — Grid cards
          ══════════════════════════════════════════════════════════ */}
          {certificates.length > 0 && (
            <>
              <ScrollReveal delay={200}>
                <Row fillWidth vertical="center" gap="m" marginBottom="l">
                  <div style={{ width: 4, height: 28, borderRadius: 2, background: "#f59e0b", flexShrink: 0 }} />
                  <Heading as="h2" id="sertifikat" variant="display-strong-s">Sertifikat</Heading>
                </Row>
              </ScrollReveal>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
                marginBottom: 48,
              }}>
                {certificates.map((cert, i) => (
                  <ScrollReveal key={cert.id} delay={i * 40}>
                    <a href={`/certificate/${cert.id}`} style={{ textDecoration: "none", display: "block" }}>
                      <div className="cert-card" style={{
                        borderRadius: 12, overflow: "hidden",
                        border: "1px solid var(--neutral-alpha-weak)",
                        background: "var(--neutral-background-medium)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}>
                        {cert.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cert.thumbnail} alt={cert.title_id}
                            style={{ width: "100%", height: 120, objectFit: "cover" }} />
                        )}
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            {!cert.thumbnail && (
                              <div style={{ color: "var(--neutral-on-background-weak)", flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="5"/><path d="M9 21v-4l3 1 3-1v4"/>
                                  <path d="M6 13.18A7 7 0 0 0 5 17v4"/><path d="M18 13.18A7 7 0 0 1 19 17v4"/>
                                </svg>
                              </div>
                            )}
                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--neutral-on-background-strong)" }}>
                              {cert.title_id}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--brand-on-background-weak)" }}>
                            {cert.issuer}
                          </span>
                          <div style={{ marginTop: 4, fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
                            {safeDate(cert.issue_date, "MMMM yyyy")}
                          </div>
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
