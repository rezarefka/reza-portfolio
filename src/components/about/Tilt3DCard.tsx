"use client";

import { useRef, useEffect, useCallback } from "react";

interface Tilt3DCardProps {
  src: string;
  alt: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  loaded?: boolean;
  name?: string;
  role?: string;
}

// ─── Konstanta ────────────────────────────────────────────────────────────────
const CARD_W    = 150;
const CARD_H    = 210;
const ROPE_SEGS = 18;         // jumlah link tali
const LINK_LEN  = 9;          // panjang tiap link (px)
const STIFFNESS = 0.12;       // kekakuan constraint tali (0-1)

export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef   = useRef<{
    // Anchor titik gantung (fixed)
    anchor: { x: number; y: number };
    // Nodes tali: posisi + velocity
    nodes: { x: number; y: number; vx: number; vy: number; pinned: boolean }[];
    // Kartu: posisi center + velocity + rotation
    card: { x: number; y: number; vx: number; vy: number; angle: number; av: number };
    // Drag state
    drag: { active: boolean; target: "rope" | "card" | null; nodeIdx: number; offX: number; offY: number };
    // Ukuran canvas
    W: number;
    H: number;
    raf: number;
    // Tilt render
    tiltRx: number;
    tiltRy: number;
  } | null>(null);

  const cardElRef = useRef<HTMLDivElement>(null);

  // ─── Init physics ─────────────────────────────────────────────────────────
  const initPhysics = useCallback((W: number, H: number) => {
    const ax = W / 2;
    const ay = 20;

    // Inisialisasi nodes tali lurus ke bawah
    const nodes = Array.from({ length: ROPE_SEGS + 1 }, (_, i) => ({
      x: ax,
      y: ay + i * LINK_LEN,
      vx: 0,
      vy: 0,
      pinned: i === 0,
    }));

    const ropeBottom = ay + ROPE_SEGS * LINK_LEN;

    stateRef.current = {
      anchor: { x: ax, y: ay },
      nodes,
      card: {
        x: ax,
        y: ropeBottom + CARD_H / 2 + 2,
        vx: 0,
        vy: 0,
        angle: 0,
        av: 0,
      },
      drag: { active: false, target: null, nodeIdx: -1, offX: 0, offY: 0 },
      W,
      H,
      raf: 0,
      tiltRx: 0,
      tiltRy: 0,
    };
  }, []);

  // ─── Physics step ────────────────────────────────────────────────────────
  const step = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const { nodes, card, drag } = s;

    const GRAVITY   = 0.55;
    const DAMPING   = 0.97;
    const ANG_DAMP  = 0.92;
    const ITERS     = 20;

    // ── Integrate nodes ──
    for (const n of nodes) {
      if (n.pinned) continue;
      n.vy += GRAVITY;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x  += n.vx;
      n.y  += n.vy;
    }

    // ── Constraint: panjang link tali ──
    for (let iter = 0; iter < ITERS; iter++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const diff = (dist - LINK_LEN) / dist * STIFFNESS;
        if (!a.pinned) { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; }
        if (!b.pinned) { b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
      }
    }

    // ── Integrate kartu (rigid body sederhana) ──
    if (!drag.active || drag.target !== "card") {
      card.vy += GRAVITY * 0.5;
      card.vx *= DAMPING;
      card.vy *= DAMPING;
      card.av *= ANG_DAMP;
      card.x  += card.vx;
      card.y  += card.vy;
      card.angle += card.av;
    }

    // ── Constraint: node terakhir tali ke ring kartu ──
    // Ring = titik tengah atas kartu
    const tail  = nodes[nodes.length - 1];
    const ringX = card.x;
    const ringY = card.y - CARD_H / 2;

    if (!drag.active) {
      const dx   = tail.x - ringX;
      const dy   = tail.y - ringY;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist > 0.5) {
        const pull = 0.25;
        // Tarik node terakhir ke ring
        tail.x -= dx * pull;
        tail.y -= dy * pull;
        // Tarik kartu ke node terakhir (ringan)
        card.x += dx * pull * 0.3;
        card.y += dy * pull * 0.3;
        // Tambah angular velocity berdasarkan tarikan
        card.av += (dx * 0.002);
      }
    } else if (drag.target === "card") {
      // Saat drag kartu, paksa node terakhir ke ring
      tail.x = card.x;
      tail.y = card.y - CARD_H / 2;
      tail.vx = card.vx;
      tail.vy = card.vy;
    }

    // ── Tilt visual dari fisika tali ──
    if (!drag.active) {
      const h   = nodes[Math.max(0, nodes.length - 5)];
      const ddx = tail.x - h.x;
      const ddy = tail.y - h.y;
      const ang = Math.atan2(ddy, ddx) * (180 / Math.PI) - 90;
      const nr  = Math.max(-1, Math.min(1, ang / 45));
      s.tiltRx  += (-5 * nr - s.tiltRx) * 0.08;
      s.tiltRy  += (16 * nr - s.tiltRy) * 0.08;
    }
  }, []);

  // ─── Render canvas ────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { nodes, card } = s;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Baca CSS var warna tema (abu metalik, elegan)
    const root = containerRef.current;
    const st = root ? getComputedStyle(root) : null;

    // ── TALI ──────────────────────────────────────────────────────────────

    // Shadow blur tali
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 10 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.filter = `blur(${3 * dpr}px)`;
    ctx.stroke();
    ctx.filter = "none";
    ctx.restore();

    // Layer 1: tubuh tali gelap
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    const tail = nodes[nodes.length - 1];
    const g1 = ctx.createLinearGradient(nodes[0].x * dpr, nodes[0].y * dpr, tail.x * dpr, tail.y * dpr);
    g1.addColorStop(0,    "#1c1f2e");
    g1.addColorStop(0.35, "#2a2d3e");
    g1.addColorStop(0.7,  "#1a1d2c");
    g1.addColorStop(1,    "#111320");
    ctx.strokeStyle = g1;
    ctx.lineWidth = 8 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    // Layer 2: serat metalik tengah
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    const g2 = ctx.createLinearGradient(nodes[0].x * dpr, nodes[0].y * dpr, tail.x * dpr, tail.y * dpr);
    g2.addColorStop(0,   "#7c8499");
    g2.addColorStop(0.2, "#b8bfcc");
    g2.addColorStop(0.5, "#e2e5ec");
    g2.addColorStop(0.8, "#a0a8b5");
    g2.addColorStop(1,   "#5a6070");
    ctx.strokeStyle = g2;
    ctx.lineWidth = 4 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    // Layer 3: highlight putih tipis
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.4 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    // Titik simpul (knot texture)
    for (let i = 2; i < nodes.length - 1; i += 3) {
      const n = nodes[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x * dpr, n.y * dpr, 2.5 * dpr, 0, Math.PI * 2);
      const kg = ctx.createRadialGradient(n.x * dpr, n.y * dpr, 0, n.x * dpr, n.y * dpr, 2.5 * dpr);
      kg.addColorStop(0, "rgba(220,225,235,0.35)");
      kg.addColorStop(1, "rgba(80,90,110,0.10)");
      ctx.fillStyle = kg;
      ctx.fill();
      ctx.restore();
    }

    // ── CLIP ANCHOR ATAS ──────────────────────────────────────────────────
    {
      const n0 = nodes[0];
      const cx = n0.x * dpr, cy = n0.y * dpr;

      // Badan clip (carabiner style)
      ctx.save();
      const clipW = 12 * dpr, clipH = 18 * dpr, r = 4 * dpr;
      const x0 = cx - clipW / 2, y0 = cy - 3 * dpr;
      ctx.beginPath();
      ctx.moveTo(x0 + r, y0);
      ctx.lineTo(x0 + clipW - r, y0);
      ctx.arcTo(x0 + clipW, y0, x0 + clipW, y0 + r, r);
      ctx.lineTo(x0 + clipW, y0 + clipH - r);
      ctx.arcTo(x0 + clipW, y0 + clipH, x0 + clipW - r, y0 + clipH, r);
      ctx.lineTo(x0 + r, y0 + clipH);
      ctx.arcTo(x0, y0 + clipH, x0, y0 + clipH - r, r);
      ctx.lineTo(x0, y0 + r);
      ctx.arcTo(x0, y0, x0 + r, y0, r);
      ctx.closePath();
      const gc = ctx.createLinearGradient(x0, 0, x0 + clipW, 0);
      gc.addColorStop(0,   "#2d3142");
      gc.addColorStop(0.4, "#8b92a8");
      gc.addColorStop(0.65,"#d4d8e4");
      gc.addColorStop(1,   "#3a3f55");
      ctx.fillStyle = gc;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
      ctx.restore();

      // Lubang dalam clip
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6 * dpr, 4 * dpr, 5 * dpr, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
      ctx.restore();
    }

    // ── KARTU (canvas render untuk transformasi) ────────────────────────────
    // Kartu dirender di canvas juga — transformasi dengan matrix
    // Sehingga bisa rotate dan berpindah bebas
    {
      const cx   = card.x * dpr;
      const cy   = card.y * dpr;
      const cw   = CARD_W * dpr;
      const ch   = CARD_H * dpr;
      const brad = 18 * dpr;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(card.angle);

      // ── Shadow kartu ──
      ctx.shadowColor   = "rgba(0,0,0,0.75)";
      ctx.shadowBlur    = 40 * dpr;
      ctx.shadowOffsetY = 18 * dpr;

      // ── Frame kartu rounded rect ──
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, brad);

      // Gradient background kartu (dark, elegan)
      const bgGrad = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2);
      bgGrad.addColorStop(0,    "#0e1018");
      bgGrad.addColorStop(0.5,  "#12151f");
      bgGrad.addColorStop(1,    "#0a0c13");
      ctx.fillStyle = bgGrad;
      ctx.fill();
      ctx.shadowColor = "transparent";

      // ── Border elegan ──
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, brad);
      const borderGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
      borderGrad.addColorStop(0,   "rgba(255,255,255,0.22)");
      borderGrad.addColorStop(0.4, "rgba(255,255,255,0.08)");
      borderGrad.addColorStop(0.7, "rgba(255,255,255,0.16)");
      borderGrad.addColorStop(1,   "rgba(255,255,255,0.05)");
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      ctx.restore();
    }

    // Update kartu DOM element (foto)
    const cardEl = cardElRef.current;
    if (cardEl) {
      const rx = s.tiltRx;
      const ry = s.tiltRy;
      cardEl.style.left      = `${card.x}px`;
      cardEl.style.top       = `${card.y}px`;
      cardEl.style.transform = `translate(-50%,-50%) rotate(${card.angle}rad) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  }, []);

  // ─── RAF Loop ─────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    step();
    render();
    if (stateRef.current) {
      stateRef.current.raf = requestAnimationFrame(loop);
    }
  }, [step, render]);

  // ─── Resize ───────────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const cont   = containerRef.current;
    if (!canvas || !cont) return;
    const dpr = window.devicePixelRatio || 1;
    const W   = cont.offsetWidth;
    const H   = cont.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    if (stateRef.current) {
      stateRef.current.W = W;
      stateRef.current.H = H;
      // Repin anchor
      const n = stateRef.current.nodes[0];
      n.x = n.pinned ? W / 2 : n.x;
    }
  }, []);

  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const W = cont.offsetWidth;
    const H = cont.offsetHeight;
    initPhysics(W, H);
    resize();
    const id = requestAnimationFrame(loop);
    if (stateRef.current) stateRef.current.raf = id;
    window.addEventListener("resize", resize);
    return () => {
      if (stateRef.current) cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener("resize", resize);
    };
  }, [initPhysics, resize, loop]);

  // ─── Pointer helpers ──────────────────────────────────────────────────────
  const toLocal = (clientX: number, clientY: number) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const hitCard = (lx: number, ly: number) => {
    const s = stateRef.current;
    if (!s) return false;
    const { card } = s;
    // Transform ke card-local space (account for rotation)
    const dx  = lx - card.x;
    const dy  = ly - card.y;
    const cos = Math.cos(-card.angle);
    const sin = Math.sin(-card.angle);
    const rx  = dx * cos - dy * sin;
    const ry  = dx * sin + dy * cos;
    return Math.abs(rx) < CARD_W / 2 + 10 && Math.abs(ry) < CARD_H / 2 + 10;
  };

  const hitRope = (lx: number, ly: number) => {
    const s = stateRef.current;
    if (!s) return -1;
    const ns = s.nodes;
    let best = -1, bestD = 30 * 30;
    for (let i = 1; i < ns.length; i++) {
      const d = (ns[i].x - lx) ** 2 + (ns[i].y - ly) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const startDrag = (clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (!s) return;
    const p = toLocal(clientX, clientY);

    if (hitCard(p.x, p.y)) {
      s.drag = { active: true, target: "card", nodeIdx: -1, offX: p.x - s.card.x, offY: p.y - s.card.y };
      return;
    }
    const ri = hitRope(p.x, p.y);
    if (ri !== -1) {
      s.drag = { active: true, target: "rope", nodeIdx: ri, offX: 0, offY: 0 };
    }
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (!s || !s.drag.active) return;
    const p = toLocal(clientX, clientY);

    if (s.drag.target === "card") {
      const newX = p.x - s.drag.offX;
      const newY = p.y - s.drag.offY;
      // Velocity dari gerakan
      s.card.vx = newX - s.card.x;
      s.card.vy = newY - s.card.y;
      s.card.x  = newX;
      s.card.y  = newY;
      // Node terakhir ikut kartu
      const tail = s.nodes[s.nodes.length - 1];
      tail.x = newX; tail.y = newY - CARD_H / 2;
    } else if (s.drag.target === "rope") {
      const n = s.nodes[s.drag.nodeIdx];
      if (n) { n.x = p.x; n.y = p.y; n.vx = 0; n.vy = 0; }
    }
  };

  const endDrag = () => {
    const s = stateRef.current;
    if (s) s.drag.active = false;
  };

  // Mouse events
  const onMD = (e: React.MouseEvent) => { e.preventDefault(); startDrag(e.clientX, e.clientY); };
  const onMM = (e: React.MouseEvent) => { moveDrag(e.clientX, e.clientY); };
  const onTD = (e: React.TouchEvent) => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); };
  const onTM = (e: React.TouchEvent) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); };

  return (
    <>
      <style>{`
        @keyframes lcFloat {
          0%,100% { box-shadow: 0 28px 56px -8px rgba(0,0,0,0.75), 0 8px 20px -4px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.4); }
          50%      { box-shadow: 0 14px 32px -4px rgba(0,0,0,0.55), 0 4px 10px -2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.4); }
        }
        @keyframes lcGlow {
          0%,100% { opacity:0.30; }
          50%      { opacity:0.55; }
        }
        @keyframes lcShimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }

        .lc-root {
          position: relative;
          width: 100%;
          max-width: 300px;
          height: 540px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        /* Canvas penuh — tali + frame kartu */
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

        /* Foto kartu — absolute, digerakkan JS */
        .lc-card-photo {
          position: absolute;
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          pointer-events: none;
          z-index: 2;
          border-radius: 18px;
          overflow: hidden;
          will-change: transform, left, top;
        }

        /* Ambient glow */
        .lc-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            ellipse at 50% 50%,
            var(--brand-background-strong, rgba(120,100,240,0.38)) 0%,
            transparent 70%
          );
          filter: blur(30px);
          pointer-events: none;
          z-index: 0;
          animation: lcGlow 5.5s ease-in-out infinite;
        }

        .lc-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.5s ease;
          pointer-events: none;
          border-radius: 18px;
        }

        /* Vignette */
        .lc-vignette {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%);
          pointer-events: none;
          z-index: 2;
        }

        /* Top fade */
        .lc-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 20%;
          border-radius: 18px 18px 0 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* Shimmer */
        .lc-shimmer {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: lcShimmer 4.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 4;
        }

        /* Ring gantung */
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
          .lc-root { max-width: 250px; height: 460px; }
        }
      `}</style>

      <div className="lc-root" ref={containerRef}>
        {/* Canvas: tali + frame kartu canvas-rendered */}
        <canvas
          ref={canvasRef}
          className="lc-canvas"
          onMouseDown={onMD}
          onMouseMove={onMM}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onContextMenu={e => e.preventDefault()}
          onTouchStart={onTD}
          onTouchMove={onTM}
          onTouchEnd={endDrag}
        />

        {/* Foto di DOM — overlap canvas, posisi diupdate JS */}
        <div
          ref={cardElRef}
          className="lc-card-photo"
          style={{
            left: "50%",
            top:  `${20 + ROPE_SEGS * LINK_LEN + CARD_H / 2 + 2}px`,
            transform: "translate(-50%,-50%)",
          }}
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
          <div className="lc-hole"     aria-hidden />
          <div className="lc-ring"     aria-hidden />
        </div>

        {/* Glow ikut posisi kartu — update via JS juga */}
        <div
          className="lc-glow"
          aria-hidden
          style={{ left: "50%", top: `${20 + ROPE_SEGS * LINK_LEN + CARD_H / 2}px` }}
        />
      </div>
    </>
  );
}
