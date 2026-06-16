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

interface Vec2 { x: number; y: number }
interface Node extends Vec2 { px: number; py: number; pinned?: boolean }

const SEG       = 20;
const GRAVITY   = 0.52;
const DAMPING   = 0.975;
const STIFF     = 0.84;
const ROPE_H    = 160; // canvas height px
const CARD_W    = 210; // max card width px

export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const rootRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const nodesRef   = useRef<Node[]>([]);
  const dragRef    = useRef<{ on: boolean; idx: number }>({ on: false, idx: -1 });
  const tiltRef    = useRef({ rx: 0, ry: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const widthRef   = useRef(CARD_W);

  // ── Init nodes lurus ke bawah ─────────────────────────────────────────
  const initNodes = useCallback(() => {
    const w  = widthRef.current;
    const cx = w / 2;
    const sl = ROPE_H / SEG;
    const ns: Node[] = [];
    for (let i = 0; i <= SEG; i++) {
      const y = 12 + i * sl;
      ns.push({ x: cx, y, px: cx, py: y, pinned: i === 0 });
    }
    nodesRef.current = ns;
  }, []);

  // ── Verlet ────────────────────────────────────────────────────────────
  const simulate = useCallback(() => {
    const ns  = nodesRef.current;
    const sl  = ROPE_H / SEG;
    for (const n of ns) {
      if (n.pinned) continue;
      const vx = (n.x - n.px) * DAMPING;
      const vy = (n.y - n.py) * DAMPING;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + GRAVITY;
    }
    for (let it = 0; it < 24; it++) {
      for (let i = 0; i < ns.length - 1; i++) {
        const a = ns[i], b = ns[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d  = Math.hypot(dx, dy) || 0.001;
        const df = (d - sl) / d * STIFF * 0.5;
        if (!a.pinned) { a.x += dx * df; a.y += dy * df; }
        if (!b.pinned) { b.x -= dx * df; b.y -= dy * df; }
      }
    }
  }, []);

  // ── Draw ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    const card   = cardRef.current;
    if (!canvas || !root || !card) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ns  = nodesRef.current;
    if (ns.length < 2) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Baca CSS var tema
    const st = getComputedStyle(root);
    let c1 = st.getPropertyValue("--brand-solid-strong").trim();
    let c2 = st.getPropertyValue("--accent-solid-strong").trim();
    // fallback kalau kosong
    if (!c1 || c1 === "0 0% 0%") c1 = "#a78bfa";
    if (!c2 || c2 === "0 0% 0%") c2 = "#7c3aed";

    const tail = ns[ns.length - 1];
    const w    = widthRef.current;

    // ── Posisi ring di kartu (tengah atas kartu, koordinat canvas) ──
    // Kartu mulai di y = ROPE_H pada canvas
    const ringX = tail.x;
    const ringY = ROPE_H; // top of card in canvas coords

    // Override node terakhir agar SELALU terkunci ke ring kartu
    // (kecuali saat drag)
    if (!dragRef.current.on) {
      // Jika tidak di-drag, biarkan fisika jalan normal
      // Tapi saat release, node terakhir perlahan ke ringY
    }

    // ── Shadow tali ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth   = 8 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.filter  = `blur(${3 * dpr}px)`;
    ctx.stroke();
    ctx.filter  = "none";
    ctx.restore();

    // ── Tali utama ──
    const grad = ctx.createLinearGradient(ns[0].x * dpr, ns[0].y * dpr, tail.x * dpr, tail.y * dpr);
    grad.addColorStop(0,    c1);
    grad.addColorStop(0.55, c2);
    grad.addColorStop(1,    c1 + "cc");
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 5.5 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke();

    // Highlight strip
    ctx.beginPath();
    ctx.moveTo(ns[0].x * dpr, ns[0].y * dpr);
    for (let i = 1; i < ns.length; i++) ctx.lineTo(ns[i].x * dpr, ns[i].y * dpr);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth   = 1.8 * dpr;
    ctx.stroke();
    ctx.restore();

    // ── Ring anchor atas ──
    {
      const n0 = ns[0];
      ctx.save();
      const rg = ctx.createRadialGradient((n0.x - 2) * dpr, (n0.y - 2) * dpr, 1 * dpr, n0.x * dpr, n0.y * dpr, 9 * dpr);
      rg.addColorStop(0, "#e5e7eb");
      rg.addColorStop(1, "#374151");
      ctx.beginPath();
      ctx.arc(n0.x * dpr, n0.y * dpr, 8.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n0.x * dpr, n0.y * dpr, 5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fill();
      ctx.restore();
    }

    // ── Ring bawah (nyambung ke kartu) — digambar di canvas ──
    {
      // Posisi ring bawah = node terakhir, tapi dikunci di y = ringY saat idle
      const rx = tail.x * dpr;
      const ry = ROPE_H * dpr;
      ctx.save();
      const rg2 = ctx.createRadialGradient(rx - 2 * dpr, ry - 2 * dpr, 1 * dpr, rx, ry, 9 * dpr);
      rg2.addColorStop(0, "#e5e7eb");
      rg2.addColorStop(1, "#374151");
      ctx.beginPath();
      ctx.arc(rx, ry, 8 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = rg2;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rx, ry, 5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fill();
      ctx.restore();
    }

    // ── Tilt kartu dari arah tali ──
    if (!dragRef.current.on) {
      const h  = ns[ns.length - 4];
      const dx = tail.x - h.x;
      const dy = tail.y - h.y;
      const a  = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
      const nr = Math.max(-1, Math.min(1, a / 45));
      const curr = tiltRef.current;
      const next = { rx: curr.rx + (nr * -6 - curr.rx) * 0.09, ry: curr.ry + (nr * 18 - curr.ry) * 0.09 };
      tiltRef.current = next;
      setTilt({ ...next });
    }
  }, []);

  // ── RAF Loop ──────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    simulate();

    // Lock node terakhir ke posisi kartu saat idle (tidak di-drag)
    const ns  = nodesRef.current;
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (ns.length && card && canvas && !dragRef.current.on) {
      const cr  = canvas.getBoundingClientRect();
      const cdr = card.getBoundingClientRect();
      const tail = ns[ns.length - 1];
      // target x = center kartu relatif ke canvas
      const targetX = cdr.left - cr.left + cdr.width / 2;
      const targetY = cdr.top  - cr.top;
      // Soft pull ke ring kartu
      const pull = 0.15;
      tail.x = tail.x + (targetX - tail.x) * pull;
      tail.y = tail.y + (targetY - tail.y) * pull;
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [simulate, draw]);

  // ── Canvas resize ─────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const root   = rootRef.current;
    if (!canvas || !root) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = root.offsetWidth;
    widthRef.current = w;
    canvas.width  = w * dpr;
    canvas.height = (ROPE_H + 1) * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${ROPE_H + 1}px`;
    // Repin anchor
    if (nodesRef.current.length > 0) {
      const n = nodesRef.current[0];
      n.x = n.px = w / 2;
      n.y = n.py = 12;
    }
  }, []);

  useEffect(() => {
    initNodes();
    resize();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initNodes, resize, loop]);

  // ── Drag utils ────────────────────────────────────────────────────────
  const toCanvas = (cx: number, cy: number): Vec2 => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: cx - r.left, y: cy - r.top };
  };

  const closestNode = (p: Vec2, radius = 52) => {
    const ns = nodesRef.current;
    let best = -1, bestD = radius * radius;
    for (let i = 1; i < ns.length; i++) {
      const d = (ns[i].x - p.x) ** 2 + (ns[i].y - p.y) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const moveDrag = (p: Vec2) => {
    if (!dragRef.current.on) return;
    const n = nodesRef.current[dragRef.current.idx];
    if (n) { n.x = p.x; n.y = p.y; n.px = p.x; n.py = p.y; }
  };

  const endDrag = () => { dragRef.current.on = false; };

  // Canvas events
  const onCMD = (e: React.MouseEvent) => {
    e.preventDefault();
    const p = toCanvas(e.clientX, e.clientY);
    const i = closestNode(p);
    if (i !== -1) dragRef.current = { on: true, idx: i };
  };
  const onCMM  = (e: React.MouseEvent) => { moveDrag(toCanvas(e.clientX, e.clientY)); };
  const onCTD  = (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; const p = toCanvas(t.clientX, t.clientY); const i = closestNode(p); if (i !== -1) dragRef.current = { on: true, idx: i }; };
  const onCTM  = (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; moveDrag(toCanvas(t.clientX, t.clientY)); };

  // Card drag — grab kartu = drag node terakhir, bisa kemana-mana
  const startCardDrag = (clientX: number, clientY: number) => {
    const ns = nodesRef.current;
    const lastIdx = ns.length - 1;
    dragRef.current = { on: true, idx: lastIdx };
    const p = toCanvas(clientX, clientY);
    const n = ns[lastIdx];
    if (n) { n.x = p.x; n.y = p.y; n.px = p.x; n.py = p.y; }
  };

  const onCardMD = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startCardDrag(e.clientX, e.clientY);
    const mm = (ev: MouseEvent) => { moveDrag(toCanvas(ev.clientX, ev.clientY)); };
    const mu = () => { endDrag(); window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup",  mu);
  };

  const onCardTD = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const t = e.touches[0];
    startCardDrag(t.clientX, t.clientY);
    const tm = (ev: TouchEvent) => { ev.preventDefault(); const tt = ev.touches[0]; moveDrag(toCanvas(tt.clientX, tt.clientY)); };
    const te = () => { endDrag(); window.removeEventListener("touchmove", tm); window.removeEventListener("touchend", te); };
    window.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("touchend",  te);
  };

  // Hover tilt (saat idle)
  const onHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.on) return;
    const el = e.currentTarget;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width;
    const y  = (e.clientY - r.top)  / r.height;
    const next = { rx: (0.5 - y) * 26, ry: (x - 0.5) * 26 };
    tiltRef.current = next;
    setTilt(next);
    const gl = el.querySelector<HTMLElement>(".lc-glare");
    if (gl) { gl.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.28) 0%, transparent 65%)`; gl.style.opacity = "1"; }
  };
  const onHoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const gl = e.currentTarget.querySelector<HTMLElement>(".lc-glare");
    if (gl) gl.style.opacity = "0";
  };

  return (
    <>
      <style>{`
        @keyframes lcFloat {
          0%,100% { filter: drop-shadow(0 32px 20px rgba(0,0,0,0.60)) drop-shadow(0 6px 12px rgba(0,0,0,0.35)); }
          50%      { filter: drop-shadow(0 16px 12px rgba(0,0,0,0.40)) drop-shadow(0 3px 6px  rgba(0,0,0,0.22)); }
        }
        @keyframes lcGlow {
          0%,100% { opacity:0.30; transform:scale(1); }
          50%      { opacity:0.55; transform:scale(1.07); }
        }
        @keyframes lcShimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }

        .lc-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: ${CARD_W}px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        .lc-canvas {
          display: block;
          width: 100%;
          touch-action: none;
          cursor: grab;
          flex-shrink: 0;
        }
        .lc-canvas:active { cursor: grabbing; }

        /* Wrapper kartu — tepat di bawah canvas tanpa gap */
        .lc-card-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4.2;
          margin-top: 0;
        }

        /* Ambient glow */
        .lc-glow {
          position: absolute;
          inset: -50px -30px;
          background: radial-gradient(
            ellipse at 50% 30%,
            var(--brand-background-strong, rgba(139,92,246,0.38)) 0%,
            var(--accent-background-strong, rgba(109,40,217,0.18)) 50%,
            transparent 75%
          );
          filter: blur(32px);
          pointer-events: none;
          z-index: 0;
          animation: lcGlow 5.5s ease-in-out infinite;
        }

        /* ── KARTU UTAMA ── */
        .lc-card {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          cursor: grab;
          z-index: 1;
          will-change: transform;
          transform-style: preserve-3d;
          animation: lcFloat 6.5s ease-in-out infinite;
          /* Premium 3D layered shadow */
          box-shadow:
            0 0 0 1.5px rgba(255,255,255,0.18),
            0 0 0 3px rgba(0,0,0,0.55),
            0 2px 4px rgba(0,0,0,0.4),
            0 8px 16px rgba(0,0,0,0.45),
            0 24px 48px -4px rgba(0,0,0,0.70),
            0 40px 80px -8px rgba(0,0,0,0.50),
            inset 0 1.5px 0 rgba(255,255,255,0.16),
            inset 0 -2px 0 rgba(0,0,0,0.35),
            inset 1.5px 0 0 rgba(255,255,255,0.06),
            inset -1.5px 0 0 rgba(255,255,255,0.06);
          background: #0b0c13;
        }
        .lc-card:active { cursor: grabbing; }

        /* Foto penuh */
        .lc-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }

        /* Vignette */
        .lc-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(0,0,0,0.65) 100%);
          pointer-events: none;
          z-index: 2;
        }

        /* Fade gelap atas — area ring */
        .lc-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 18%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* Shimmer sweep */
        .lc-shimmer {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.065) 52%, transparent 68%);
          background-size: 200% 100%;
          animation: lcShimmer 4.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 4;
        }

        /* Glare hover */
        .lc-glare {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          opacity: 0;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 5;
          transition: opacity 0.2s ease;
        }

        /* Inner edge highlight */
        .lc-edge {
          position: absolute;
          inset: 0;
          border-radius: 20px;
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
          width: 28px;
          height: 9px;
          border-radius: 6px;
          background: rgba(0,0,0,0.80);
          border: 1.5px solid rgba(255,255,255,0.14);
          z-index: 8;
        }

        /* Ring metal */
        .lc-ring {
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #8b8fa8;
          background: conic-gradient(
            from 130deg,
            #4b5563 0deg, #d1d5db 80deg, #f3f4f6 130deg,
            #9ca3af 190deg, #374151 260deg, #6b7280 320deg, #4b5563 360deg
          );
          z-index: 9;
          box-shadow: 0 3px 8px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.25);
        }
        .lc-ring::after {
          content: "";
          position: absolute;
          inset: 5px;
          border-radius: 50%;
          background: rgba(0,0,0,0.82);
          border: 1px solid rgba(255,255,255,0.06);
        }

        @media (max-width: 680px) {
          .lc-root { max-width: 175px; }
        }
      `}</style>

      <div className="lc-root" ref={rootRef}>
        {/* Canvas tali */}
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

        {/* Kartu ID */}
        <div className="lc-card-wrap">
          <div className="lc-glow" aria-hidden />
          <div
            ref={cardRef}
            className="lc-card"
            style={{
              transform: `perspective(960px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
              transition: dragRef.current.on ? "none" : "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
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
