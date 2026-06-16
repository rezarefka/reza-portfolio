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

const ROPE_SEGS = 20;
const LINK_LEN  = 10;
const CARD_W    = 148;
const CARD_H    = 208;
const GRAVITY   = 0.52;
const DAMPING   = 0.972;
const ANG_DAMP  = 0.90;
const ITERS     = 24;
const STIFF     = 0.85;

interface Node { x: number; y: number; vx: number; vy: number; pinned: boolean }
interface CardState { x: number; y: number; vx: number; vy: number; angle: number; av: number }
interface DragState { active: boolean; target: "rope" | "card" | null; idx: number; offX: number; offY: number }

export function Tilt3DCard({ src, alt, onLoad, onError, loaded }: Tilt3DCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const imgReady  = useRef(false);

  // All physics state in one ref — no React re-renders in loop
  const phys = useRef<{
    nodes: Node[];
    card: CardState;
    drag: DragState;
    W: number; H: number;
    raf: number;
  } | null>(null);

  // ── Preload image ──────────────────────────────────────────────────────
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { imgReady.current = true; onLoad?.(); };
    img.onerror = (e) => onError?.(e as unknown as React.SyntheticEvent<HTMLImageElement, Event>);
    img.src = src;
    imgRef.current = img;
  }, [src, onLoad, onError]);

  // ── Init ────────────────────────────────────────────────────────────────
  const init = useCallback((W: number, H: number) => {
    const ax = W / 2, ay = 20;
    const nodes: Node[] = Array.from({ length: ROPE_SEGS + 1 }, (_, i) => ({
      x: ax, y: ay + i * LINK_LEN,
      vx: 0, vy: 0,
      pinned: i === 0,
    }));
    const card: CardState = {
      x: ax, y: ay + ROPE_SEGS * LINK_LEN + CARD_H / 2 + 4,
      vx: 0, vy: 0, angle: 0, av: 0,
    };
    phys.current = {
      nodes, card,
      drag: { active: false, target: null, idx: -1, offX: 0, offY: 0 },
      W, H, raf: 0,
    };
  }, []);

  // ── Physics step ────────────────────────────────────────────────────────
  const step = useCallback(() => {
    const p = phys.current;
    if (!p) return;
    const { nodes, card, drag } = p;

    // Integrate rope nodes
    for (const n of nodes) {
      if (n.pinned) continue;
      n.vy += GRAVITY; n.vx *= DAMPING; n.vy *= DAMPING;
      n.x += n.vx; n.y += n.vy;
    }
    // Constraint rope segments
    for (let it = 0; it < ITERS; it++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d  = Math.hypot(dx, dy) || 0.001;
        const df = (d - LINK_LEN) / d * STIFF * 0.5;
        if (!a.pinned) { a.x += dx * df; a.y += dy * df; }
        if (!b.pinned) { b.x -= dx * df; b.y -= dy * df; }
      }
    }

    // Integrate card
    if (drag.target !== "card") {
      card.vy += GRAVITY * 0.45;
      card.vx *= DAMPING; card.vy *= DAMPING;
      card.av *= ANG_DAMP;
      card.x  += card.vx; card.y  += card.vy;
      card.angle += card.av;
    }

    // Constraint: rope tail <-> card ring
    const tail = nodes[nodes.length - 1];
    const ringX = card.x + Math.sin(card.angle) * (-CARD_H / 2);
    const ringY = card.y - Math.cos(card.angle) * (CARD_H / 2);

    if (drag.target !== "card") {
      const dx = tail.x - ringX, dy = tail.y - ringY;
      const d  = Math.hypot(dx, dy);
      if (d > 0.3) {
        const pull = 0.22;
        tail.x -= dx * pull; tail.y -= dy * pull;
        card.vx += dx * pull * 0.25; card.vy += dy * pull * 0.25;
        // Angular impulse
        const cardCX = card.x, cardCY = card.y;
        const armX = ringX - cardCX, armY = ringY - cardCY;
        card.av += (armX * dy * pull - armY * dx * pull) * 0.004;
      }
    } else {
      // While dragging card, pin tail to ring
      tail.x = ringX; tail.y = ringY;
      tail.vx = card.vx; tail.vy = card.vy;
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const p = phys.current;
    if (!canvas || !p) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { nodes, card } = p;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tail = nodes[nodes.length - 1];

    // ══════════════════════ TALI ══════════════════════════════════════════

    // Shadow blur
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 11 * dpr;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.filter = `blur(${3 * dpr}px)`;
    ctx.stroke();
    ctx.filter = "none";
    ctx.restore();

    // Tubuh tali gelap
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    const gd = ctx.createLinearGradient(nodes[0].x*dpr, nodes[0].y*dpr, tail.x*dpr, tail.y*dpr);
    gd.addColorStop(0,   "#1b1e2d"); gd.addColorStop(0.4, "#272a3c");
    gd.addColorStop(0.7, "#1a1d2b"); gd.addColorStop(1,   "#10121e");
    ctx.strokeStyle = gd; ctx.lineWidth = 8 * dpr;
    ctx.lineCap = ctx.lineJoin = "round"; ctx.stroke();
    ctx.restore();

    // Serat metalik
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    const gm = ctx.createLinearGradient(nodes[0].x*dpr, nodes[0].y*dpr, tail.x*dpr, tail.y*dpr);
    gm.addColorStop(0,   "#7c8499"); gm.addColorStop(0.25, "#b8bfcc");
    gm.addColorStop(0.5, "#e0e4ee"); gm.addColorStop(0.75, "#9da5b5");
    gm.addColorStop(1,   "#5a6070");
    ctx.strokeStyle = gm; ctx.lineWidth = 4 * dpr;
    ctx.lineCap = ctx.lineJoin = "round"; ctx.stroke();
    ctx.restore();

    // Highlight tipis
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x * dpr, nodes[0].y * dpr);
    for (let i = 1; i < nodes.length; i++) ctx.lineTo(nodes[i].x * dpr, nodes[i].y * dpr);
    ctx.strokeStyle = "rgba(255,255,255,0.20)"; ctx.lineWidth = 1.4 * dpr;
    ctx.lineCap = ctx.lineJoin = "round"; ctx.stroke();
    ctx.restore();

    // Knot dots
    for (let i = 2; i < nodes.length - 1; i += 3) {
      const n = nodes[i];
      ctx.save();
      const kg = ctx.createRadialGradient(n.x*dpr, n.y*dpr, 0, n.x*dpr, n.y*dpr, 3*dpr);
      kg.addColorStop(0, "rgba(220,226,238,0.35)"); kg.addColorStop(1, "rgba(60,70,95,0.05)");
      ctx.beginPath(); ctx.arc(n.x*dpr, n.y*dpr, 2.8*dpr, 0, Math.PI*2);
      ctx.fillStyle = kg; ctx.fill(); ctx.restore();
    }

    // ══════════════════════ CLIP ANCHOR ══════════════════════════════════
    {
      const n0 = nodes[0];
      const cx = n0.x * dpr, cy = n0.y * dpr;
      const cw = 13 * dpr, ch = 19 * dpr, r = 4 * dpr;
      const x0 = cx - cw / 2, y0 = cy - 2 * dpr;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0+r, y0); ctx.lineTo(x0+cw-r, y0);
      ctx.arcTo(x0+cw, y0, x0+cw, y0+r, r);
      ctx.lineTo(x0+cw, y0+ch-r);
      ctx.arcTo(x0+cw, y0+ch, x0+cw-r, y0+ch, r);
      ctx.lineTo(x0+r, y0+ch);
      ctx.arcTo(x0, y0+ch, x0, y0+ch-r, r);
      ctx.lineTo(x0, y0+r);
      ctx.arcTo(x0, y0, x0+r, y0, r);
      ctx.closePath();
      const gc = ctx.createLinearGradient(x0, 0, x0+cw, 0);
      gc.addColorStop(0, "#252a3a"); gc.addColorStop(0.4, "#8b92a8");
      gc.addColorStop(0.65, "#d4d8e4"); gc.addColorStop(1, "#363c52");
      ctx.fillStyle = gc; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 0.5*dpr; ctx.stroke();
      ctx.restore();
      // Lubang
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy+7*dpr, 4*dpr, 5.5*dpr, 0, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,0,0,0.78)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 0.5*dpr; ctx.stroke();
      ctx.restore();
    }

    // ══════════════════════ KARTU ═════════════════════════════════════════
    {
      const cx   = card.x * dpr;
      const cy   = card.y * dpr;
      const cw   = CARD_W * dpr;
      const ch   = CARD_H * dpr;
      const brad = 18 * dpr;
      const ang  = card.angle;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);

      // Clip ke rounded rect
      ctx.beginPath();
      ctx.roundRect(-cw/2, -ch/2, cw, ch, brad);
      ctx.save();
      ctx.clip();

      // Shadow kartu
      ctx.shadowColor   = "rgba(0,0,0,0.80)";
      ctx.shadowBlur    = 48 * dpr;
      ctx.shadowOffsetY = 20 * dpr;
      ctx.fillStyle = "#0a0b10";
      ctx.fillRect(-cw/2 - 2, -ch/2 - 2, cw + 4, ch + 4);
      ctx.shadowColor = "transparent";

      // Foto (drawImage)
      if (imgReady.current && imgRef.current) {
        // Hitung crop: center top
        const img = imgRef.current;
        const iw  = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
        const dw   = iw * scale, dh = ih * scale;
        const ox   = -cw/2 + (cw - dw) / 2;
        const oy   = -ch/2 + 0; // top aligned
        ctx.drawImage(img, ox, oy, dw, dh);
      }

      // Vignette radial
      const vig = ctx.createRadialGradient(0, 0, cw*0.25, 0, 0, cw*0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.60)");
      ctx.fillStyle = vig;
      ctx.fillRect(-cw/2, -ch/2, cw, ch);

      // Top fade (area ring)
      const topFade = ctx.createLinearGradient(0, -ch/2, 0, -ch/2 + ch*0.22);
      topFade.addColorStop(0, "rgba(0,0,0,0.68)");
      topFade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(-cw/2, -ch/2, cw, ch*0.22);

      // Shimmer strip
      const shimX = (Date.now() % 4000) / 4000 * (cw * 2.5) - cw * 1.5;
      const shim = ctx.createLinearGradient(shimX - 60*dpr, 0, shimX + 60*dpr, 0);
      shim.addColorStop(0, "rgba(255,255,255,0)");
      shim.addColorStop(0.5, "rgba(255,255,255,0.065)");
      shim.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shim;
      ctx.fillRect(-cw/2, -ch/2, cw, ch);

      ctx.restore(); // unclip

      // Border elegan (outside clip)
      ctx.beginPath();
      ctx.roundRect(-cw/2, -ch/2, cw, ch, brad);
      const borderG = ctx.createLinearGradient(-cw/2, -ch/2, cw/2, ch/2);
      borderG.addColorStop(0,   "rgba(255,255,255,0.24)");
      borderG.addColorStop(0.35,"rgba(255,255,255,0.09)");
      borderG.addColorStop(0.65,"rgba(255,255,255,0.18)");
      borderG.addColorStop(1,   "rgba(255,255,255,0.05)");
      ctx.strokeStyle = borderG;
      ctx.lineWidth = 2.2 * dpr;
      ctx.stroke();

      // Outer glow
      ctx.beginPath();
      ctx.roundRect(-cw/2-2, -ch/2-2, cw+4, ch+4, brad+2);
      ctx.strokeStyle = "rgba(160,170,200,0.07)";
      ctx.lineWidth = 4 * dpr;
      ctx.stroke();

      ctx.restore(); // untranslate/rotate

      // ── Ring kartu (top center, absolute canvas) ────────────────────────
      const ringX = card.x + Math.sin(ang) * (-CARD_H / 2);
      const ringY = card.y - Math.cos(ang) * (CARD_H / 2);
      const rx = ringX * dpr, ry = ringY * dpr;

      // Lubang
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(rx, ry, 11*dpr, 4*dpr, ang, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 0.8*dpr;
      ctx.stroke();
      ctx.restore();

      // Ring metal
      ctx.save();
      ctx.beginPath();
      ctx.arc(rx, ry, 10*dpr, 0, Math.PI*2);
      const rg = ctx.createConicGradient(ang + 2.1, rx, ry);
      rg.addColorStop(0,    "#374151"); rg.addColorStop(0.20, "#9ca3af");
      rg.addColorStop(0.35, "#e5e7eb"); rg.addColorStop(0.50, "#d1d5db");
      rg.addColorStop(0.65, "#6b7280"); rg.addColorStop(0.80, "#374151");
      rg.addColorStop(1,    "#374151");
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.8*dpr;
      ctx.stroke();
      ctx.restore();

      // Lubang dalam ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(rx, ry, 5.5*dpr, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,0,0,0.84)";
      ctx.fill();
      ctx.restore();
    }
  }, []);

  // ── RAF loop ─────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    step();
    render();
    if (phys.current) phys.current.raf = requestAnimationFrame(loop);
  }, [step, render]);

  // ── Resize ───────────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const W   = wrap.offsetWidth;
    const H   = wrap.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    if (phys.current) {
      phys.current.W = W;
      phys.current.H = H;
      const n = phys.current.nodes[0];
      n.x = n.pinned ? W / 2 : n.x;
    }
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    init(wrap.offsetWidth, wrap.offsetHeight);
    resize();
    const id = requestAnimationFrame(loop);
    if (phys.current) phys.current.raf = id;
    window.addEventListener("resize", resize);
    return () => {
      if (phys.current) cancelAnimationFrame(phys.current.raf);
      window.removeEventListener("resize", resize);
    };
  }, [init, resize, loop]);

  // ── Pointer utils ─────────────────────────────────────────────────────────
  const toLocal = (clientX: number, clientY: number) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const hitCard = (lx: number, ly: number) => {
    const p = phys.current; if (!p) return false;
    const { card } = p;
    const cos = Math.cos(-card.angle), sin = Math.sin(-card.angle);
    const dx = lx - card.x, dy = ly - card.y;
    const rx = dx*cos - dy*sin, ry = dx*sin + dy*cos;
    return Math.abs(rx) < CARD_W/2 + 12 && Math.abs(ry) < CARD_H/2 + 12;
  };

  const hitRope = (lx: number, ly: number) => {
    const p = phys.current; if (!p) return -1;
    let best = -1, bestD = 32*32;
    for (let i = 1; i < p.nodes.length; i++) {
      const n = p.nodes[i];
      const d = (n.x - lx)**2 + (n.y - ly)**2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const startDrag = (clientX: number, clientY: number) => {
    const p = phys.current; if (!p) return;
    const { x, y } = toLocal(clientX, clientY);
    if (hitCard(x, y)) {
      p.drag = { active: true, target: "card", idx: -1, offX: x - p.card.x, offY: y - p.card.y };
      return;
    }
    const ri = hitRope(x, y);
    if (ri !== -1) p.drag = { active: true, target: "rope", idx: ri, offX: 0, offY: 0 };
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const p = phys.current; if (!p || !p.drag.active) return;
    const { x, y } = toLocal(clientX, clientY);
    if (p.drag.target === "card") {
      const nx = x - p.drag.offX, ny = y - p.drag.offY;
      p.card.vx = nx - p.card.x; p.card.vy = ny - p.card.y;
      p.card.x = nx; p.card.y = ny;
    } else if (p.drag.target === "rope") {
      const n = p.nodes[p.drag.idx];
      if (n) { n.vx = x - n.x; n.vy = y - n.y; n.x = x; n.y = y; }
    }
  };

  const endDrag = () => { if (phys.current) phys.current.drag.active = false; };

  const onMD = (e: React.MouseEvent)  => { e.preventDefault(); startDrag(e.clientX, e.clientY); };
  const onMM = (e: React.MouseEvent)  => moveDrag(e.clientX, e.clientY);
  const onTD = (e: React.TouchEvent)  => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); };
  const onTM = (e: React.TouchEvent)  => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); };

  return (
    <>
      <style>{`
        .lc-root {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 260px;
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }
        .lc-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          touch-action: none;
          cursor: grab;
        }
        .lc-canvas:active { cursor: grabbing; }
      `}</style>

      <div className="lc-root" ref={wrapRef}>
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
          aria-label={alt}
          role="img"
        />
      </div>
    </>
  );
}
