"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: "up" | "left" | "right" | "scale" | "fade" | "blur-up" | "slide-up";
  style?: CSSProperties;
  stagger?: boolean;
  staggerDelay?: number;
  threshold?: number;
  duration?: number; // ms
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  type = "up",
  style,
  stagger = false,
  staggerDelay = 90,
  threshold = 0.08,
  duration,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const revealClass =
      type === "left"     ? "reveal-left"    :
      type === "right"    ? "reveal-right"   :
      type === "scale"    ? "reveal-scale"   :
      type === "fade"     ? "reveal-fade"    :
      type === "blur-up"  ? "reveal-blur-up" :
      type === "slide-up" ? "reveal-slide-up":
      "reveal";

    if (duration) {
      el.style.setProperty("--reveal-duration", `${duration}ms`);
    }

    const fallback = setTimeout(() => {
      if (stagger) {
        (Array.from(el.children) as HTMLElement[]).forEach((k) => k.classList.add("visible"));
      } else {
        el.classList.add("visible");
      }
    }, 2000);

    if (stagger) {
      const kids = Array.from(el.children) as HTMLElement[];
      kids.forEach((kid, i) => {
        kid.classList.add(revealClass);
        kid.style.transitionDelay = `${delay + i * staggerDelay}ms`;
      });
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          clearTimeout(fallback);
          kids.forEach((k) => k.classList.add("visible"));
          obs.unobserve(el);
        }
      }, { threshold: Math.min(threshold, 0.04), rootMargin: "0px 0px -20px 0px" });
      obs.observe(el);
      return () => { obs.disconnect(); clearTimeout(fallback); };
    } else {
      el.classList.add(revealClass);
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          clearTimeout(fallback);
          setTimeout(() => el.classList.add("visible"), delay);
          obs.unobserve(el);
        }
      }, { threshold: Math.min(threshold, 0.04), rootMargin: "0px 0px -20px 0px" });
      obs.observe(el);
      return () => { obs.disconnect(); clearTimeout(fallback); };
    }
  }, [delay, type, stagger, staggerDelay, threshold, duration]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
