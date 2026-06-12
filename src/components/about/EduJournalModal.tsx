"use client";

import { useState, useEffect } from "react";

interface EduJournalModalProps {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  pdfUrl?: string | null;
  externalUrl?: string | null;
}

export function EduJournalModal({ title, subtitle, description, pdfUrl, externalUrl }: EduJournalModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!pdfUrl && !externalUrl) return null;

  const cleanPdfUrl = pdfUrl ? pdfUrl.split("?")[0] : null;
  const openSrc = cleanPdfUrl ?? externalUrl!;
  const embedSrc = cleanPdfUrl
    ? `${cleanPdfUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`
    : `https://docs.google.com/viewer?url=${encodeURIComponent(externalUrl!)}&embedded=true`;

  return (
    <>
      <style>{`
        @keyframes jModalIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes jOverlayIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* ── Text-only trigger card ── */}
      <div
        className="journal-entry-card"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        <div className="journal-entry-left">
          <div className="journal-entry-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        </div>
        <div className="journal-entry-body">
          <div className="journal-entry-label">Jurnal / Skripsi</div>
          <div className="journal-entry-title">{title}</div>
          {subtitle && <div className="journal-entry-sub">{subtitle}</div>}
          {description && <div className="journal-entry-desc">{description}</div>}
        </div>
        <div className="journal-entry-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position:"fixed", inset:0, zIndex:9999,
            background:"rgba(0,0,0,0.75)",
            backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"16px",
            animation:"jOverlayIn 0.2s ease",
          }}
        >
          <div style={{
            width:"100%", maxWidth:860,
            height:"min(90vh, 900px)",
            borderRadius:20,
            background:"var(--neutral-background-strong)",
            border:"1px solid color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent)",
            boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
            display:"flex", flexDirection:"column", overflow:"hidden",
            animation:"jModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            {/* Header */}
            <div style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 18px",
              borderBottom:"1px solid color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)",
              flexShrink:0,
              background:"color-mix(in srgb, var(--neutral-on-background-strong) 3%, transparent)",
            }}>
              <div style={{ width:30, height:30, borderRadius:7, flexShrink:0, background:"color-mix(in srgb, #ef4444 15%, transparent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--neutral-on-background-weak)", marginBottom:1 }}>Jurnal / Skripsi</div>
                <div style={{ fontSize:12.5, fontWeight:600, color:"var(--neutral-on-background-strong)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontStyle:"italic" }}>{title}</div>
              </div>
              <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                <a href={openSrc} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, background:"var(--neutral-alpha-weak)", border:"1px solid var(--neutral-alpha-medium)", color:"var(--neutral-on-background-strong)", fontSize:11.5, fontWeight:600, textDecoration:"none", cursor:"pointer", transition:"background 0.15s" }}
                  onMouseEnter={(e)=>(e.currentTarget.style.background="var(--neutral-alpha-medium)")}
                  onMouseLeave={(e)=>(e.currentTarget.style.background="var(--neutral-alpha-weak)")}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Buka
                </a>
                <button onClick={()=>setOpen(false)}
                  style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:7, background:"var(--neutral-alpha-weak)", border:"1px solid var(--neutral-alpha-medium)", color:"var(--neutral-on-background-strong)", cursor:"pointer", transition:"background 0.15s" }}
                  onMouseEnter={(e)=>(e.currentTarget.style.background="var(--danger-alpha-weak)")}
                  onMouseLeave={(e)=>(e.currentTarget.style.background="var(--neutral-alpha-weak)")}
                  title="Tutup (Esc)"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* PDF viewer */}
            <div style={{ flex:1, overflow:"hidden", position:"relative", background:"#404040" }}>
              <iframe src={embedSrc} title={title} style={{ width:"100%", height:"100%", border:"none", display:"block" }} allow="fullscreen" />
            </div>

            {/* Footer */}
            <div style={{
              padding:"7px 18px",
              borderTop:"1px solid color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)",
              display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
              background:"color-mix(in srgb, var(--neutral-on-background-strong) 2%, transparent)",
            }}>
              <span style={{ fontSize:10.5, color:"var(--neutral-on-background-weak)" }}>
                Scroll untuk membaca · <kbd style={{ padding:"1px 4px", borderRadius:3, border:"1px solid var(--neutral-alpha-medium)", fontSize:9.5, fontFamily:"monospace" }}>Esc</kbd> tutup
              </span>
              {externalUrl && (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:10.5, color:"var(--brand-on-background-weak)", textDecoration:"none" }}>
                  Sumber asli →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
