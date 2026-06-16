"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface Tilt3DCardProps {
  src: string;
  alt: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  loaded?: boolean;
  name?: string;
  role?: string;
}

interface Node { x: number; y: number; px: number; py: number; pinned?: boolean }

const SEG     = 22;
const GRAV    = 0.50;
const DAMP    = 0.974;
const STIFF   = 0.82;
const ITERS   = 26;
const SEG_LEN = 9;          // px per segment
const ROPE_L  = SEG * SEG_LEN; // total rope length
const CW      = 160;        // card width px
const CH      = Math.round(CW * 4.2 / 3); // card height

export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const nodesRef  = useRef<Node[]>([]);
  const dragRef   = useRef<{ on: boolean; idx: number; offX: number; offY: number }>({ on: false, idx: -1, offX: 0, offY: 0 });
  const tiltRef   = useRef({ rx: 0, ry: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  // Card position (center-x, top-y) in canvas coords
  const cardPosRef = useRef({ x: 0, y: 0 });
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const cvSizeRef = useRef({ w: 300, h: 600 });

  // ── Init ─────────────────────────────────────────────────────────────
  const init = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const w  = root.offsetWidth;
    const h  = root.offsetHeight || 560;
    cvSizeRef.current = { w, h };

    // Anchor di tengah atas
    const ax = w / 2;
    const ay = 18;

    // Initial card position: centered, below rope
    const cx = w / 2;
    const cy = ay + ROPE_L + CH / 2;
    cardPosRef.current = { x: cx, y: cy };

    // Init nodes lurus ke bawah menuju atas kartu
    const ns: Node[] = [];
    for (let i = 0; i <= SEG; i++) {
      const t  = i / SEG;
      const nx = ax;
      const ny = ay + t * ROPE_L;
      ns.push({ x: nx, y: ny, px: nx, py: ny, pinned: i === 0 });
    }
    nodesRef.current = ns;
  }, []);

  // ── Simulate ─────────────────────────────────────────────────────────
  const simulate = useCallback(() => {
    const ns = nodesRef.current;

    // Verlet integrate
    for (const n of ns) {
      if (n.pinned) continue;
      const vx = (n.x - n.px) * DAMP;
      const vy = (n.y - n.py) * DAMP;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + GRAV;
    }

    // Constraint: jaga panjang segmen
    for (let it = 0; it < ITERS; it++) {
      for (let i = 0; i < ns.length - 1; i++) {
        const a = ns[i], b = ns[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d  = Math.hypot(dx, dy) || 0.001;
        const df = (d - SEG_LEN) / d * STIFF * 0.5;
        if (!a.pinned) { a.x += dx * df; a.y += dy * df; }
        if (!b.pinned) { b.x -= dx * df; b.y -= dy * df; }
      }
    }

    // Lock node terakhir ke ring kartu (atas-tengah kartu)
    const tail = ns[ns.length - 1];
    const cp   = cardPosRef.current;
    const ringX = cp.x;
    const ringY = cp.y - CH / 2; // top of card
    if (!dragRef.current.on) {
      const pull = 0.18;
      tail.x += (ringX - tail.x) * pull;
      tail.y += (ringY - tail.y) * pull;
    }
  }, []);

  // ── Draw ─────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ns  = nodesRef.current;
    if (ns.length < 2) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const st = getComputedStyle(root);
    // Gunakan neutral/on-background untuk tali — elegan abu metalik
    let c1 = st.getPropertyValue("--neutral-solid-strong").trim();
    let c2 = st.getPropertyValue("--neutral-solid-medium").trim();
    if (!c1 || c1.length < 3) c1 = "#c0c4d0";
    if (!c2 || c2.length < 3) c2 = "#6b7280";

    const tail = ns[ns.length - 1];

    // ── Shadow tali ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth   = 9 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.filter  = `blur(${2.5 * dpr}px)`;
    ctx.stroke();
    ctx.filter  = "none";
    ctx.restore();

    // ── Tali layer 1: tebal gelap ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    const gDark = ctx.createLinearGradient(ns[0].x * dpr, ns[0].y * dpr, tail.x * dpr, tail.y * dpr);
    gDark.addColorStop(0,    "#1a1d26");
    gDark.addColorStop(0.4,  "#2d3042");
    gDark.addColorStop(0.8,  "#1e2130");
    gDark.addColorStop(1,    "#111320");
    ctx.strokeStyle = gDark;
    ctx.lineWidth   = 7 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    // ── Tali layer 2: serat tengah (silverish) ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    const gSilver = ctx.createLinearGradient(ns[0].x * dpr, ns[0].y * dpr, tail.x * dpr, tail.y * dpr);
    gSilver.addColorStop(0,   "#8892a4");
    gSilver.addColorStop(0.3, "#c8cdd8");
    gSilver.addColorStop(0.6, "#a0a8b8");
    gSilver.addColorStop(1,   "#6b7280");
    ctx.strokeStyle = gSilver;
    ctx.lineWidth   = 3.5 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    // ── Tali layer 3: highlight tipis ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth   = 1.2 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    // ── Titik-titik simpul tali (tekstur knot) ──
    for (let i = 2; i < ns.length - 1; i += 3) {
      const n = ns[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x * dpr, n.y * dpr, 2.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.restore();
    }

    // ── Clip metal anchor atas ──
    {
      const n0 = ns[0];
      // Badan clip
      ctx.save();
      const clipH = 16 * dpr, clipW = 10 * dpr;
      ctx.beginPath();
      ctx.roundRect(n0.x * dpr - clipW / 2, n0.y * dpr - 4 * dpr, clipW, clipH, 3 * dpr);
      const gClip = ctx.createLinearGradient(n0.x * dpr - clipW / 2, 0, n0.x * dpr + clipW / 2, 0);
      gClip.addColorStop(0,   "#374151");
      gClip.addColorStop(0.4, "#9ca3af");
      gClip.addColorStop(0.7, "#d1d5db");
      gClip.addColorStop(1,   "#4b5563");
      ctx.fillStyle = gClip;
      ctx.fill();
      ctx.restore();

      // Ring dalam clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(n0.x * dpr, n0.y * dpr + 6 * dpr, 5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
      ctx.restore();
    }

    // ── Tilt kartu dari fisika tali ──
    if (!dragRef.current.on) {
      const h  = ns[Math.max(0, ns.length - 5)];
      const dx = tail.x - h.x;
      const dy = tail.y - h.y;
      const a  = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
      const nr = Math.max(-1, Math.min(1, a / 40));
      const curr = tiltRef.current;
      const next = {
        rx: curr.rx + (nr * -5 - curr.rx) * 0.08,
        ry: curr.ry + (nr * 16 - curr.ry) * 0.08,
      };
      tiltRef.current = next;
      setTilt({ ...next });
    }

    // Update card DOM position
    const cp = cardPosRef.current;
    setCardPos({ x: cp.x, y: cp.y });
  }, []);

  // ── RAF Loop ─────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    simulate();
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [simulate, draw]);

  // ── Resize ───────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    if (!canvas || !root) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = root.offsetWidth;
    const h   = root.offsetHeight || 560;
    cvSizeRef.current = { w, h };
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    // Repin anchor
    if (nodesRef.current.length > 0) {
      const n = nodesRef.current[0];
      n.x = n.px = w / 2;
      n.y = n.py = 18;
    }
    // Recenter card
    cardPosRef.current = { x: w / 2, y: 18 + ROPE_L + CH / 2 };
  }, []);

  useEffect(() => {
    init();
    resize();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [init, resize, loop]);

  // ── Pointer utils ────────────────────────────────────────────────────
  const toCV = (clientX: number, clientY: number) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const findNode = (px: number, py: number, radius = 55) => {
    const ns = nodesRef.current;
    let best = -1, bestD = radius * radius;
    for (let i = 1; i < ns.length; i++) {
      const d = (ns[i].x - px) ** 2 + (ns[i].y - py) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const moveNode = (px: number, py: number) => {
    if (!dragRef.current.on) return;
    const i = dragRef.current.idx;
    // -2 = dragging card
    if (i === -2) {
      cardPosRef.current = { x: px + dragRef.current.offX, y: py + dragRef.current.offY };
      // Also pull last node to ring position
      const ns   = nodesRef.current;
      const tail = ns[ns.length - 1];
      const cp   = cardPosRef.current;
      tail.x = cp.x; tail.y = cp.y - CH / 2;
      tail.px = tail.x; tail.py = tail.y;
    } else {
      const n = nodesRef.current[i];
      if (n) { n.x = px; n.y = py; n.px = px; n.py = py; }
    }
  };

  const endDrag = () => { dragRef.current.on = false; };

  // Canvas events
  const onCMD = (e: React.MouseEvent) => {
    e.preventDefault();
    const p = toCV(e.clientX, e.clientY);
    const i = findNode(p.x, p.y);
    if (i !== -1) dragRef.current = { on: true, idx: i, offX: 0, offY: 0 };
  };
  const onCMM = (e: React.MouseEvent) => { moveNode(...Object.values(toCV(e.clientX, e.clientY)) as [number, number]); };
  const onCTD = (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; const p = toCV(t.clientX, t.clientY); const i = findNode(p.x, p.y); if (i !== -1) dragRef.current = { on: true, idx: i, offX: 0, offY: 0 }; };
  const onCTM = (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; const p = toCV(t.clientX, t.clientY); moveNode(p.x, p.y); };

  // Card drag — gerak kartu = tali ikut
  const startCardDrag = (clientX: number, clientY: number) => {
    const p  = toCV(clientX, clientY);
    const cp = cardPosRef.current;
    dragRef.current = { on: true, idx: -2, offX: cp.x - p.x, offY: cp.y - p.y };
  };

  const onCardMD = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startCardDrag(e.clientX, e.clientY);
    const mm = (ev: MouseEvent) => { const p = toCV(ev.clientX, ev.clientY); moveNode(p.x, p.y); };
    const mu = () => { endDrag(); window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
  };

  const onCardTD = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const t = e.touches[0];
    startCardDrag(t.clientX, t.clientY);
    const tm = (ev: TouchEvent) => { ev.preventDefault(); const tt = ev.touches[0]; const p = toCV(tt.clientX, tt.clientY); moveNode(p.x, p.y); };
    const te = () => { endDrag(); window.removeEventListener("touchmove", tm); window.removeEventListener("touchend", te); };
    window.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("touchend", te);
  };

  // Hover tilt
  const onHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.on) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    const next = { rx: (0.5 - y) * 28, ry: (x - 0.5) * 28 };
    tiltRef.current = next;
    setTilt(next);
    const gl = e.currentTarget.querySelector<HTMLElement>(".lc-glare");
    if (gl) { gl.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.30) 0%, transparent 65%)`; gl.style.opacity = "1"; }
  };
  const onHoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const gl = e.currentTarget.querySelector<HTMLElement>(".lc-glare");
    if (gl) gl.style.opacity = "0";
  };

  return (
    <>
      <style>{`
        @keyframes lcFloat {
          0%,100% { filter: drop-shadow(0 30px 18px rgba(0,0,0,0.65)) drop-shadow(0 6px 10px rgba(0,0,0,0.40)); }
          50%      { filter: drop-shadow(0 14px 10px rgba(0,0,0,0.42)) drop-shadow(0 3px 5px  rgba(0,0,0,0.25)); }
        }
        @keyframes lcGlow {
          0%,100% { opacity:0.28; }
          50%      { opacity:0.52; }
        }
        @keyframes lcShimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }

        .lc-root {
          position: relative;
          width: 100%;
          max-width: 300px;
          height: 560px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        /* Canvas full-size overlay */
        .lc-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          touch-action: none;
          cursor: grab;
          z-index: 1;
        }
        .lc-canvas:active { cursor: grabbing; }

        /* Kartu — posisi dari JS */
        .lc-card-outer {
          position: absolute;
          width: ${CW}px;
          height: ${CH}px;
          z-index: 2;
          pointer-events: auto;
          transform-style: preserve-3d;
          /* Anchor di center-x, top-y */
          transform: translate(-50%, -50%);
        }

        /* Ambient glow */
        .lc-glow {
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 50% 40%,
            var(--brand-background-strong, rgba(120,100,255,0.35)) 0%,
            var(--accent-background-strong, rgba(80,60,200,0.15)) 50%,
            transparent 75%
          );
          filter: blur(28px);
          pointer-events: none;
          z-index: 0;
          animation: lcGlow 5.5s ease-in-out infinite;
        }

        /* Frame kartu */
        .lc-card {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          overflow: hidden;
          cursor: grab;
          will-change: transform;
          animation: lcFloat 6.5s ease-in-out infinite;
          box-shadow:
            0 0 0 1.5px rgba(255,255,255,0.20),
            0 0 0 3px   rgba(0,0,0,0.60),
            0 4px  8px  rgba(0,0,0,0.45),
            0 12px 28px rgba(0,0,0,0.55),
            0 32px 64px rgba(0,0,0,0.60),
            inset 0  1.5px 0 rgba(255,255,255,0.18),
            inset 0 -1.5px 0 rgba(0,0,0,0.40),
            inset 1.5px 0 0 rgba(255,255,255,0.07),
            inset -1.5px 0 0 rgba(255,255,255,0.07);
          background: #0a0b10;
        }
        .lc-card:active { cursor: grabbing; }

        .lc-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          pointer-events: none;
          display: block;
          transition: opacity 0.5s ease;
        }

        /* Vignette radial */
        .lc-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 44%, rgba(0,0,0,0.68) 100%);
          pointer-events: none;
          z-index: 2;
        }

        /* Fade atas untuk ring */
        .lc-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 22%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* Shimmer */
        .lc-shimmer {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(110deg, transparent 32%, rgba(255,255,255,0.07) 50%, transparent 68%);
          background-size: 200% 100%;
          animation: lcShimmer 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 4;
        }

        /* Glare hover */
        .lc-glare {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 5;
          transition: opacity 0.2s ease;
        }

        /* Inner edge */
        .lc-edge {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          pointer-events: none;
          z-index: 6;
        }

        /* Lubang kartu */
        .lc-hole {
          position: absolute;
          top: 9px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 8px;
          border-radius: 5px;
          background: rgba(0,0,0,0.85);
          border: 1.5px solid rgba(255,255,255,0.12);
          z-index: 8;
        }

        /* Ring metal */
        .lc-ring {
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2.5px solid #7a8099;
          background: conic-gradient(
            from 120deg,
            #374151 0deg, #9ca3af 70deg, #e5e7eb 120deg,
            #d1d5db 160deg, #6b7280 220deg, #374151 280deg,
            #9ca3af 320deg, #374151 360deg
          );
          z-index: 9;
          box-shadow: 0 2px 6px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.22);
        }
        .lc-ring::after {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: rgba(0,0,0,0.84);
          border: 1px solid rgba(255,255,255,0.07);
        }

        @media (max-width: 680px) {
          .lc-root { max-width: 240px; height: 480px; }
        }
      `}</style>

      {/* Root container — relatif, canvas + kartu absolute di dalamnya */}
      <div className="lc-root" ref={rootRef}>

        {/* Canvas (tali + clip) — full size, di bawah kartu z-order */}
        <canvas
          ref={canvasRef}
          className="lc-canvas"
          onMouseDown={onCMD}
          onMouseMove={onCMM}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onContextMenu={e => e.preventDefault()}
          onTouchStart={onCTD}
          onTouchMove={onCTM}
          onTouchEnd={endDrag}
        />

        {/* Kartu — posisinya digerakkan JS */}
        <div
          className="lc-card-outer"
          style={{
            left: `${cardPos.x}px`,
            top:  `${cardPos.y}px`,
          }}
        >
          <div className="lc-glow" aria-hidden />
          <div
            ref={cardRef}
            className="lc-card"
            style={{
              transform: `perspective(960px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: dragRef.current.on ? "none" : "transform 0.30s cubic-bezier(0.22,1,0.36,1)",
            }}
            onMouseDown={onCardMD}
            onTouchStart={onCardTD}
            onMouseMove={onHover}
            onMouseLeave={onHoverLeave}
            onContextMenu={e => e.preventDefault()}
            role="img"
            aria-label={alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="lc-photo"
              src={src}
              alt={alt}
              onLoad={onLoad}
              onError={onError}
              draggable={false}
              style={{ opacity: loaded ? 1 : 0 }}
            />
            <div className="lc-vignette" aria-hidden />
            <div className="lc-top"      aria-hidden />
            <div className="lc-shimmer"  aria-hidden />
            <div className="lc-glare"    aria-hidden />
            <div className="lc-edge"     aria-hidden />
            <div className="lc-hole"     aria-hidden />
            <div className="lc-ring"     aria-hidden />
          </div>
        </div>
      </div>
    </>
  );
}
