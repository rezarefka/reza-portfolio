"use client";

import { useState } from "react";
import { Column, Row, Text } from "@once-ui-system/core";
import { person, social } from "@/resources";

import type { ReactNode } from "react";

// ── Minimal SVG icons ──────────────────────────────────────────────────────
const icons: Record<string, ReactNode> = {
  email: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  github: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  ),
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
};

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.preventDefault(); e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500,
        background: ok ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
        color: ok ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
        border: "1px solid transparent",
        cursor: "pointer", transition: "all 0.18s ease",
      }}
    >
      {ok ? "✓ Tersalin" : "Salin"}
    </button>
  );
}

export function ContactSection() {
  // Build items
  const items = [
    { label: "Email", href: `mailto:${person.email}`, value: person.email, icon: icons.email, copy: true },
    ...social.filter((s) => s.link).map((s) => ({
      label: s.name,
      href: s.link,
      value: s.link.replace("https://", ""),
      icon: icons[s.icon] ?? icons.github,
      copy: false,
    })),
  ];

  // Deduplicate
  const seen = new Set<string>();
  const deduped = items.filter((it) => {
    if (seen.has(it.label)) return false;
    seen.add(it.label); return true;
  });

  return (
    <Column fillWidth gap="xl" paddingY="64" horizontal="center" align="center">
      <style>{`
        @keyframes contactPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        .contact-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; border-radius: 12px;
          text-decoration: none;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          color: var(--neutral-on-background-strong);
          font-size: 14px; font-weight: 500;
          transition: border-color 0.18s, background 0.18s, transform 0.18s;
          white-space: nowrap;
        }
        .contact-link:hover {
          border-color: var(--neutral-alpha-medium);
          background: var(--neutral-alpha-weak);
          transform: translateY(-1px);
        }
        .contact-email-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 14px;
          text-decoration: none;
          background: var(--brand-background-strong);
          color: var(--brand-on-background-strong);
          font-size: 15px; font-weight: 600;
          transition: opacity 0.18s, transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 2px 16px var(--brand-alpha-medium);
        }
        .contact-email-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px var(--brand-alpha-medium);
        }
      `}</style>

      {/* Availability dot + label */}
      <Row gap="8" vertical="center">
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--brand-background-strong)",
          animation: "contactPulse 2.4s ease-in-out infinite",
          display: "inline-block",
        }} />
        <Text variant="label-default-xs" onBackground="neutral-weak"
          style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Tersedia untuk kolaborasi
        </Text>
      </Row>

      {/* Heading */}
      <Column gap="8" horizontal="center" align="center">
        <Text variant="display-strong-m" style={{ textAlign: "center" }}>
          Mari terhubung
        </Text>
        <Text variant="body-default-m" onBackground="neutral-weak"
          style={{ textAlign: "center", maxWidth: 380, lineHeight: 1.6 }}>
          Terbuka untuk diskusi, kolaborasi, atau sekadar sapa.
        </Text>
      </Column>

      {/* Primary CTA */}
      <Row gap="12" vertical="center" wrap horizontal="center">
        <a href={`mailto:${person.email}`} className="contact-email-btn">
          {icons.email}
          {person.email}
        </a>
        <CopyBtn text={person.email} />
      </Row>

      {/* Social links — minimal row */}
      <Row gap="8" wrap horizontal="center">
        {deduped
          .filter((it) => it.label !== "Email")
          .map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
      </Row>

      {/* Tagline */}
      <Text variant="body-default-xs" onBackground="neutral-weak">
        Makassar, Indonesia · Remote friendly
      </Text>
    </Column>
  );
}
