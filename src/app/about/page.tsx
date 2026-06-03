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
import { ScrollReveal } from "@/components/ScrollReveal";
import { AvatarFromCms } from "@/components/about/AvatarFromCms";
import { SkillsMarquee } from "@/components/about/SkillsMarquee";

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
    { title: about.intro.title,     display: about.intro.display,     items: [] },
    { title: about.work.title,      display: true,                     items: [] },
    { title: about.studies.title,   display: true,                     items: [] },
    { title: "Keahlian",            display: true,                     items: [] },
    { title: "Organisasi",          display: organizations.length > 0, items: [] },
    { title: "Sertifikat",          display: certificates.length > 0,  items: [] },
  ];

  return (
    <Column maxWidth="m">
      <Schema as="webPage" baseURL={baseURL} title={about.title} description={about.description}
        path={about.path} image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: `${baseURL}${person.avatar}` }} />

      {about.tableOfContent.display && (
        <Column left="0" style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed" paddingLeft="24" gap="32" s={{ hide: true }}>
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}

      <Row fillWidth s={{ direction: "column" }} horizontal="center">

        {/* ── Avatar Sidebar ──────────────────────────────────────────── */}
        {about.avatar.display && (
          <Column className={styles.avatar} top="64" fitHeight position="sticky"
            s={{ position: "relative", style: { top: "auto" } }}
            xs={{ style: { top: "auto" } }}
            minWidth="160" paddingX="l" paddingBottom="xl" gap="m" flex={3} horizontal="center">
            <ScrollReveal type="scale">
              <AvatarFromCms />
            </ScrollReveal>
            <Row gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              <Text variant="body-default-s">{person.location}</Text>
            </Row>
            {person.languages && person.languages.length > 0 && (
              <Row wrap gap="8">
                {person.languages.map((lang, i) => <Tag key={i} size="l">{lang}</Tag>)}
              </Row>
            )}
          </Column>
        )}

        <Column className={styles.blockAlign} flex={9} maxWidth={40}>

          {/* ── Nama + Social ───────────────────────────────────────── */}
          <ScrollReveal>
            <Column id={about.intro.title} fillWidth minHeight="160" vertical="center" marginBottom="32">
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
              <Heading as="h2" id={about.work.title} variant="display-strong-s">
                {about.work.title}
              </Heading>
            </Row>
          </ScrollReveal>

          <Column fillWidth gap="0" marginBottom="48" style={{ position: "relative" }}>
            {/* Vertical timeline line */}
            <div style={{
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
                    <div style={{ position: "relative", flexShrink: 0, paddingTop: 4 }}>
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
              PENDIDIKAN — Card dengan glow + logo animasi
          ══════════════════════════════════════════════════════════ */}
          <ScrollReveal delay={120}>
            <Row fillWidth vertical="center" gap="m" marginBottom="l">
              <div style={{ width: 4, height: 28, borderRadius: 2, background: "var(--accent-background-strong)", flexShrink: 0 }} />
              <Heading as="h2" id={about.studies.title} variant="display-strong-s">
                {about.studies.title}
              </Heading>
            </Row>
          </ScrollReveal>

          <Column fillWidth gap="l" marginBottom="48">
            {educations.length > 0 ? (
              educations.map((edu, i) => (
                <ScrollReveal key={edu.id} delay={i * 80}>
                  <div style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid var(--neutral-alpha-weak)",
                    background: "var(--neutral-background-medium)",
                    position: "relative",
                  }}>
                    {/* Thin gradient accent line */}
                    <div style={{
                      height: 3,
                      background: "linear-gradient(90deg, var(--brand-background-strong), var(--accent-background-strong), transparent)",
                    }} />

                    <div style={{ padding: "24px 28px" }}>
                      {/* Header row: logo + name + badges */}
                      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        {/* Logo — adaptive border-radius: round if circle logo, square if rect */}
                        <div className="university-logo-wrap" style={{
                          width: 72, height: 72,
                          borderRadius: edu.logo ? "50%" : "16px",
                        }}>
                          {edu.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={edu.logo} alt={edu.university_name}
                              className="university-logo"
                              style={{ width: 72, height: 72, borderRadius: "50%" }} />
                          ) : (
                            <div className="university-logo-placeholder" style={{
                              width: 72, height: 72, borderRadius: 16,
                            }}>
                              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Name + meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ marginBottom: 8 }}>
                            <Text variant="heading-strong-l" style={{ lineHeight: 1.2 }}>
                              {edu.university_name}
                            </Text>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, letterSpacing: "0.04em",
                              background: "var(--brand-alpha-weak)", color: "var(--brand-on-background-strong)",
                              border: "1px solid var(--brand-alpha-medium)",
                            }}>{edu.degree}</span>
                            <span style={{
                              fontSize: 11, padding: "2px 10px", borderRadius: 99,
                              background: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)",
                            }}>{edu.year_start} – {edu.year_end || "Sekarang"}</span>
                            {edu.gpa && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
                                background: "var(--accent-alpha-weak)", color: "var(--accent-on-background-strong)",
                                border: "1px solid var(--accent-alpha-medium)",
                              }}>IPK {edu.gpa}</span>
                            )}
                          </div>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            {edu.faculty && <>{edu.faculty} · </>}{edu.major}
                          </Text>
                        </div>
                      </div>

                      {/* Detail rows */}
                      {(edu.field_of_study || edu.thesis_title) && (
                        <div style={{
                          marginTop: 20, paddingTop: 20,
                          borderTop: "1px solid var(--neutral-alpha-weak)",
                          display: "flex", flexDirection: "column", gap: 12,
                        }}>
                          {edu.field_of_study && (
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{
                                flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                                background: "var(--neutral-alpha-weak)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--neutral-on-background-weak)",
                              }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                                </svg>
                              </div>
                              <div>
                                <Text variant="label-default-xs" onBackground="neutral-weak" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  Rumpun Ilmu
                                </Text>
                                <Text variant="body-default-m">{edu.field_of_study}</Text>
                              </div>
                            </div>
                          )}

                          {edu.thesis_title && (
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{
                                flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                                background: "var(--neutral-alpha-weak)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--neutral-on-background-weak)",
                              }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text variant="label-default-xs" onBackground="neutral-weak" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  Skripsi
                                </Text>
                                <Text variant="body-default-m" style={{ fontStyle: "italic", lineHeight: 1.5 }}>
                                  &ldquo;{edu.thesis_title}&rdquo;
                                </Text>
                                {edu.thesis_goal && (
                                  <Text variant="body-default-s" onBackground="neutral-weak" style={{ marginTop: 4, lineHeight: 1.5 }}>
                                    {edu.thesis_goal}
                                  </Text>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))
            ) : (
              about.studies.institutions.map((inst, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div style={{
                    borderRadius: 16, overflow: "hidden",
                    border: "1px solid var(--neutral-alpha-weak)",
                    background: "var(--neutral-background-medium)",
                  }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg, var(--brand-background-strong), var(--accent-background-strong))" }} />
                    <div style={{ padding: 24 }}>
                      <Row gap="12" vertical="center">
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--brand-alpha-weak)",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-on-background-medium)" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        </div>
                        <Column gap="4">
                          <Text variant="heading-strong-l">{inst.name}</Text>
                          <Text variant="body-default-m" onBackground="neutral-weak">{inst.description}</Text>
                        </Column>
                      </Row>
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
                <SkillsMarquee initialSkills={skills} />
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
                  <Heading as="h2" id="certificates" variant="display-strong-s">Sertifikat</Heading>
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
                      <div style={{
                        borderRadius: 12, overflow: "hidden",
                        border: "1px solid var(--neutral-alpha-weak)",
                        background: "var(--neutral-background-medium)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,158,11,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
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
                            {format(new Date(cert.issue_date), "MMMM yyyy")}
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
      </Row>
    </Column>
  );
}
