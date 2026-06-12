"use client";

import { useState, useEffect } from "react";

interface EduJournalModalProps {
  title: string;
  pdfUrl?: string | null;
  externalUrl?: string | null;
}

export function EduJournalModal({ title, pdfUrl, externalUrl }: EduJournalModalProps) {
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
  const embedSrc = cleanPdfUrl
    ? `${cleanPdfUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`
    : `https://docs.google.com/viewer?url=${encodeURIComponent(externalUrl!)}&embedded=true`;

  const openSrc = cleanPdfUrl
    ? cleanPdfUrl
    : `https://docs.google.com/viewer?url=${encodeURIComponent(externalUrl!)}&embedded=true`;

  return (
    <>
      <style>{`
        @keyframes journalModalIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes journalOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .journal-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          border: 1.5px solid var(--brand-alpha-medium);
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background-strong);
          transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
          white-space: nowrap;
          text-decoration: none;
        }
        .journal-btn:hover {
          background: var(--brand-alpha-medium);
          border-color: var(--brand-background-strong);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px color-mix(in srgb, var(--brand-background-strong) 22%, transparent);
        }
        .journal-btn:active { transform: scale(0.97); }
        .journal-thumb-wrap {
          margin-top: 12px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--neutral-alpha-weak);
          background: #404040;
          position: relative;
          aspect-ratio: 16/9;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .journal-thumb-wrap:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .journal-thumb-wrap iframe {
          width: 200%;
          height: 200%;
          border: none;
          transform: scale(0.5);
          transform-origin: top left;
          pointer-events: none;
          display: block;
        }
        .journal-thumb-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.62) 100%);
          display: flex;
          align-items: flex-end;
          padding: 10px 12px;
          gap: 7px;
        }
        .journal-thumb-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          background: rgba(239,68,68,0.18);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em;
        }
        .journal-thumb-open {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.88);
          font-size: 10.5px; font-weight: 600;
          margin-left: auto;
        }
      `}</style>

      {/* ── Tombol Akses Jurnal ── */}
      <button className="journal-btn" onClick={() => setOpen(true)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Akses Jurnal
      </button>

      {/* ── PDF Thumbnail Preview ── */}
      {cleanPdfUrl && (
        <div className="journal-thumb-wrap" onClick={() => setOpen(true)} title="Klik untuk membaca dokumen">
          <iframe
            src={`${cleanPdfUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
            title={`Preview: ${title}`}
            loading="lazy"
          />
          <div className="journal-thumb-overlay">
            <span className="journal-thumb-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              PDF
            </span>
            <span className="journal-thumb-open">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Baca Selengkapnya
            </span>
          </div>
        </div>
      )}

      {/* ── Modal Overlay ── */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
            animation: "journalOverlayIn 0.22s ease",
          }}
        >
          <div style={{
            width: "100%", maxWidth: 860,
            height: "min(90vh, 900px)",
            borderRadius: 20,
            background: "var(--neutral-background-strong)",
            border: "1px solid color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.06) inset",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "journalModalIn 0.26s cubic-bezier(0.34,1.56,0.64,1)",
          }}>

            {/* ── Header ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 20px",
              borderBottom: "1px solid color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)",
              flexShrink: 0,
              background: "color-mix(in srgb, var(--neutral-on-background-strong) 3%, transparent)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "color-mix(in srgb, #ef4444 15%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--neutral-on-background-weak)", marginBottom: 2 }}>
                  Jurnal / Skripsi
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "var(--neutral-on-background-strong)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontStyle: "italic",
                }}>
                  {title}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a
                  href={cleanPdfUrl ?? externalUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8,
                    background: "var(--neutral-alpha-weak)",
                    border: "1px solid var(--neutral-alpha-medium)",
                    color: "var(--neutral-on-background-strong)",
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-alpha-medium)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-alpha-weak)")}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Buka
                </a>

                <button
                  onClick={() => setOpen(false)}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: 8,
                    background: "var(--neutral-alpha-weak)",
                    border: "1px solid var(--neutral-alpha-medium)",
                    color: "var(--neutral-on-background-strong)",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-alpha-weak)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-alpha-weak)")}
                  title="Tutup (Esc)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* ── PDF Viewer (scrollable) ── */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative", background: "#404040" }}>
              <iframe
                src={openSrc}
                title={title}
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                allow="fullscreen"
              />
            </div>

            {/* ── Footer ── */}
            <div style={{
              padding: "8px 20px",
              borderTop: "1px solid color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
              background: "color-mix(in srgb, var(--neutral-on-background-strong) 2%, transparent)",
            }}>
              <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
                Scroll untuk membaca dokumen · Tekan{" "}
                <kbd style={{ padding: "1px 5px", borderRadius: 4, border: "1px solid var(--neutral-alpha-medium)", fontSize: 10, fontFamily: "monospace" }}>Esc</kbd>{" "}
                untuk menutup
              </span>
              {externalUrl && (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "var(--brand-on-background-weak)", textDecoration: "none" }}>
                  Lihat sumber asli →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
