"use client";

import Link from "next/link";
import { Column, Heading, Text } from "@once-ui-system/core";
import { JurnalViewer } from "@/components/jurnal/JurnalViewer";
import { useLang } from "@/lib/lang-context";

export function JurnalPageContent({
  url,
  title,
  proxyUrl,
}: {
  url: string | undefined;
  title: string | undefined;
  proxyUrl: string;
}) {
  const { t } = useLang();
  const displayTitle = title || t("Preview Jurnal", "Journal Preview");

  if (!url) {
    return (
      <Column maxWidth="m" paddingY="48" gap="16" horizontal="center">
        <Heading as="h1" variant="display-strong-s">
          {t("Jurnal tidak ditemukan", "Journal not found")}
        </Heading>
        <Text onBackground="neutral-weak">
          {t("Tautan jurnal tidak valid atau tidak disertakan.", "The journal link is invalid or missing.")}
        </Text>
        <Link href="/about#pendidikan" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 600, color: "var(--neutral-on-background-strong)",
          textDecoration: "none", padding: "8px 14px", borderRadius: 8,
          border: "1px solid var(--neutral-alpha-medium)", background: "var(--neutral-alpha-weak)",
        }}>← {t("Kembali ke About", "Back to About")}</Link>
      </Column>
    );
  }

  return (
    <div className="jp-page">
      <style>{`
        /* ── Full-page layout, no scroll on body ── */
        .jp-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* ── Topbar — liquid glass pill ── */
        .jp-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 80px 24px 12px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .jp-title-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .jp-pdf-icon {
          flex-shrink: 0;
          width: 30px; height: 30px;
          border-radius: 8px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .jp-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--neutral-on-background-strong);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .jp-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .jp-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: var(--neutral-on-background-strong);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          white-space: nowrap;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .jp-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .jp-btn-primary {
          color: var(--brand-on-background-medium);
          border-color: rgba(var(--brand-background-strong-rgb, 99,102,241), 0.35);
          background: rgba(var(--brand-background-strong-rgb, 99,102,241), 0.12);
        }
        .jp-btn-primary:hover {
          background: rgba(var(--brand-background-strong-rgb, 99,102,241), 0.22);
        }

        /* ── Viewer container ── */
        .jp-viewer-wrap {
          flex: 1;
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px 32px;
          box-sizing: border-box;
        }
        .jp-viewer-shell {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.25);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 24px 48px rgba(0,0,0,0.3);
        }

        @media (max-width: 640px) {
          .jp-topbar { padding: 80px 16px 10px; }
          .jp-viewer-wrap { padding: 0 12px 20px; }
          .jp-title { font-size: 12px; }
          .jp-btn { padding: 6px 10px; font-size: 11px; }
        }
      `}</style>

      {/* Topbar */}
      <div className="jp-topbar">
        <div className="jp-title-wrap">
          <div className="jp-pdf-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="jp-title">{displayTitle}</p>
        </div>

        <div className="jp-actions">
          <Link href="/about#pendidikan" className="jp-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            {t("Kembali", "Back")}
          </Link>
          <a href={url} target="_blank" rel="noopener noreferrer" className="jp-btn jp-btn-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            {t("Unduh PDF", "Download PDF")}
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="jp-viewer-wrap">
        <div className="jp-viewer-shell">
          <JurnalViewer proxyUrl={proxyUrl} title={displayTitle} />
        </div>
      </div>
    </div>
  );
}
