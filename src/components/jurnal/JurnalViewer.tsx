"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── pdf.js CDN loader (same pattern as pdfToImages.ts) ─── */
const PDFJS_VERSION = "4.4.168";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

interface PdfjsLib {
  getDocument(src: { url: string; withCredentials?: boolean }): { promise: Promise<PDFDocumentProxy> };
  GlobalWorkerOptions: { workerSrc: string };
}
interface PDFDocumentProxy {
  numPages: number;
  getPage(n: number): Promise<PDFPageProxy>;
}
interface PDFPageProxy {
  getViewport(p: { scale: number }): PDFViewport;
  render(p: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }): { promise: Promise<void> };
  cleanup(): void;
}
interface PDFViewport { width: number; height: number; }

let _pdfjsPromise: Promise<PdfjsLib> | null = null;
function loadPdfJs(): Promise<PdfjsLib> {
  if (_pdfjsPromise) return _pdfjsPromise;
  _pdfjsPromise = new Promise<PdfjsLib>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.pdfjsLib?.getDocument) {
      w.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      return resolve(w.pdfjsLib as PdfjsLib);
    }
    const s = document.createElement("script");
    s.src = `${PDFJS_BASE}/pdf.min.js`;
    s.async = true;
    s.onload = () => {
      if (!w.pdfjsLib?.getDocument) { _pdfjsPromise = null; return reject(new Error("pdfjs load failed")); }
      w.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      resolve(w.pdfjsLib as PdfjsLib);
    };
    s.onerror = () => { _pdfjsPromise = null; reject(new Error("pdfjs script error")); };
    document.head.appendChild(s);
  });
  return _pdfjsPromise;
}

/* ─── Props ─── */
interface JurnalViewerProps {
  proxyUrl: string;
  title: string;
}

export function JurnalViewer({ proxyUrl, title }: JurnalViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<"loading" | "rendering" | "done" | "error">("loading");
  const [totalPages, setTotalPages] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  /* ─── Scrollbar sync ─── */
  const syncScrollbar = useCallback(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;
    const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight);
    const trackH = el.clientHeight;
    const thumbH = Math.max(40, trackH * (el.clientHeight / el.scrollHeight));
    const maxTop = trackH - thumbH;
    thumb.style.height = `${thumbH}px`;
    thumb.style.transform = `translateY(${ratio * maxTop}px)`;
  }, []);

  /* ─── Track current page from scroll position ─── */
  const syncCurrentPage = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const canvases = el.querySelectorAll<HTMLCanvasElement>("[data-page]");
    let closest = 1;
    let closestDist = Infinity;
    canvases.forEach((c) => {
      const rect = c.getBoundingClientRect();
      const scrollRect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - scrollRect.top);
      if (dist < closestDist) { closestDist = dist; closest = Number(c.dataset.page); }
    });
    setCurrentPage(closest);
  }, []);

  /* ─── Thumb drag ─── */
  useEffect(() => {
    const thumb = thumbRef.current;
    const el = scrollRef.current;
    if (!thumb || !el) return;
    let dragging = false;
    let startY = 0;
    let startScroll = 0;

    const onDown = (e: MouseEvent) => {
      dragging = true;
      startY = e.clientY;
      startScroll = el.scrollTop;
      document.body.style.userSelect = "none";
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const trackH = el.clientHeight;
      const thumbH = thumb.offsetHeight;
      const ratio = (e.clientY - startY) / (trackH - thumbH);
      el.scrollTop = startScroll + ratio * (el.scrollHeight - el.clientHeight);
    };
    const onUp = () => { dragging = false; document.body.style.userSelect = ""; };

    thumb.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      thumb.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /* ─── Render PDF ─── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let cancelled = false;

    async function renderPdf() {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        const pdf = await pdfjs.getDocument({ url: proxyUrl }).promise;
        if (cancelled) return;

        const n = pdf.numPages;
        setTotalPages(n);
        setStatus("rendering");

        for (let pageNum = 1; pageNum <= n; pageNum++) {
          if (cancelled) break;
          const page = await pdf.getPage(pageNum);
          if (cancelled) break;

          /* Scale to fit container width, minimum 900px */
          const containerW = el.clientWidth - 48; // padding
          const scale = Math.max(containerW, 900) / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale });

          const wrapper = document.createElement("div");
          wrapper.style.cssText = `
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
          `;

          const canvas = document.createElement("canvas");
          canvas.dataset.page = String(pageNum);
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = `
            max-width: 100%;
            height: auto;
            display: block;
            border-radius: 6px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.28);
          `;

          wrapper.appendChild(canvas);
          el.appendChild(wrapper);

          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            page.cleanup();
          }

          if (!cancelled) setRenderedPages(pageNum);
        }

        if (!cancelled) {
          setStatus("done");
          syncScrollbar();
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : "Gagal memuat PDF");
          setStatus("error");
        }
      }
    }

    renderPdf();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyUrl]);

  /* ─── Scroll listener ─── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => { syncScrollbar(); syncCurrentPage(); };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [syncScrollbar, syncCurrentPage]);

  const progressPct = totalPages > 0 ? Math.round((renderedPages / totalPages) * 100) : 0;

  return (
    <>
      <style>{`
        /* ── Jurnal viewer layout ── */
        .jv-root {
          position: relative;
          width: 100%;
          height: calc(100vh - 148px);
          min-height: 500px;
          display: flex;
          overflow: hidden;
        }

        /* ── Scroll area — hide native scrollbar ── */
        .jv-scroll {
          flex: 1;
          overflow-y: scroll;
          overflow-x: hidden;
          padding: 24px 24px 48px;
          scroll-behavior: smooth;
          background: transparent;
          /* Hide native scrollbar cross-browser */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .jv-scroll::-webkit-scrollbar { display: none; }

        /* ── Custom liquid glass scrollbar track ── */
        .jv-scrollbar-track {
          position: absolute;
          right: 6px;
          top: 8px;
          bottom: 8px;
          width: 6px;
          border-radius: 99px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.08);
          opacity: 0;
          transition: opacity 0.25s ease;
          z-index: 10;
        }
        .jv-root:hover .jv-scrollbar-track,
        .jv-root.scrolling .jv-scrollbar-track {
          opacity: 1;
        }

        /* ── Thumb — liquid glass pill ── */
        .jv-scrollbar-thumb {
          position: absolute;
          left: 0; right: 0; top: 0;
          border-radius: 99px;
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.30) 0%,
            rgba(255,255,255,0.10) 50%,
            rgba(255,255,255,0.18) 100%
          );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.4),
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 2px 8px rgba(0,0,0,0.25);
          cursor: grab;
          transition: background 0.15s, border-color 0.15s;
          min-height: 40px;
        }
        .jv-scrollbar-thumb:hover {
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.40) 0%,
            rgba(255,255,255,0.18) 50%,
            rgba(255,255,255,0.28) 100%
          );
          border-color: rgba(255,255,255,0.35);
        }
        .jv-scrollbar-thumb:active { cursor: grabbing; }

        /* ── Loading overlay ── */
        .jv-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 20;
          border-radius: 12px;
        }
        .jv-loading-text {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.03em;
        }
        .jv-progress-track {
          width: 200px;
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
        }
        .jv-progress-bar {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--brand-background-strong), #a78bfa);
          transition: width 0.3s ease;
        }

        /* ── Page number badge ── */
        .jv-page-badge {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          padding: 5px 14px;
          border-radius: 99px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.25s;
          white-space: nowrap;
        }
        .jv-root:hover .jv-page-badge {
          opacity: 1;
        }

        /* ── Error state ── */
        .jv-error {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; height: 100%;
          color: var(--neutral-on-background-weak);
        }
      `}</style>

      <div
        ref={containerRef}
        className="jv-root"
        onScroll={() => {
          containerRef.current?.classList.add("scrolling");
          clearTimeout((containerRef.current as HTMLDivElement & { _st?: ReturnType<typeof setTimeout> })?._st);
          if (containerRef.current) {
            (containerRef.current as HTMLDivElement & { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
              containerRef.current?.classList.remove("scrolling");
            }, 1000);
          }
        }}
      >
        {/* PDF canvas pages injected here */}
        <div ref={scrollRef} className="jv-scroll" />

        {/* Liquid glass scrollbar */}
        <div className="jv-scrollbar-track">
          <div ref={thumbRef} className="jv-scrollbar-thumb" />
        </div>

        {/* Page badge */}
        {status !== "loading" && totalPages > 0 && (
          <div className="jv-page-badge">
            {currentPage} / {totalPages}
          </div>
        )}

        {/* Loading / progress overlay */}
        {(status === "loading" || status === "rendering") && (
          <div className="jv-loading">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div className="jv-loading-text">
              {status === "loading"
                ? "Memuat dokumen…"
                : `Merender halaman ${renderedPages} / ${totalPages}`}
            </div>
            {status === "rendering" && (
              <div className="jv-progress-track">
                <div className="jv-progress-bar" style={{ width: `${progressPct}%` }} />
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="jv-error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 13, margin: 0 }}>Gagal memuat PDF</p>
            <p style={{ fontSize: 11, margin: 0, opacity: 0.6 }}>{errorMsg}</p>
          </div>
        )}
      </div>
    </>
  );
}
