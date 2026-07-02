"use client";

import { useEffect, useRef } from "react";

/**
 * Background foto untuk halaman login Reza Control.
 * - Foto wisuda, opacity 50%, di-blur tipis biar glass card di atasnya tetap kebaca.
 * - Efek 3D: perspective + rotateX/rotateY ngikutin posisi kursor (parallax tilt),
 *   dikombinasi idle drift (auto gerak pelan) biar tetap "hidup" walau kursor diam.
 * - Menghormati prefers-reduced-motion.
 */
export function LoginBackground() {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let targetX = 0, targetY = 0;   // -1..1, digerakkan kursor
    let curX = 0, curY = 0;         // nilai yang di-lerp tiap frame (halus)
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width) * 2 - 1;
      targetY = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => { targetX = 0; targetY = 0; };

    const tick = (t: number) => {
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;

      // idle drift: gerakan pelan otonom, independen dari kursor
      const driftX = Math.sin(t / 4200) * 1.1;
      const driftY = Math.cos(t / 5000) * 0.9;
      const driftScale = 1 + Math.sin(t / 6000) * 0.012;

      const rotateY = curX * 6 + driftX;   // derajat
      const rotateX = -curY * 5 + driftY;
      const translateX = curX * 14;        // px
      const translateY = curY * 10;

      img.style.transform =
        `translate3d(${translateX}px, ${translateY}px, 0) ` +
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ` +
        `scale(${1.06 * driftScale})`;

      raf = requestAnimationFrame(tick);
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={stageRef} className="rc-bg-stage" aria-hidden="true">
      <style>{`
        .rc-bg-stage {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          perspective: 1200px;
          pointer-events: none;
        }
        .rc-bg-img {
          position: absolute;
          inset: -4%;
          background-image: url('/rc-login-bg.jpg');
          background-size: cover;
          background-position: 66% 38%;
          opacity: 0.5;
          filter: saturate(0.92) contrast(1.03) blur(1px);
          transform: scale(1.06);
          transform-style: preserve-3d;
          will-change: transform;
        }
        .rc-bg-scrim {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(124,92,255,0.14) 0%, rgba(124,92,255,0) 55%),
            linear-gradient(180deg, rgba(8,8,12,0.48) 0%, rgba(8,8,12,0.56) 55%, rgba(8,8,12,0.64) 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .rc-bg-img { transform: scale(1.02) !important; filter: saturate(0.85) blur(1.5px); }
        }
      `}</style>
      <div ref={imgRef} className="rc-bg-img" />
      <div className="rc-bg-scrim" />
    </div>
  );
}
