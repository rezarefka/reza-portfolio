"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";

interface ParallaxLayerProps {
  /** -1..1 — negatif = drift ke atas, positif = drift ke bawah saat elemen mendekati tengah viewport */
  speed?: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Parallax scroll-linked berbasis posisi elemen terhadap viewport (bukan raw scrollY),
 * jadi tetap natural di manapun elemen berada pada halaman. Auto nonaktif kalau user
 * set prefers-reduced-motion.
 */
export function ParallaxLayer({ speed = 0.15, children, style, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      const offset = (viewportCenter - elCenter) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform", ...style }}>
      {children}
    </div>
  );
}
