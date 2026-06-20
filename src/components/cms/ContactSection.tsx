"use client";

import { useState } from "react";
import { Column, Row, Text, RevealFx } from "@once-ui-system/core";
import type { SiteSettings } from "@/lib/types";
import type { ReactNode } from "react";
import { useLang } from "@/lib/lang-context";

// ── Icons ──────────────────────────────────────────────────────────────────────
const icons: Record<string, ReactNode> = {
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  message: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

interface ContactSectionProps {
  settings?: SiteSettings | null;
}

type FormState = "idle" | "sending" | "sent" | "error";

export function ContactSection({ settings }: ContactSectionProps) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const recipientEmail = settings?.social_email || "";

  const handleSubmit = async () => {
    if (!name || !senderEmail || !message) return;
    setFormState("sending");

    const body = `${t("Nama", "Name")}: ${name}\nEmail: ${senderEmail}\n\n${message}`;
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject || t("Pesan dari Portfolio", "Message from Portfolio"))}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    setTimeout(() => setFormState("sent"), 800);
    setTimeout(() => setFormState("idle"), 3500);
  };

  const socialLinks = [
    settings?.social_github   && { label: "GitHub",    href: settings.social_github,    icon: icons.github },
    settings?.social_linkedin && { label: "LinkedIn",  href: settings.social_linkedin,  icon: icons.linkedin },
    settings?.social_instagram&& { label: "Instagram", href: settings.social_instagram, icon: icons.instagram },
  ].filter(Boolean) as { label: string; href: string; icon: ReactNode }[];

  return (
    <RevealFx translateY="12" delay={0.1} fillWidth>
      <style>{`
        @keyframes contactPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
        .cf-input{
          width:100%;padding:11px 14px;border-radius:10px;font-size:14px;
          background:var(--neutral-background-medium);
          border:1px solid var(--neutral-alpha-weak);
          color:var(--neutral-on-background-strong);
          outline:none;transition:border-color .18s,box-shadow .18s;
          font-family:inherit;
          box-sizing: border-box;
        }
        .cf-input:focus{border-color:var(--brand-alpha-medium);box-shadow:0 0 0 3px var(--brand-alpha-weak);}
        .cf-input::placeholder{color:var(--neutral-on-background-weak);}
        .cf-textarea{resize:vertical;min-height:120px;}
        .cf-submit{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          padding:13px 28px;border-radius:12px;
          font-size:15px;font-weight:600;cursor:pointer;
          background:var(--brand-background-strong);
          color:var(--brand-on-background-strong);
          border:none;transition:opacity .18s,transform .18s,box-shadow .18s;
          box-shadow:0 2px 16px var(--brand-alpha-medium);
          white-space: nowrap;
        }
        .cf-submit:hover:not(:disabled){opacity:.88;transform:translateY(-1px);box-shadow:0 6px 24px var(--brand-alpha-medium);}
        .cf-submit:disabled{opacity:.55;cursor:not-allowed;}
        .cf-social-link{
          display:inline-flex;align-items:center;gap:8px;
          padding:9px 16px;border-radius:10px;
          text-decoration:none;font-size:13px;font-weight:500;
          border:1px solid var(--neutral-alpha-weak);
          background:var(--neutral-background-medium);
          color:var(--neutral-on-background-strong);
          transition:border-color .18s,background .18s,transform .18s;
          white-space: nowrap;
        }
        .cf-social-link:hover{border-color:var(--neutral-alpha-medium);background:var(--neutral-alpha-weak);transform:translateY(-1px);}
        .cf-label{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--neutral-on-background-weak);margin-bottom:6px;}

        /* submit row — stack on mobile */
        .cf-submit-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 520px) {
          .cf-submit-row {
            flex-direction: column;
            align-items: stretch;
          }
          .cf-submit-row .cf-email-hint {
            text-align: center;
            order: 2;
          }
          .cf-submit { order: 1; width: 100%; }
        }

        /* name+email row */
        .cf-fields-row {
          display: flex;
          flex-direction: row;
          gap: 16px;
          width: 100%;
        }
        @media (max-width: 520px) {
          .cf-fields-row { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <Column
        fillWidth
        gap="xl"
        paddingY="80"
        paddingX="l"
        style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}
      >
        {/* Header */}
        <Column gap="12" align="center" horizontal="center">
          <Row gap="8" vertical="center">
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--brand-background-strong)",
              animation: "contactPulse 2.4s ease-in-out infinite",
              display: "inline-block",
              flexShrink: 0,
            }}/>
            <Text variant="label-default-xs" onBackground="neutral-weak"
              style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {t("Tersedia untuk kolaborasi", "Available for collaboration")}
            </Text>
          </Row>

          <Text variant="display-strong-m" style={{ textAlign: "center" }}>
            {t("Mari Terhubung", "Let's Connect")}
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak"
            style={{ textAlign: "center", maxWidth: 400, lineHeight: 1.65, padding: "0 8px" }}>
            {t(
              "Punya proyek menarik atau ingin berdiskusi? Kirim pesan dan saya akan merespons secepatnya.",
              "Have an interesting project or want to discuss something? Send a message and I'll respond as soon as possible."
            )}
          </Text>
        </Column>

        {/* Contact Form */}
        <Column
          gap="l"
          border="neutral-alpha-weak"
          radius="l"
          padding="l"
          background="surface"
          style={{ backdropFilter: "blur(8px)" }}
        >
          {/* Nama + Email */}
          <div className="cf-fields-row">
            <Column flex={1} gap="0" style={{ minWidth: 0 }}>
              <label className="cf-label">{icons.user} {t("Nama Lengkap", "Full Name")}</label>
              <input
                className="cf-input"
                type="text"
                placeholder={t("Nama Anda", "Your name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Column>
            <Column flex={1} gap="0" style={{ minWidth: 0 }}>
              <label className="cf-label">{icons.email} {t("Email Anda", "Your Email")}</label>
              <input
                className="cf-input"
                type="email"
                placeholder={t("email@anda.com", "email@you.com")}
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </Column>
          </div>

          {/* Subjek */}
          <Column gap="0">
            <label className="cf-label">{icons.message} {t("Subjek", "Subject")}</label>
            <input
              className="cf-input"
              type="text"
              placeholder={t("Topik pesan Anda", "Topic of your message")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Column>

          {/* Pesan */}
          <Column gap="0">
            <label className="cf-label">{icons.message} {t("Pesan", "Message")}</label>
            <textarea
              className="cf-input cf-textarea"
              placeholder={t("Ceritakan proyek atau ide Anda di sini...", "Tell me about your project or idea here...")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Column>

          {/* Submit */}
          <div className="cf-submit-row">
            {recipientEmail && (
              <Text variant="body-default-xs" onBackground="neutral-weak" className="cf-email-hint">
                {t("Kirim ke", "Sending to")}: <span style={{ color: "var(--brand-on-background-medium)" }}>{recipientEmail}</span>
              </Text>
            )}
            <button
              className="cf-submit"
              onClick={handleSubmit}
              disabled={!name || !senderEmail || !message || formState === "sending"}
            >
              {icons.send}
              {formState === "sending" ? t("Membuka...", "Opening...") : formState === "sent" ? t("✓ Terkirim!", "✓ Sent!") : t("Kirim Pesan", "Send Message")}
            </button>
          </div>
        </Column>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <Column gap="12" align="center" horizontal="center">
            <Text variant="label-default-xs" onBackground="neutral-weak"
              style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {t("Atau temukan saya di", "Or find me on")}
            </Text>
            <Row gap="8" wrap horizontal="center">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="cf-social-link">
                  {s.icon}{s.label}
                </a>
              ))}
            </Row>
          </Column>
        )}

        <Text variant="body-default-xs" onBackground="neutral-weak" style={{ textAlign: "center" }}>
          Makassar, Indonesia · {t("Ramah remote", "Remote friendly")}
        </Text>
      </Column>
    </RevealFx>
  );
}
