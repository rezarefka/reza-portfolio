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

// ─── Verlet rope physics node ───────────────────────────────────────────────
interface Node {
  x: number; y: number;
  px: number; py: number; // previous position
  pinned?: boolean;
}

const SEGMENTS = 14;   // titik-titik tali
const GRAVITY  = 0.52;
const DAMPING  = 0.985;
const STIFFNESS = 0.88; // constraint stiffness

export function Tilt3DCard({ src, alt, onLoad, onError, loaded, name, role }: Tilt3DCardProps) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const nodesRef   = useRef<Node[]>([]);
  const dragRef    = useRef<{ dragging: boolean; nodeIdx: number }>({ dragging: false, nodeIdx: -1 });
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0 });
  const [cardPos, setCardPos]   = useState({ x: 0, y: 0 });

  // ── Inisialisasi nodes tali ──────────────────────────────────────────────
  const initNodes = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w = wrap.offsetWidth;
    const cx = w / 2;
    const nodes: Node[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      nodes.push({
        x: cx,
        y: 10 + t * 120,
        px: cx,
        py: 10 + t * 120,
        pinned: i === 0,
      });
    }
    nodesRef.current = nodes;
  }, []);

  // ── Simulasi fisika verlet ───────────────────────────────────────────────
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes.length) return;

    const segLen = 120 / SEGMENTS;

    // Update posisi (verlet integration)
    for (const n of nodes) {
      if (n.pinned) continue;
      const vx = (n.x - n.px) * DAMPING;
      const vy = (n.y - n.py) * DAMPING;
      n.px = n.x;
      n.py = n.y;
      n.x += vx;
      n.y += vy + GRAVITY;
    }

    // Constraint relaksasi
    for (let iter = 0; iter < 16; iter++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (dist - segLen) / dist * STIFFNESS * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        if (!a.pinned) { a.x += ox; a.y += oy; }
        if (!b.pinned) { b.x -= ox; b.y -= oy; }
      }
    }
  }, []);

  // ── Draw canvas ──────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes = nodesRef.current;
    if (nodes.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── Tali utama ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    }

    // Rope gradient: Navy → dark rope
    const grad = ctx.createLinearGradient(
      nodes[0].x * dpr, nodes[0].y * dpr,
      nodes[nodes.length - 1].x * dpr, nodes[nodes.length - 1].y * dpr
    );
    grad.addColorStop(0,   "#6b7fe8");
    grad.addColorStop(0.4, "#3b4cb8");
    grad.addColorStop(1,   "#1a1f6e");

    ctx.strokeStyle = grad;
    ctx.lineWidth   = 5 * dpr;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();

    // Kilau rope (highlight strip)
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth   = 1.5 * dpr;
    ctx.stroke();
    ctx.restore();

    // ── Clip ring di ujung atas tali ──
    const n0 = nodes[0];
    ctx.save();
    ctx.beginPath();
    ctx.arc(n0.x * dpr, n0.y * dpr, 7 * dpr, 0, Math.PI * 2);
    ctx.strokeStyle = "#adb5bd";
    ctx.lineWidth   = 2.5 * dpr;
    ctx.fillStyle   = "#6c757d";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // ── Update posisi kartu mengikuti ujung bawah tali ──
    const tail = nodes[nodes.length - 1];
    const head = nodes[nodes.length - 3];
    const dx = tail.x - head.x;
    const dy = tail.y - head.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

    // Tilt kartu mengikuti arah tali
    const normAngle = angle / 60; // -1 to 1 kira-kira
    setCardTilt({ rx: normAngle * -8, ry: normAngle * 22 });
    setCardPos({ x: tail.x, y: tail.y });
  }, []);

  // ── Loop animasi ─────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    simulate();
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [simulate, draw]);

  // ── Setup canvas size ────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = wrap.offsetWidth;
    const h   = 160; // tinggi area tali (canvas)
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    // Pin point di tengah atas
    if (nodesRef.current.length > 0) {
      nodesRef.current[0].x  = w / 2;
      nodesRef.current[0].y  = 14;
      nodesRef.current[0].px = w / 2;
      nodesRef.current[0].py = 14;
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

  // ── Drag / pointer helpers ────────────────────────────────────────────────
  const getLocalPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const findClosestNode = (px: number, py: number) => {
    const nodes = nodesRef.current;
    let best = -1, bestDist = 36 * 36; // 36px radius
    for (let i = 1; i < nodes.length; i++) {
      const d = (nodes[i].x - px) ** 2 + (nodes[i].y - py) ** 2;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getLocalPos(e.clientX, e.clientY);
    const idx = findClosestNode(x, y);
    if (idx !== -1) dragRef.current = { dragging: true, nodeIdx: idx };
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return;
    const { x, y } = getLocalPos(e.clientX, e.clientY);
    const n = nodesRef.current[dragRef.current.nodeIdx];
    if (n) { n.x = x; n.y = y; n.px = x; n.py = y; }
  };
  const onCanvasMouseUp = () => { dragRef.current.dragging = false; };

  const onCanvasTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const { x, y } = getLocalPos(t.clientX, t.clientY);
    const idx = findClosestNode(x, y);
    if (idx !== -1) dragRef.current = { dragging: true, nodeIdx: idx };
  };
  const onCanvasTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const { x, y } = getLocalPos(t.clientX, t.clientY);
    const n = nodesRef.current[dragRef.current.nodeIdx];
    if (n) { n.x = x; n.y = y; n.px = x; n.py = y; }
  };
  const onCanvasTouchEnd = () => { dragRef.current.dragging = false; };

  // ── Card hover tilt (override) ───────────────────────────────────────────
  const cardHoverRef  = useRef<{ active: boolean }>({ active: false });
  const cardRafRef    = useRef<number>(0);

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * 28;
    const ry = (x - 0.5) * 28;
    if (cardRafRef.current) cancelAnimationFrame(cardRafRef.current);
    cardRafRef.current = requestAnimationFrame(() => setCardTilt({ rx, ry }));

    // Glare
    const glare = card.querySelector(".lc-glare") as HTMLElement | null;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.32), rgba(255,255,255,0) 60%)`;
      glare.style.opacity = "1";
    }
  };

  const onCardMouseLeave = () => {
    cardHoverRef.current.active = false;
    const glare = cardRef.current?.querySelector(".lc-glare") as HTMLElement | null;
    if (glare) glare.style.opacity = "0";
  };

  return (
    <>
      <style>{`
        @keyframes lcFloat {
          0%, 100% { filter: drop-shadow(0 28px 18px rgba(0,0,0,0.45)); }
          50%       { filter: drop-shadow(0 18px 10px rgba(0,0,0,0.30)); }
        }
        @keyframes lcGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.1); }
        }

        .lc-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 230px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Canvas tali */
        .lc-canvas {
          display: block;
          cursor: grab;
          touch-action: none;
          width: 100%;
        }
        .lc-canvas:active { cursor: grabbing; }

        /* Glow ambient di belakang kartu */
        .lc-glow {
          position: absolute;
          inset: -40px;
          border-radius: 30px;
          background: radial-gradient(
            circle at 50% 40%,
            var(--brand-background-strong) 0%,
            var(--accent-background-strong) 40%,
            transparent 72%
          );
          filter: blur(32px);
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
          animation: lcGlow 5s ease-in-out infinite;
        }

        /* Wrapper kartu */
        .lc-card-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4.2;
        }

        /* Frame kartu utama */
        .lc-card {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          overflow: hidden;
          background: #0d0f1e;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 24px 56px -8px rgba(0,0,0,0.7),
            0 6px 20px -4px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.07);
          will-change: transform;
          transform-style: preserve-3d;
          cursor: grab;
          animation: lcFloat 5.5s ease-in-out infinite;
          z-index: 1;
        }
        .lc-card:active { cursor: grabbing; }

        /* Foto profil */
        .lc-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 65%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }

        /* Overlay gradasi foto */
        .lc-photo-grad {
          position: absolute;
          left: 0; right: 0;
          top: 50%; bottom: 0;
          background: linear-gradient(to bottom, transparent 0%, #0d0f1e 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* Konten teks kartu – ala "Builder Passport" */
        .lc-content {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          padding: 14px 14px 16px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lc-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(108,127,232,0.18);
          border: 1px solid rgba(108,127,232,0.38);
          border-radius: 5px;
          padding: 3px 7px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8fa4f8;
          width: fit-content;
        }

        .lc-name {
          font-size: 15px;
          font-weight: 800;
          color: rgba(255,255,255,0.96);
          letter-spacing: 0.01em;
          line-height: 1.15;
        }
        .lc-role {
          font-size: 10px;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .lc-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 0;
        }

        .lc-meta {
          display: flex;
          gap: 10px;
        }
        .lc-meta-item {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .lc-meta-val {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.90);
        }
        .lc-meta-key {
          font-size: 8px;
          color: rgba(255,255,255,0.36);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Status row */
        .lc-status {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .lc-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(74,222,128,0.6);
          animation: lcGlow 2.6s ease-in-out infinite;
        }
        .lc-status-text {
          font-size: 9px;
          color: rgba(74,222,128,0.85);
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        /* Efek kilau glare */
        .lc-glare {
          position: absolute;
          inset: 0;
          opacity: 0;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 3;
          transition: opacity 0.3s ease;
          border-radius: 18px;
        }

        /* Garis tepi kilap */
        .lc-edge {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          pointer-events: none;
          z-index: 4;
        }

        /* Lubang gantungan kartu */
        .lc-hole {
          position: absolute;
          top: 9px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 9px;
          border-radius: 6px;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.10);
          z-index: 5;
        }

        /* Clip/metal ring di lubang */
        .lc-ring {
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2.5px solid #8e99a4;
          background: transparent;
          z-index: 6;
        }

        @media (max-width: 680px) {
          .lc-root { max-width: 190px; }
          .lc-name { font-size: 13px; }
        }
      `}</style>

      <div className="lc-root" ref={wrapRef}>
        {/* ── Canvas tali fisika ── */}
        <canvas
          ref={canvasRef}
          className="lc-canvas"
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseUp}
          onTouchStart={onCanvasTouchStart}
          onTouchMove={onCanvasTouchMove}
          onTouchEnd={onCanvasTouchEnd}
        />

        {/* ── Kartu ID ── */}
        <div className="lc-card-wrap">
          <div className="lc-glow" aria-hidden="true" />
          <div
            ref={cardRef}
            className="lc-card"
            style={{
              transform: `perspective(900px) rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg) scale3d(1,1,1)`,
              transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
            }}
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
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
              style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
            />
            <div className="lc-photo-grad" aria-hidden="true" />

            <div className="lc-content">
              <span className="lc-badge">
                <svg width="7" height="7" viewBox="0 0 10 10" fill="currentColor">
                  <circle cx="5" cy="5" r="5"/>
                </svg>
                Builder Passport
              </span>
              <div className="lc-name">{name || alt}</div>
              <div className="lc-role">{role || "Full Stack Developer"}</div>
              <div className="lc-divider" />
              <div className="lc-meta">
                <div className="lc-meta-item">
                  <span className="lc-meta-val">2024</span>
                  <span className="lc-meta-key">Since</span>
                </div>
                <div className="lc-meta-item">
                  <span className="lc-meta-val">ID</span>
                  <span className="lc-meta-key">Origin</span>
                </div>
                <div className="lc-meta-item">
                  <span className="lc-meta-val">Web</span>
                  <span className="lc-meta-key">Stack</span>
                </div>
              </div>
              <div className="lc-status">
                <div className="lc-status-dot" />
                <span className="lc-status-text">Open to Work</span>
              </div>
            </div>

            <div className="lc-glare" aria-hidden="true" />
            <div className="lc-edge"  aria-hidden="true" />
            <div className="lc-hole"  aria-hidden="true" />
            <div className="lc-ring"  aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  );
}
