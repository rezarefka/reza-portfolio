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

const SEGMENTS  = 16;
const GRAVITY   = 0.48;
const DAMPING   = 0.982;
const STIFFNESS = 0.85;
const ROPE_LEN  = 130; // px

export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const nodesRef  = useRef<Node[]>([]);
  const dragRef   = useRef<{ active: boolean; nodeIdx: number; fromCard: boolean }>({
    active: false, nodeIdx: -1, fromCard: false,
  });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const tiltRef = useRef({ rx: 0, ry: 0 });

  // ── Inisialisasi nodes ────────────────────────────────────────────────────
  const initNodes = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const cx = root.offsetWidth / 2;
    const segLen = ROPE_LEN / SEGMENTS;
    const nodes: Node[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const y = 12 + i * segLen;
      nodes.push({ x: cx, y, px: cx, py: y, pinned: i === 0 });
    }
    nodesRef.current = nodes;
  }, []);

  // ── Simulasi Verlet ───────────────────────────────────────────────────────
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes.length) return;
    const segLen = ROPE_LEN / SEGMENTS;

    for (const n of nodes) {
      if (n.pinned) continue;
      const vx = (n.x - n.px) * DAMPING;
      const vy = (n.y - n.py) * DAMPING;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + GRAVITY;
    }

    for (let iter = 0; iter < 18; iter++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (dist - segLen) / dist * STIFFNESS * 0.5;
        if (!a.pinned) { a.x += dx * diff; a.y += dy * diff; }
        if (!b.pinned) { b.x -= dx * diff; b.y -= dy * diff; }
      }
    }
  }, []);

  // ── Draw ─────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const nodes = nodesRef.current;
    if (nodes.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ambil warna tema dari CSS var
    const style = getComputedStyle(root);
    const brandColor = style.getPropertyValue("--brand-solid-strong").trim() || "#6366f1";
    const accentColor = style.getPropertyValue("--accent-solid-strong").trim() || "#4f46e5";

    // ── Tali utama ─────────────────────────────────────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    }

    const tailNode = nodes[nodes.length - 1];
    const grad = ctx.createLinearGradient(
      nodes[0].x * dpr, nodes[0].y * dpr,
      tailNode.x * dpr, tailNode.y * dpr
    );
    grad.addColorStop(0, brandColor);
    grad.addColorStop(0.5, accentColor);
    grad.addColorStop(1, brandColor + "99");

    ctx.strokeStyle = grad;
    ctx.lineWidth   = 5 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();

    // Highlight strip
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.lineWidth   = 1.8 * dpr;
    ctx.stroke();
    ctx.restore();

    // ── Metal clip ring di anchor atas ──────────────────────────────────────
    const n0 = nodes[0];
    ctx.save();
    const ringGrad = ctx.createRadialGradient(
      (n0.x - 2) * dpr, (n0.y - 2) * dpr, 1 * dpr,
      n0.x * dpr, n0.y * dpr, 8 * dpr
    );
    ringGrad.addColorStop(0, "#d1d5db");
    ringGrad.addColorStop(1, "#6b7280");
    ctx.beginPath();
    ctx.arc(n0.x * dpr, n0.y * dpr, 7 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = ringGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(n0.x * dpr, n0.y * dpr, 4.5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fill();
    ctx.restore();

    // ── Tilt kartu ikut arah tali ───────────────────────────────────────────
    const tail  = nodes[nodes.length - 1];
    const head  = nodes[nodes.length - 4];
    const dx    = tail.x - head.x;
    const dy    = tail.y - head.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    const norm  = angle / 55;

    // Lerp halus
    const curr = tiltRef.current;
    const targetRx = norm * -6;
    const targetRy = norm * 18;
    const lerped = {
      rx: curr.rx + (targetRx - curr.rx) * 0.12,
      ry: curr.ry + (targetRy - curr.ry) * 0.12,
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

  // ── Canvas size ───────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    if (!canvas || !root) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = root.offsetWidth;
    const h   = 160;
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
    window.addEventListener("resize", resizeCanvas);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [initNodes, resizeCanvas, loop]);

  // ── Pointer helpers ───────────────────────────────────────────────────────
  const getPosOnCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getPosOnCardAsRope = (clientX: number, clientY: number) => {
    // Perlakukan kartu sebagai posisi ujung tali (node terakhir)
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // offset ke bawah canvas = posisi kartu
    const cardEl = cardRef.current;
    if (!cardEl) return { x: 0, y: 0 };
    const cardRect = cardEl.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: (cardRect.top - rect.top) + (clientY - cardRect.top),
    };
  };

  const findClosestNode = (px: number, py: number, radius = 40) => {
    const nodes = nodesRef.current;
    let best = -1, bestDist = radius * radius;
    for (let i = 1; i < nodes.length; i++) {
      const d = (nodes[i].x - px) ** 2 + (nodes[i].y - py) ** 2;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  };

  const setDragNode = (x: number, y: number) => {
    const idx = findClosestNode(x, y, 50);
    if (idx !== -1) {
      dragRef.current = { active: true, nodeIdx: idx, fromCard: false };
      return true;
    }
    return false;
  };

  const moveDragNode = (x: number, y: number) => {
    if (!dragRef.current.active) return;
    const n = nodesRef.current[dragRef.current.nodeIdx];
    if (n) { n.x = x; n.y = y; n.px = x; n.py = y; }
  };

  const stopDrag = () => {
    dragRef.current.active = false;
  };

  // Canvas events
  const onCanvasDown  = (e: React.MouseEvent) => { const p = getPosOnCanvas(e.clientX, e.clientY); setDragNode(p.x, p.y); };
  const onCanvasMove  = (e: React.MouseEvent) => { const p = getPosOnCanvas(e.clientX, e.clientY); moveDragNode(p.x, p.y); };
  const onCanvasTDown = (e: React.TouchEvent) => { const t = e.touches[0]; const p = getPosOnCanvas(t.clientX, t.clientY); setDragNode(p.x, p.y); };
  const onCanvasTMove = (e: React.TouchEvent) => { if (!dragRef.current.active) return; e.preventDefault(); const t = e.touches[0]; const p = getPosOnCanvas(t.clientX, t.clientY); moveDragNode(p.x, p.y); };

  // Card drag — tarik kartu → node terakhir ikut
  const onCardDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const nodes = nodesRef.current;
    const lastIdx = nodes.length - 1;
    dragRef.current = { active: true, nodeIdx: lastIdx, fromCard: true };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.active) return;
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      // Drag semua node belakang bersamaan (biar terasa menarik kartu)
      const n = nodesRef.current[lastIdx];
      if (n) { n.x = x; n.y = y; n.px = x; n.py = y; }
    };
    const onUp = () => {
      stopDrag();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onCardTouchDown = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const nodes = nodesRef.current;
    const lastIdx = nodes.length - 1;
    dragRef.current = { active: true, nodeIdx: lastIdx, fromCard: true };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const onMove = (ev: TouchEvent) => {
      if (!dragRef.current.active) return;
      ev.preventDefault();
      const t = ev.touches[0];
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      const n = nodesRef.current[lastIdx];
      if (n) { n.x = x; n.y = y; n.px = x; n.py = y; }
    };
    const onEnd = () => {
      stopDrag();
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  // Card hover tilt
  const onCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.active) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    const rx = (0.5 - y) * 24;
    const ry = (x - 0.5) * 24;
    tiltRef.current = { rx, ry };
    setTilt({ rx, ry });

    const glare = card.querySelector(".lc-glare") as HTMLElement | null;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.28) 0%, transparent 65%)`;
      glare.style.opacity = "1";
    }
  };
  const onCardHoverLeave = () => {
    const glare = cardRef.current?.querySelector(".lc-glare") as HTMLElement | null;
    if (glare) glare.style.opacity = "0";
  };

  return (
    <>
      <style>{`
        @keyframes lcFloat {
          0%,100% { filter: drop-shadow(0 26px 16px rgba(0,0,0,0.50)); }
          50%      { filter: drop-shadow(0 14px 8px  rgba(0,0,0,0.30)); }
        }
        @keyframes lcPulse {
          0%,100% { opacity:0.4; transform:scale(1); }
          50%      { opacity:0.7; transform:scale(1.08); }
        }

        /* Root container — canvas + card stacked vertically */
        .lc-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 220px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Canvas tali — sama lebar dengan root */
        .lc-canvas {
          display: block;
          width: 100%;
          cursor: grab;
          touch-action: none;
          flex-shrink: 0;
        }
        .lc-canvas:active { cursor: grabbing; }

        /* Wrapper kartu */
        .lc-card-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          margin-top: -4px; /* tempel ke ujung canvas */
        }

        /* Glow ambient */
        .lc-glow {
          position: absolute;
          inset: -36px;
          border-radius: 28px;
          background: radial-gradient(
            circle at 50% 35%,
            var(--brand-background-strong, rgba(99,102,241,0.4)) 0%,
            var(--accent-background-strong, rgba(79,70,229,0.2)) 40%,
            transparent 70%
          );
          filter: blur(28px);
          opacity: 0.45;
          pointer-events: none;
          z-index: 0;
          animation: lcPulse 5s ease-in-out infinite;
        }

        /* Frame kartu */
        .lc-card {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          overflow: hidden;
          background: #0d0f1a;
          border: 2px solid rgba(255,255,255,0.14);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 20px 50px -6px rgba(0,0,0,0.75),
            0 4px 16px -4px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.08);
          will-change: transform;
          transform-style: preserve-3d;
          cursor: grab;
          z-index: 1;
          animation: lcFloat 5.5s ease-in-out infinite;
        }
        .lc-card:active { cursor: grabbing; }

        /* Foto memenuhi kartu */
        .lc-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.4s ease;
        }

        /* Overlay ringan di bawah foto — supaya ring/lubang terlihat */
        .lc-top-fade {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 22%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%);
          z-index: 2;
          pointer-events: none;
        }

        /* Kilau glare */
        .lc-glare {
          position: absolute;
          inset: 0;
          opacity: 0;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 3;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }

        /* Border edge highlight */
        .lc-edge {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.09);
          pointer-events: none;
          z-index: 4;
        }

        /* Lubang gantungan */
        .lc-hole {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 8px;
          border-radius: 5px;
          background: rgba(0,0,0,0.65);
          border: 1px solid rgba(255,255,255,0.12);
          z-index: 5;
        }

        /* Metal ring di lubang */
        .lc-ring {
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2.5px solid #9ca3af;
          background: radial-gradient(circle at 38% 38%, #e5e7eb, #6b7280);
          z-index: 6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        @media (max-width: 680px) {
          .lc-root { max-width: 185px; }
        }
      `}</style>

      <div className="lc-root" ref={rootRef}>
        {/* ── Canvas tali ── */}
        <canvas
          ref={canvasRef}
          className="lc-canvas"
          onMouseDown={onCanvasDown}
          onMouseMove={onCanvasMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={onCanvasTDown}
          onTouchMove={onCanvasTMove}
          onTouchEnd={stopDrag}
        />

        {/* ── Kartu ID ── */}
        <div className="lc-card-wrap">
          <div className="lc-glow" aria-hidden="true" />
          <div
            ref={cardRef}
            className="lc-card"
            style={{
              transform: `perspective(880px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: dragRef.current.active
                ? "none"
                : "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
            }}
            onMouseDown={onCardDown}
            onTouchStart={onCardTouchDown}
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
            <div className="lc-top-fade" aria-hidden="true" />
            <div className="lc-glare"   aria-hidden="true" />
            <div className="lc-edge"    aria-hidden="true" />
            <div className="lc-hole"    aria-hidden="true" />
            <div className="lc-ring"    aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  );
}
