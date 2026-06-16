"use client";

import { createClient } from "@/lib/supabase/client";
import { person } from "@/resources";
import { useEffect, useState, useRef, useCallback } from "react";
import { Tilt3DCard } from "./Tilt3DCard";

export function AvatarFromCms() {
  const [src, setSrc]             = useState<string>(person.avatar);
  const [loaded, setLoaded]       = useState(false);
  const [cvUrl, setCvUrl]         = useState<string | null>(null);
  const [cvClicked, setCvClicked] = useState(false);

  // ── Floating panel state ──────────────────────────────────────────────
  const panelRef  = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef<string | false>(false); // "se" | "sw" | "ne" | "nw" | "n" | "s" | "e" | "w"
  const dragStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, pw: 0, ph: 0, px: 0, py: 0 });

  // Default position: top-left of viewport, sticky-ish feel
  const [pos, setPos]   = useState({ x: 24, y: 88 });
  const [size, setSize] = useState({ w: 240, h: 540 });
  const [isSnapping, setIsSnapping] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings")
      .select("avatar, cv_file")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.avatar) setSrc(data.avatar.split("?")[0]);
        if (data?.cv_file) setCvUrl(data.cv_file);
      });
  }, []);

  const handleCvDownload = () => {
    if (!cvUrl) return;
    setCvClicked(true);
    setTimeout(() => setCvClicked(false), 2000);
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "Resume-Reza-Refka.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Drag handlers ────────────────────────────────────────────────────
  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    isDragging.current = true;
    dragStart.current = {
      mx: clientX, my: clientY,
      px: pos.x,   py: pos.y,
    };
    document.body.style.userSelect = "none";
  }, [pos]);

  // ── Resize handlers ──────────────────────────────────────────────────
  const onResizeStart = useCallback((dir: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    isResizing.current = dir;
    resizeStart.current = {
      mx: clientX, my: clientY,
      pw: size.w,  ph: size.h,
      px: pos.x,   py: pos.y,
    };
    document.body.style.userSelect = "none";
  }, [size, pos]);

  useEffect(() => {
    const MIN_W = 160, MIN_H = 320;

    const onMove = (clientX: number, clientY: number) => {
      if (isDragging.current) {
        const dx = clientX - dragStart.current.mx;
        const dy = clientY - dragStart.current.my;
        const nx = dragStart.current.px + dx;
        const ny = dragStart.current.py + dy;
        setPos({ x: nx, y: ny });
        setIsSnapping(false);
      }
      if (isResizing.current) {
        const dx = clientX - resizeStart.current.mx;
        const dy = clientY - resizeStart.current.my;
        const dir = isResizing.current;

        let nw = resizeStart.current.pw;
        let nh = resizeStart.current.ph;
        let nx = resizeStart.current.px;
        let ny = resizeStart.current.py;

        if (dir.includes("e")) nw = Math.max(MIN_W, resizeStart.current.pw + dx);
        if (dir.includes("w")) {
          nw = Math.max(MIN_W, resizeStart.current.pw - dx);
          nx = resizeStart.current.px + (resizeStart.current.pw - nw);
        }
        if (dir.includes("s")) nh = Math.max(MIN_H, resizeStart.current.ph + dy);
        if (dir.includes("n")) {
          nh = Math.max(MIN_H, resizeStart.current.ph - dy);
          ny = resizeStart.current.py + (resizeStart.current.ph - nh);
        }

        setSize({ w: nw, h: nh });
        setPos({ x: nx, y: ny });
      }
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);

    const onEnd = () => {
      isDragging.current = false;
      isResizing.current = false;
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend",  onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onEnd);
    };
  }, []);

  // ── Snap to original position ────────────────────────────────────────
  const snapHome = () => {
    setIsSnapping(true);
    setPos({ x: 24, y: 88 });
    setSize({ w: 240, h: 540 });
    setTimeout(() => setIsSnapping(false), 420);
  };

  return (
    <>
      <style>{`
        @keyframes avatarFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes locationDotBlink {
          0%, 100% { opacity: 1;    transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(0.75); }
        }

        /* ── Floating panel ─────────────────────────────────── */
        .av-float {
          position: fixed;
          z-index: 120;
          animation: avatarFadeIn 0.55s cubic-bezier(0.34,1.2,0.64,1) both;
          border-radius: 18px;
          background: color-mix(in srgb, var(--page-background) 72%, transparent);
          border: 1px solid var(--neutral-alpha-weak);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
          box-shadow: 0 8px 40px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          overflow: visible;
          min-width: 160px;
          min-height: 320px;
          box-sizing: border-box;
        }
        .av-float.av-snapping {
          transition: left 0.38s cubic-bezier(0.34,1.2,0.64,1),
                      top  0.38s cubic-bezier(0.34,1.2,0.64,1),
                      width  0.38s cubic-bezier(0.34,1.2,0.64,1),
                      height 0.38s cubic-bezier(0.34,1.2,0.64,1);
        }

        /* ── Drag handle bar ───────────────────────────────── */
        .av-drag-bar {
          width: 100%;
          padding: 10px 12px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: grab;
          flex-shrink: 0;
          border-radius: 18px 18px 0 0;
          touch-action: none;
          gap: 8px;
        }
        .av-drag-bar:active { cursor: grabbing; }
        .av-drag-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0.35;
        }
        .av-drag-dots span {
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--neutral-on-background-weak);
        }
        .av-snap-btn {
          opacity: 0;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-weak);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .av-float:hover .av-snap-btn { opacity: 1; }
        .av-snap-btn:hover { background: var(--neutral-alpha-medium); color: var(--neutral-on-background-strong); }

        /* ── Inner content ─────────────────────────────────── */
        .av-inner {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 12px 14px;
          overflow: hidden;
          gap: 0;
        }

        /* ── Canvas container (fills available vertical space) */
        .av-canvas-wrap {
          width: 100%;
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow: hidden;
        }

        /* ── Location & buttons ────────────────────────────── */
        .av-location {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
          flex-shrink: 0;
        }
        .av-loc-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--brand-background-strong);
          flex-shrink: 0;
          animation: locationDotBlink 2.6s ease-in-out infinite;
        }
        .av-loc-text {
          font-size: 12px;
          font-weight: 500;
          color: var(--neutral-on-background-weak);
          white-space: nowrap;
        }

        .av-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 10px;
          width: 100%;
          padding: 9px 14px;
          border-radius: 10px;
          background: var(--brand-background-strong);
          color: var(--brand-on-solid-strong);
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          border: none;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
          transition: opacity 0.15s, transform 0.13s;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .av-cta::after {
          content: "";
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
          animation: ctaShimmer 3.2s ease-in-out infinite;
        }
        @keyframes ctaShimmer {
          0%  { left: -100%; }
          50% { left: 150%; }
          100%{ left: 150%; }
        }
        .av-cta:hover   { opacity: 0.88; transform: translateY(-1px); }
        .av-cta:active  { transform: scale(0.97); }

        .av-resume {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 6px;
          width: 100%;
          padding: 9px 14px;
          border-radius: 10px;
          background: transparent;
          color: var(--neutral-on-background-strong);
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          border: 1px solid var(--neutral-alpha-medium);
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.15s, border-color 0.15s, transform 0.13s;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .av-resume:hover { background: var(--neutral-alpha-weak); border-color: var(--neutral-alpha-strong); }
        .av-resume:active { transform: scale(0.97); }
        .av-resume.av-resume-ok {
          color: rgb(74,222,128);
          border-color: rgba(34,197,94,0.38);
          background: rgba(34,197,94,0.10);
        }
        .av-resume-check {
          stroke-dasharray: 22;
          stroke-dashoffset: 22;
          animation: avResumeCheck 0.35s ease forwards;
        }
        @keyframes avResumeCheck {
          from { stroke-dashoffset: 22; }
          to   { stroke-dashoffset: 0; }
        }

        /* ── Resize handles ─────────────────────────────────── */
        .av-resize {
          position: absolute;
          z-index: 10;
          touch-action: none;
        }
        /* Edge handles */
        .av-resize-e  { right: -5px;  top: 20%;  width: 10px; height: 60%; cursor: ew-resize; border-radius: 5px; }
        .av-resize-w  { left: -5px;   top: 20%;  width: 10px; height: 60%; cursor: ew-resize; border-radius: 5px; }
        .av-resize-s  { bottom: -5px; left: 20%; height: 10px; width: 60%; cursor: ns-resize; border-radius: 5px; }
        .av-resize-n  { top: -5px;    left: 20%; height: 10px; width: 60%; cursor: ns-resize; border-radius: 5px; }
        /* Corner handles */
        .av-resize-se { right: -6px;  bottom: -6px; width: 18px; height: 18px; cursor: se-resize; border-radius: 50%; }
        .av-resize-sw { left: -6px;   bottom: -6px; width: 18px; height: 18px; cursor: sw-resize; border-radius: 50%; }
        .av-resize-ne { right: -6px;  top: -6px;    width: 18px; height: 18px; cursor: ne-resize; border-radius: 50%; }
        .av-resize-nw { left: -6px;   top: -6px;    width: 18px; height: 18px; cursor: nw-resize; border-radius: 50%; }

        /* Visible corner pip */
        .av-resize-se::after,
        .av-resize-sw::after,
        .av-resize-ne::after,
        .av-resize-nw::after {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: var(--neutral-alpha-medium);
          border: 1.5px solid var(--neutral-alpha-strong);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .av-float:hover .av-resize-se::after,
        .av-float:hover .av-resize-sw::after,
        .av-float:hover .av-resize-ne::after,
        .av-float:hover .av-resize-nw::after {
          opacity: 1;
        }

        /* Edge visual hint */
        .av-resize-e::after, .av-resize-w::after {
          content: "";
          position: absolute;
          inset: 0;
          margin: auto;
          width: 3px;
          height: 40%;
          border-radius: 2px;
          background: var(--neutral-alpha-medium);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .av-resize-s::after, .av-resize-n::after {
          content: "";
          position: absolute;
          inset: 0;
          margin: auto;
          height: 3px;
          width: 40%;
          border-radius: 2px;
          background: var(--neutral-alpha-medium);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .av-float:hover .av-resize-e::after,
        .av-float:hover .av-resize-w::after,
        .av-float:hover .av-resize-s::after,
        .av-float:hover .av-resize-n::after {
          opacity: 1;
        }

        /* Mobile: hide floating panel — fall back to normal flow */
        @media (max-width: 768px) {
          .av-float {
            position: relative !important;
            left: unset !important;
            top: unset !important;
            width: 100% !important;
            max-width: 280px !important;
            height: auto !important;
            margin: 0 auto 24px;
            border-radius: 16px;
          }
          .av-canvas-wrap { height: 420px; flex: none; }
          .av-resize { display: none; }
        }
      `}</style>

      <div
        ref={panelRef}
        className={`av-float${isSnapping ? " av-snapping" : ""}`}
        style={{
          left: pos.x,
          top:  pos.y,
          width:  size.w,
          height: size.h,
        }}
      >
        {/* ── Resize handles ── */}
        {(["se","sw","ne","nw","e","w","s","n"] as const).map(dir => (
          <div
            key={dir}
            className={`av-resize av-resize-${dir}`}
            onMouseDown={onResizeStart(dir)}
            onTouchStart={onResizeStart(dir)}
          />
        ))}

        {/* ── Drag bar ── */}
        <div
          className="av-drag-bar"
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
        >
          {/* grip dots */}
          <div className="av-drag-dots">
            {[...Array(6)].map((_,i) => <span key={i} />)}
          </div>

          {/* snap-to-home button */}
          <button
            className="av-snap-btn"
            title="Reset posisi"
            onClick={snapHome}
            onMouseDown={e => e.stopPropagation()}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>

        {/* ── Content ── */}
        <div className="av-inner">
          {/* Physics lanyard card */}
          <div className="av-canvas-wrap">
            <Tilt3DCard
              src={src}
              alt={person.name}
              loaded={loaded}
              name={person.name}
              role={person.role}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = person.avatar;
              }}
            />
          </div>

          {/* Location */}
          <div className="av-location">
            <div className="av-loc-dot" />
            <span className="av-loc-text">Makassar, Indonesia</span>
          </div>

          {/* Hubungi */}
          <a href="mailto:rezarefka@gmail.com" className="av-cta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Hubungi Saya
          </a>

          {/* Resume */}
          {cvUrl && (
            <button
              type="button"
              className={`av-resume${cvClicked ? " av-resume-ok" : ""}`}
              onClick={handleCvDownload}
              aria-label="Unduh Resume"
            >
              {cvClicked ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline className="av-resume-check" points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              {cvClicked ? "Tersimpan!" : "Resume"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
