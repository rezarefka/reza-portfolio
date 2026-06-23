"use client";

import { useState } from "react";
import { Column, Row, Text, RevealFx } from "@once-ui-system/core";
import type { SiteSettings } from "@/lib/types";
import type { ReactNode } from "react";
import { useLang } from "@/lib/lang-context";

const icons: Record<string, ReactNode> = {
  email:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  github:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
  linkedin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
  instagram:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  send:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
  user:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  message:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

interface ContactSectionProps { settings?: SiteSettings | null; }
type FormState = "idle" | "sending" | "sent" | "error";

export function ContactSection({ settings }: ContactSectionProps) {
  const { t } = useLang();
  const [name,        setName]        = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject,     setSubject]     = useState("");
  const [message,     setMessage]     = useState("");
  const [formState,   setFormState]   = useState<FormState>("idle");

  const recipientEmail = settings?.social_email || "";

  const handleSubmit = async () => {
    if (!name || !senderEmail || !message) return;
    setFormState("sending");
    const body = `${t("Nama","Name")}: ${name}\nEmail: ${senderEmail}\n\n${message}`;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject||t("Pesan dari Portfolio","Message from Portfolio"))}&body=${encodeURIComponent(body)}`;
    setTimeout(()=>setFormState("sent"),   800);
    setTimeout(()=>setFormState("idle"),  3500);
  };

  const socialLinks = [
    settings?.social_github    && { label:"GitHub",    href:settings.social_github,    icon:icons.github },
    settings?.social_linkedin  && { label:"LinkedIn",  href:settings.social_linkedin,  icon:icons.linkedin },
    settings?.social_instagram && { label:"Instagram", href:settings.social_instagram, icon:icons.instagram },
  ].filter(Boolean) as {label:string;href:string;icon:ReactNode}[];

  return (
    <RevealFx translateY="12" delay={0.1} fillWidth>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cf-avail-dot,.cf-submit,.cf-social-link,.cf-input { transition-duration:0.01ms!important; animation-duration:0.01ms!important; }
        }

        /* P5: dot is neutral, NOT brand accent */
        @keyframes cfDotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.45; transform:scale(1.55); }
        }
        .cf-avail-dot {
          width:7px; height:7px; border-radius:50%;
          background: var(--neutral-on-background-medium); /* neutral */
          animation: cfDotPulse 2.4s ease-in-out infinite;
          display: inline-block; flex-shrink:0;
        }

        /* ── Inputs ── */
        .cf-input {
          width:100%; padding:11px 14px; border-radius:10px;
          font-size:14px; font-family:inherit;
          background:var(--neutral-background-medium);
          border:1px solid var(--neutral-alpha-weak);
          color:var(--neutral-on-background-strong);
          outline:none; box-sizing:border-box;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cf-input:focus {
          border-color:var(--brand-alpha-medium);
          box-shadow:0 0 0 3px var(--brand-alpha-weak);
        }
        .cf-input::placeholder { color:var(--neutral-on-background-weak); opacity:0.7; }
        .cf-textarea { resize:vertical; min-height:128px; }

        /* ── Label ── */
        .cf-label {
          display:flex; align-items:center; gap:6px;
          font-size:12px; font-weight:600; letter-spacing:0.02em;
          color:var(--neutral-on-background-weak);
          margin-bottom:6px; text-transform:uppercase;
        }

        /* ── P5: ONLY submit button gets brand accent ── */
        .cf-submit {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:13px 32px; border-radius:12px; border:none;
          font-size:14px; font-weight:700; cursor:pointer; font-family:inherit;
          background:var(--brand-background-strong); /* P5: only accent here */
          color:var(--brand-on-background-strong);
          box-shadow:0 2px 16px var(--brand-alpha-medium);
          transition:opacity 0.18s, transform 0.2s, box-shadow 0.2s;
          white-space:nowrap; min-height:48px; letter-spacing:0.01em;
        }
        .cf-submit:hover:not(:disabled) {
          opacity:0.9; transform:translateY(-2px);
          box-shadow:0 8px 32px var(--brand-alpha-medium);
        }
        .cf-submit:active:not(:disabled) { transform:translateY(0); }
        .cf-submit:disabled { opacity:0.5; cursor:not-allowed; }

        /* ── Social links ── */
        .cf-social-link {
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 16px; border-radius:10px;
          text-decoration:none; font-size:13px; font-weight:500;
          border:1px solid var(--neutral-alpha-weak);
          background:var(--neutral-background-medium);
          color:var(--neutral-on-background-strong);
          transition:border-color 0.18s, background 0.18s, transform 0.18s;
          min-height:40px;
        }
        .cf-social-link:hover { border-color:var(--neutral-alpha-medium); background:var(--neutral-alpha-weak); transform:translateY(-2px); }

        /* ── Layout ── */
        .cf-fields-row { display:flex; flex-direction:row; gap:16px; width:100%; }
        @media(max-width:520px){ .cf-fields-row{flex-direction:column;gap:16px;} }
        .cf-submit-row { display:flex; align-items:center; justify-content:flex-end; gap:12px; flex-wrap:wrap; }
        @media(max-width:520px){
          .cf-submit-row{flex-direction:column;align-items:stretch;}
          .cf-submit-row .cf-hint{text-align:center;order:2;}
          .cf-submit{order:1;width:100%;}
        }
      `}</style>

      <Column fillWidth gap="xl" paddingY="80" paddingX="l"
        style={{maxWidth:680, margin:"0 auto", width:"100%"}}>

        {/* Header */}
        <Column gap="16" align="center" horizontal="center">
          <Row gap="8" vertical="center">
            {/* P5: availability dot is neutral — NOT brand accent */}
            <span className="cf-avail-dot"/>
            <Text variant="label-default-xs" onBackground="neutral-weak"
              style={{letterSpacing:"0.1em",textTransform:"uppercase"}}>
              {t("Tersedia untuk kolaborasi","Available for collaboration")}
            </Text>
          </Row>

          {/* Heading — neutral, clean */}
          <h2 style={{
            fontSize:"clamp(1.8rem,4vw,2.4rem)",
            fontWeight:800, letterSpacing:"-0.025em", lineHeight:1.15,
            textAlign:"center", margin:0,
            color:"var(--neutral-on-background-strong)",
          }}>
            {t("Mari Terhubung","Let's Connect")}
          </h2>

          <Text variant="body-default-m" onBackground="neutral-weak"
            style={{textAlign:"center",maxWidth:400,lineHeight:1.65,padding:"0 8px"}}>
            {t(
              "Punya proyek menarik atau ingin berdiskusi? Kirim pesan dan saya akan merespons secepatnya.",
              "Have an interesting project or want to discuss something? Send a message and I'll respond as soon as possible."
            )}
          </Text>
        </Column>

        {/* Form card */}
        <Column gap="l" border="neutral-alpha-weak" radius="l" padding="l"
          background="surface" style={{backdropFilter:"blur(8px)"}}>

          {/* Row: Name + Email */}
          <div className="cf-fields-row">
            <Column flex={1} gap="0" style={{minWidth:0}}>
              <label className="cf-label">{icons.user}&nbsp;{t("Nama Lengkap","Full Name")}</label>
              <input className="cf-input" type="text"
                placeholder={t("Nama Anda","Your name")}
                value={name} onChange={e=>setName(e.target.value)}/>
            </Column>
            <Column flex={1} gap="0" style={{minWidth:0}}>
              <label className="cf-label">{icons.email}&nbsp;{t("Email","Email")}</label>
              <input className="cf-input" type="email"
                placeholder={t("email@anda.com","email@you.com")}
                value={senderEmail} onChange={e=>setSenderEmail(e.target.value)}/>
            </Column>
          </div>

          {/* Subject */}
          <Column gap="0">
            <label className="cf-label">{icons.message}&nbsp;{t("Subjek","Subject")}</label>
            <input className="cf-input" type="text"
              placeholder={t("Topik pesan Anda","Topic of your message")}
              value={subject} onChange={e=>setSubject(e.target.value)}/>
          </Column>

          {/* Message */}
          <Column gap="0">
            <label className="cf-label">{icons.message}&nbsp;{t("Pesan","Message")}</label>
            <textarea className="cf-input cf-textarea"
              placeholder={t("Ceritakan proyek atau ide Anda...","Tell me about your project or idea...")}
              value={message} onChange={e=>setMessage(e.target.value)}/>
          </Column>

          {/* Submit — P5: only accent element in this section */}
          <div className="cf-submit-row">
            {recipientEmail && (
              <Text variant="body-default-xs" onBackground="neutral-weak" className="cf-hint">
                {t("Kirim ke","Sending to")}: <span style={{color:"var(--brand-on-background-medium)"}}>{recipientEmail}</span>
              </Text>
            )}
            <button className="cf-submit" onClick={handleSubmit} type="button"
              disabled={!name||!senderEmail||!message||formState==="sending"}>
              {icons.send}
              {formState==="sending"
                ? t("Membuka...","Opening...")
                : formState==="sent"
                  ? t("✓ Terkirim!","✓ Sent!")
                  : t("Kirim Pesan","Send Message")}
            </button>
          </div>
        </Column>

        {/* Social links */}
        {socialLinks.length>0 && (
          <Column gap="12" align="center" horizontal="center">
            <Text variant="label-default-xs" onBackground="neutral-weak"
              style={{textTransform:"uppercase",letterSpacing:"0.1em"}}>
              {t("Atau temukan saya di","Or find me on")}
            </Text>
            <Row gap="8" wrap horizontal="center">
              {socialLinks.map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="cf-social-link">
                  {s.icon}{s.label}
                </a>
              ))}
            </Row>
          </Column>
        )}

        <Text variant="body-default-xs" onBackground="neutral-weak" style={{textAlign:"center"}}>
          Makassar, Indonesia · {t("Ramah remote","Remote friendly")}
        </Text>
      </Column>
    </RevealFx>
  );
}
