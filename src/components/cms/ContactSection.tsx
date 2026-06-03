"use client";

import { useState } from "react";
import { Column, Row, Text, Heading } from "@once-ui-system/core";
import { person, social } from "@/resources";

// ── Icons ──────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>
);

// Social icons map
const ICONS: Record<string, React.ReactNode> = {
  email: <EmailIcon />,
  github: <GitHubIcon />,
  linkedin: <LinkedInIcon />,
  instagram: <InstagramIcon />,
  whatsapp: <WhatsAppIcon />,
};

interface ContactItem {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  accent: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy(); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
        background: copied ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
        color: copied ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
        border: `1px solid ${copied ? "var(--brand-alpha-medium)" : "var(--neutral-alpha-weak)"}`,
        cursor: "pointer", transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Tersalin
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Salin
        </>
      )}
    </button>
  );
}

export function ContactSection() {
  // Build contact items from resources
  const contactItems: ContactItem[] = [
    {
      label: "Email",
      value: person.email,
      href: `mailto:${person.email}`,
      icon: <EmailIcon />,
      description: "Hubungi langsung via email",
      accent: "var(--brand-background-strong)",
    },
    ...social
      .filter((s) => s.link)
      .map((s) => ({
        label: s.name,
        value: s.link.replace("https://", "").replace("mailto:", ""),
        href: s.link,
        icon: ICONS[s.icon] ?? <ArrowIcon />,
        description:
          s.name === "GitHub" ? "Lihat kode & proyek saya" :
          s.name === "LinkedIn" ? "Koneksi profesional" :
          s.name === "Instagram" ? "Ikuti perjalanan saya" :
          "Terhubung dengan saya",
        accent:
          s.name === "GitHub" ? "var(--neutral-on-background-strong)" :
          s.name === "LinkedIn" ? "#0077b5" :
          s.name === "Instagram" ? "#e1306c" :
          "var(--brand-background-strong)",
      })),
  ];

  // Deduplicate by label (email might appear twice)
  const seen = new Set<string>();
  const deduped = contactItems.filter((c) => {
    if (seen.has(c.label)) return false;
    seen.add(c.label);
    return true;
  });

  return (
    <Column
      fillWidth
      gap="xl"
      paddingY="64"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Background accent */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% 100%, var(--brand-alpha-weak), transparent)",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Header */}
        <Column gap="12" horizontal="center" align="center" style={{ marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 99,
            background: "var(--brand-alpha-weak)",
            border: "1px solid var(--brand-alpha-medium)",
            marginBottom: 4,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-background-strong)",
              boxShadow: "0 0 8px var(--brand-background-strong)", animation: "contactPulseRing 2.4s ease-in-out infinite" }} />
            <Text variant="label-strong-xs" style={{
              color: "var(--brand-on-background-strong)",
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              Tersedia untuk kolaborasi
            </Text>
          </div>

          <Heading as="h2" variant="display-strong-m" style={{ textAlign: "center", lineHeight: 1.15 }}>
            Mari Berkolaborasi
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak"
            style={{ textAlign: "center", maxWidth: 480, lineHeight: 1.6 }}>
            Punya proyek menarik? Ide yang ingin diwujudkan? Atau sekadar ingin terhubung —
            saya terbuka untuk diskusi.
          </Text>
        </Column>

        {/* Primary CTA — Email card */}
        <a href={`mailto:${person.email}`} style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
          <div
            className="contact-item-hover"
            style={{
              position: "relative", overflow: "hidden",
              borderRadius: 20,
              border: "1px solid var(--brand-alpha-medium)",
              background: "linear-gradient(135deg, var(--brand-alpha-weak) 0%, var(--neutral-background-medium) 100%)",
              padding: "28px 32px",
            }}
          >
            {/* Beam effect */}
            <div className="contact-card-beam" />

            <Row fillWidth horizontal="between" vertical="center" wrap gap="16" style={{ position: "relative", zIndex: 1 }}>
              <Row gap="16" vertical="center">
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "var(--brand-background-strong)",
                  color: "var(--brand-on-background-strong)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px var(--brand-alpha-medium)",
                  flexShrink: 0,
                }}>
                  <EmailIcon />
                </div>
                <Column gap="4">
                  <Text variant="label-strong-xs" style={{
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "var(--brand-on-background-weak)",
                  }}>
                    Email Langsung
                  </Text>
                  <Text variant="heading-strong-l">{person.email}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Respon dalam 24 jam kerja
                  </Text>
                </Column>
              </Row>
              <Row gap="8" vertical="center" wrap>
                <CopyButton text={person.email} />
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px", borderRadius: 10,
                  background: "var(--brand-background-strong)",
                  color: "var(--brand-on-background-strong)",
                  fontSize: 14, fontWeight: 600,
                }}>
                  Kirim Pesan
                  <ArrowIcon />
                </div>
              </Row>
            </Row>
          </div>
        </a>

        {/* Social grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 4,
        }}>
          {deduped
            .filter((c) => c.label !== "Email")
            .map((item) => (
              <a key={item.label} href={item.href}
                target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none" }}>
                <div
                  className="contact-item-hover"
                  style={{
                    position: "relative", overflow: "hidden",
                    borderRadius: 16,
                    border: "1px solid var(--neutral-alpha-weak)",
                    background: "var(--neutral-background-medium)",
                    padding: "18px 20px",
                  }}
                >
                  <div className="contact-card-beam" />
                  <Column gap="12" style={{ position: "relative", zIndex: 1 }}>
                    <Row horizontal="between" vertical="center">
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: "var(--neutral-alpha-weak)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--neutral-on-background-strong)",
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ color: "var(--neutral-on-background-weak)" }}>
                        <ArrowIcon />
                      </div>
                    </Row>
                    <Column gap="2">
                      <Text variant="heading-strong-s">{item.label}</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak"
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.description}
                      </Text>
                    </Column>
                  </Column>
                </div>
              </a>
            ))}
        </div>

        {/* Bottom tagline */}
        <Column horizontal="center" align="center" gap="8" style={{ marginTop: 40 }}>
          <div style={{ width: 40, height: 1, background: "var(--neutral-alpha-medium)" }} />
          <Text variant="body-default-s" onBackground="neutral-weak" style={{ textAlign: "center" }}>
            Berbasis di Makassar, Indonesia · Terbuka untuk remote collaboration
          </Text>
        </Column>
      </div>
    </Column>
  );
}
