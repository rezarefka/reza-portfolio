"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/lang-context";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  ogImageUrl?: string;
}

export function ShareButton({ title, description, url, ogImageUrl }: ShareButtonProps) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const imageUrl =
    ogImageUrl ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/api/og/generate?title=${encodeURIComponent(title)}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareStatus(t("Link disalin!", "Link copied!"));
      setTimeout(() => { setCopied(false); setShareStatus(null); }, 2500);
    } catch {
      setShareStatus(t("Gagal menyalin", "Copy failed"));
      setTimeout(() => setShareStatus(null), 2000);
    }
    setOpen(false);
  };

  const shareNative = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title, text: description || title, url: shareUrl });
    } catch { /* cancelled */ }
    setOpen(false);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title}\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener");
    setOpen(false);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    setOpen(false);
  };

  const shareToIGStory = () => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isIOS || isAndroid) {
      window.location.href = `instagram-stories://share?background_image_url=${encodeURIComponent(imageUrl)}&content_url=${encodeURIComponent(shareUrl)}`;
      setShareStatus(t("Membuka Instagram...", "Opening Instagram..."));
    } else {
      navigator.clipboard.writeText(shareUrl).then(
        () => setShareStatus(t("Link disalin — buka IG Story & tempel!", "Link copied — open IG Story & paste!")),
        () => setShareStatus(t("Buka IG, tempel link ini di Story", "Open IG, paste this link in your Story")),
      );
    }
    setTimeout(() => setShareStatus(null), 3000);
    setOpen(false);
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <style>{`
        @keyframes shareMenuIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shareToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ── Dropdown panel ── */
        .share-menu {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          width: 240px;
          background: var(--neutral-background-strong);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 16px;
          box-shadow:
            0 24px 64px rgba(0,0,0,0.28),
            0 4px 16px rgba(0,0,0,0.14),
            inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
          z-index: 100;
          animation: shareMenuIn 0.2s cubic-bezier(0.16,1,0.3,1) both;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* ── Preview card inside dropdown ── */
        .share-preview {
          padding: 12px 12px 10px;
          border-bottom: 1px solid var(--neutral-alpha-weak);
        }
        .share-preview-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: var(--neutral-alpha-weak);
          border: 1px solid var(--neutral-alpha-weak);
        }
        .share-preview-thumb {
          width: 44px;
          height: 34px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--neutral-alpha-medium);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .share-preview-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .share-preview-text {
          flex: 1;
          min-width: 0;
        }
        .share-preview-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--neutral-on-background-strong);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }
        .share-preview-url {
          font-size: 10px;
          color: var(--neutral-on-background-weak);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
          opacity: 0.65;
        }

        /* ── Menu items ── */
        .share-items {
          padding: 6px 0;
        }
        .share-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 16px;
          border: none;
          background: transparent;
          color: var(--neutral-on-background-medium);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s ease, color 0.12s ease, padding-left 0.15s ease;
          font-family: inherit;
        }
        .share-item:hover {
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-strong);
          padding-left: 20px;
        }

        /* ── Trigger button ── */
        .share-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--neutral-alpha-medium);
          background: transparent;
          color: var(--neutral-on-background-medium);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.2s ease;
        }
        .share-trigger:hover, .share-trigger.active {
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-strong);
          border-color: var(--neutral-alpha-strong);
          transform: translateY(-1px);
        }
        .share-trigger:active {
          transform: translateY(0);
        }

        /* ── Toast ── */
        .share-status-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--neutral-background-strong);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 99px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--neutral-on-background-strong);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          z-index: 9999;
          animation: shareToastIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>

      {/* Trigger */}
      <button
        className={`share-trigger${open ? " active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        {t("Bagikan", "Share")}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="share-menu">
          {/* Preview card — sampul + judul */}
          <div className="share-preview">
            <div className="share-preview-inner">
              <div className="share-preview-thumb">
                {ogImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ogImageUrl} alt={title} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </div>
              <div className="share-preview-text">
                <div className="share-preview-title">{title}</div>
                <div className="share-preview-url">
                  {shareUrl.replace(/^https?:\/\//, "").slice(0, 36)}{shareUrl.length > 40 ? "…" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="share-items">
            <button className="share-item" onClick={copyLink}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {copied ? t("✓ Tersalin!", "✓ Copied!") : t("Salin link", "Copy link")}
            </button>

            {hasNativeShare && (
              <button className="share-item" onClick={shareNative}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Share...
              </button>
            )}

            <button className="share-item" onClick={shareToWhatsApp}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
              </svg>
              WhatsApp
            </button>

            <button className="share-item" onClick={shareToTwitter}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </button>

            <button className="share-item" onClick={shareToIGStory}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              IG Story
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {shareStatus && (
        <div className="share-status-toast">{shareStatus}</div>
      )}
    </div>
  );
}
