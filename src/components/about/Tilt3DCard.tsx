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

interface Node {
  x: number; y: number;
  px: number; py: number;
  pinned?: boolean;
}

const SEGMENTS  = 18;
const GRAVITY   = 0.45;
const DAMPING   = 0.978;
const STIFFNESS = 0.82;

export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const nodesRef  = useRef<Node[]>([]);
  const dragRef   = useRef<{ active: boolean; nodeIdx: number }>({ active: false, nodeIdx: -1 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const tiltRef = useRef({ rx: 0, ry: 0 });

  // Ukuran dinamis
  const sizeRef = useRef({ w: 220, canvasH: 150, cardH: 280 });

  const getSegLen = () => sizeRef.current.canvasH / SEGMENTS;

  // ── Init nodes — posisi awal menggantung lurus ──────────────────────────
  const initNodes = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const w = root.offsetWidth;
    const cx = w / 2;
    const segLen = getSegLen();
    const nodes: Node[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const y = 12 + i * segLen;
      nodes.push({ x: cx, y, px: cx, py: y, pinned: i === 0 });
    }
    nodesRef.current = nodes;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Verlet simulation ────────────────────────────────────────────────────
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes.length) return;
    const segLen = getSegLen();

    for (const n of nodes) {
      if (n.pinned) continue;
      const vx = (n.x - n.px) * DAMPING;
      const vy = (n.y - n.py) * DAMPING;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + GRAVITY;
    }
    for (let iter = 0; iter < 20; iter++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (dist - segLen) / dist * STIFFNESS * 0.5;
        if (!a.pinned) { a.x += dx * diff; a.y += dy * diff; }
        if (!b.pinned) { b.x -= dx * diff; b.y -= dy * diff; }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draw canvas ──────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    const cardWrap = cardWrapRef.current;
    if (!canvas || !root || !cardWrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const nodes = nodesRef.current;
    if (nodes.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Baca CSS var warna tema
    const st = getComputedStyle(root);
    const c1 = st.getPropertyValue("--brand-solid-strong").trim() || "#6366f1";
    const c2 = st.getPropertyValue("--accent-solid-strong").trim() || "#4f46e5";

    // ── Shadow tali ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 7 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.filter = `blur(${2 * dpr}px)`;
    ctx.stroke();
    ctx.filter = "none";
    ctx.restore();

    // ── Tali utama (gradient tema) ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    const tail = nodes[nodes.length - 1];
    const grad = ctx.createLinearGradient(nodes[0].x * dpr, nodes[0].y * dpr, tail.x * dpr, tail.y * dpr);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c1 + "bb");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();

    // ── Highlight strip tali ──
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();
    ctx.restore();

    // ── Metal clip ring anchor atas ──
    const n0 = nodes[0];
    ctx.save();
    const rg = ctx.createRadialGradient((n0.x-2)*dpr, (n0.y-2)*dpr, 1*dpr, n0.x*dpr, n0.y*dpr, 8*dpr);
    rg.addColorStop(0, "#e5e7eb");
    rg.addColorStop(1, "#4b5563");
    ctx.beginPath();
    ctx.arc(n0.x*dpr, n0.y*dpr, 8*dpr, 0, Math.PI*2);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(n0.x*dpr, n0.y*dpr, 5*dpr, 0, Math.PI*2);
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fill();
    ctx.restore();

    // ── Tilt kartu ikut arah tali ujung ──
    const headN = nodes[nodes.length - 4];
    const dx = tail.x - headN.x;
    const dy = tail.y - headN.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    const norm = Math.max(-1, Math.min(1, angle / 50));
    const curr = tiltRef.current;
    const lerped = {
      rx: curr.rx + (norm * -5 - curr.rx) * 0.10,
      ry: curr.ry + (norm * 16 - curr.ry) * 0.10,
    };
    tiltRef.current = lerped;
    setTilt({ ...lerped });
  }, []);

  // ── RAF Loop ──────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    simulate();
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [simulate, draw]);

  // ── Resize canvas ─────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    const cardWrap = cardWrapRef.current;
    if (!canvas || !root || !cardWrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = root.offsetWidth;
    const h   = sizeRef.current.canvasH;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    if (nodesRef.current.length > 0) {
      const n = nodesRef.current[0];
      n.x = n.px = w / 2;
      n.y = n.py = 12;
    }
  }, []);

  useEffect(() => {
    initNodes();
    resizeCanvas();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", () => { resizeCanvas(); });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [initNodes, resizeCanvas, loop]);

  // ── Pointer utils ─────────────────────────────────────────────────────────
  const toCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  // Konversi posisi di kartu ke koordinat canvas
  // Canvas height = 150px, kartu dimulai persis setelah canvas
  // Tapi node terakhir berada di y ≈ canvasH (ujung canvas = atas kartu)
  const toCardAsCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const cardWrap = cardWrapRef.current;
    if (!canvas || !cardWrap) return { x: 0, y: 0 };
    const cr = canvas.getBoundingClientRect();
    const wr = cardWrap.getBoundingClientRect();
    // offset dari atas canvas
    return {
      x: clientX - cr.left,
      y: (wr.top - cr.top) + (clientY - wr.top),
    };
  };

  const findClosestNode = (px: number, py: number, radius = 48) => {
    const nodes = nodesRef.current;
    let best = -1, bestD = radius * radius;
    for (let i = 1; i < nodes.length; i++) {
      const d = (nodes[i].x - px) ** 2 + (nodes[i].y - py) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const applyDrag = (x: number, y: number) => {
    if (!dragRef.current.active) return;
    const n = nodesRef.current[dragRef.current.nodeIdx];
    if (n) { n.x = x; n.y = y; n.px = x; n.py = y; }
  };

  const stopDrag = () => { dragRef.current.active = false; };

  // Canvas mouse
  const onCMD = (e: React.MouseEvent) => {
    const p = toCanvasPos(e.clientX, e.clientY);
    const idx = findClosestNode(p.x, p.y);
    if (idx !== -1) dragRef.current = { active: true, nodeIdx: idx };
  };
  const onCMM = (e: React.MouseEvent) => { const p = toCanvasPos(e.clientX, e.clientY); applyDrag(p.x, p.y); };

  // Canvas touch
  const onCTD = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const p = toCanvasPos(t.clientX, t.clientY);
    const idx = findClosestNode(p.x, p.y);
    if (idx !== -1) dragRef.current = { active: true, nodeIdx: idx };
  };
  const onCTM = (e: React.TouchEvent) => {
    if (!dragRef.current.active) return;
    e.preventDefault();
    const t = e.touches[0];
    const p = toCanvasPos(t.clientX, t.clientY);
    applyDrag(p.x, p.y);
  };

  // Card drag — tarik kartu → node terakhir ikut cursor
  const startCardDrag = (clientX: number, clientY: number) => {
    const nodes = nodesRef.current;
    const lastIdx = nodes.length - 1;
    dragRef.current = { active: true, nodeIdx: lastIdx };
    // Snap node terakhir ke posisi cursor saat ini
    const p = toCardAsCanvasPos(clientX, clientY);
    const n = nodes[lastIdx];
    if (n) { n.x = p.x; n.y = p.y; n.px = p.x; n.py = p.y; }
  };

  const onCardMD = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    startCardDrag(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.active) return;
      const p = toCardAsCanvasPos(ev.clientX, ev.clientY);
      applyDrag(p.x, p.y);
    };
    const onUp = () => {
      stopDrag();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onCardTD = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const t = e.touches[0];
    startCardDrag(t.clientX, t.clientY);
    const onMove = (ev: TouchEvent) => {
      if (!dragRef.current.active) return;
      ev.preventDefault();
      const tt = ev.touches[0];
      const p = toCardAsCanvasPos(tt.clientX, tt.clientY);
      applyDrag(p.x, p.y);
    };
    const onEnd = () => {
      stopDrag();
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  // Card hover tilt (saat tidak di-drag)
  const onCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.active) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    const rx = (0.5 - y) * 22;
    const ry = (x - 0.5) * 22;
    tiltRef.current = { rx, ry };
    setTilt({ rx, ry });
    const glare = el.querySelector(".lc-glare") as HTMLElement | null;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.25) 0%, transparent 65%)`;
      glare.style.opacity = "1";
    }
  };
  const onCardHoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const glare = e.currentTarget.querySelector(".lc-glare") as HTMLElement | null;
    if (glare) glare.style.opacity = "0";
  };

  return (
    <>
      <style>{`
        @keyframes lcFloat {
          0%,100% { filter: drop-shadow(0 28px 18px rgba(0,0,0,0.55)) drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
          50%      { filter: drop-shadow(0 14px 10px rgba(0,0,0,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        }
        @keyframes lcGlow {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 0.60; transform: scale(1.06); }
        }
        @keyframes lcShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .lc-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 210px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        /* Canvas tali — no gap ke kartu */
        .lc-canvas {
          display: block;
          width: 100%;
          touch-action: none;
          cursor: grab;
          flex-shrink: 0;
          margin-bottom: 0;
        }
        .lc-canvas:active { cursor: grabbing; }

        /* Wrapper kartu */
        .lc-card-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          margin-top: -1px;
        }

        /* Ambient glow */
        .lc-glow {
          position: absolute;
          inset: -40px -20px;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 50% 40%,
            var(--brand-background-strong, rgba(99,102,241,0.35)) 0%,
            var(--accent-background-strong, rgba(79,70,229,0.18)) 45%,
            transparent 72%
          );
          filter: blur(30px);
          pointer-events: none;
          z-index: 0;
          animation: lcGlow 5.5s ease-in-out infinite;
        }

        /* ── Frame utama kartu — elegan ── */
        .lc-card {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          overflow: hidden;
          cursor: grab;
          z-index: 1;
          will-change: transform;
          transform-style: preserve-3d;
          animation: lcFloat 6s ease-in-out infinite;

          /* Multi-layer border untuk kesan premium */
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.20),
            0 0 0 2px rgba(255,255,255,0.06),
            0 0 0 3px rgba(0,0,0,0.50),
            0 28px 60px -8px rgba(0,0,0,0.80),
            0 8px 24px -4px rgba(0,0,0,0.50),
            inset 0 1px 0 rgba(255,255,255,0.14),
            inset 0 -1px 0 rgba(0,0,0,0.3);
          background: #0c0d14;
        }
        .lc-card:active { cursor: grabbing; }

        /* Foto memenuhi seluruh kartu */
        .lc-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.5s ease;
        }

        /* Vignette halus di tepi */
        .lc-vignette {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: radial-gradient(
            ellipse at 50% 50%,
            transparent 55%,
            rgba(0,0,0,0.55) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        /* Overlay atas tipis — supaya ring kelihatan */
        .lc-top-overlay {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 20%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* Shimmer border — subtle animated */
        .lc-shimmer {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,0.06) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: lcShimmer 4s ease-in-out infinite;
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
          transition: opacity 0.25s ease;
        }

        /* Inner border edge highlight */
        .lc-edge {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          pointer-events: none;
          z-index: 6;
        }

        /* Corner accents — elegan */
        .lc-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          z-index: 7;
          pointer-events: none;
        }
        .lc-corner::before, .lc-corner::after {
          content: "";
          position: absolute;
          background: rgba(255,255,255,0.40);
        }
        .lc-corner::before { width: 100%; height: 1.5px; top: 0; left: 0; }
        .lc-corner::after  { width: 1.5px; height: 100%; top: 0; left: 0; }
        .lc-corner.tl { top: 10px; left: 10px; }
        .lc-corner.tr { top: 10px; right: 10px; transform: scaleX(-1); }
        .lc-corner.bl { bottom: 10px; left: 10px; transform: scaleY(-1); }
        .lc-corner.br { bottom: 10px; right: 10px; transform: scale(-1); }

        /* Lubang gantungan */
        .lc-hole {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 26px;
          height: 8px;
          border-radius: 5px;
          background: rgba(0,0,0,0.75);
          border: 1px solid rgba(255,255,255,0.14);
          z-index: 8;
        }

        /* Metal ring — detail premium */
        .lc-ring {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2.5px solid #9ca3af;
          background: conic-gradient(
            from 135deg,
            #6b7280 0deg,
            #e5e7eb 90deg,
            #9ca3af 180deg,
            #374151 270deg,
            #6b7280 360deg
          );
          z-index: 9;
          box-shadow:
            0 2px 6px rgba(0,0,0,0.6),
            inset 0 1px 2px rgba(255,255,255,0.3);
        }
        /* Lubang dalam ring */
        .lc-ring::after {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: rgba(0,0,0,0.80);
          border: 1px solid rgba(255,255,255,0.08);
        }

        @media (max-width: 680px) {
          .lc-root { max-width: 175px; }
        }
      `}</style>

      <div className="lc-root" ref={rootRef}>
        {/* ── Canvas tali fisika ── */}
        <canvas
          ref={canvasRef}
          className="lc-canvas"
          style={{ height: `${sizeRef.current.canvasH}px` }}
          onMouseDown={onCMD}
          onMouseMove={onCMM}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={onCTD}
          onTouchMove={onCTM}
          onTouchEnd={stopDrag}
        />

        {/* ── ID Card ── */}
        <div className="lc-card-wrap" ref={cardWrapRef}>
          <div className="lc-glow" aria-hidden="true" />
          <div
            className="lc-card"
            style={{
              transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: dragRef.current.active ? "none" : "transform 0.30s cubic-bezier(0.22,1,0.36,1)",
            }}
            onMouseDown={onCardMD}
            onTouchStart={onCardTD}
            onMouseMove={onCardHover}
            onMouseLeave={onCardHoverLeave}
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
              style={{ opacity: loaded ? 1 : 0 }}
            />
            <div className="lc-vignette"     aria-hidden="true" />
            <div className="lc-top-overlay"  aria-hidden="true" />
            <div className="lc-shimmer"      aria-hidden="true" />
            <div className="lc-glare"        aria-hidden="true" />
            <div className="lc-edge"         aria-hidden="true" />
            <div className="lc-corner tl"    aria-hidden="true" />
            <div className="lc-corner tr"    aria-hidden="true" />
            <div className="lc-corner bl"    aria-hidden="true" />
            <div className="lc-corner br"    aria-hidden="true" />
            <div className="lc-hole"         aria-hidden="true" />
            <div className="lc-ring"         aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  );
}
