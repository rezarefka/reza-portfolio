"use client";

import { useEffect, useRef, CSSProperties, ReactNode } from "react";

type Direction = "up" | "left" | "right" | "fade";

interface ScrollAnimateProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;       // ms
  duration?: number;    // ms
  threshold?: number;   // 0–1
  style?: CSSProperties;
  className?: string;
}

const INIT: Record<Direction, CSSProperties> = {
  up:    { opacity: 0, transform: "translateY(52px)" },
  left:  { opacity: 0, transform: "translateX(-44px)" },
  right: { opacity: 0, transform: "translateX(44px)" },
  fade:  { opacity: 0 },
};

const DONE: CSSProperties = {
  opacity: 1,
  transform: "none",
};

export function ScrollAnimate({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  threshold = 0.12,
  style,
  className,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial state (invisible) immediately
    Object.assign(el.style, INIT[direction]);
    el.style.willChange = "opacity, transform";

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);

        setTimeout(() => {
          el.style.transition = [
            `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1)`,
            `transform ${duration}ms cubic-bezier(0.22,1,0.36,1)`,
          ].join(", ");
          Object.assign(el.style, DONE);
          setTimeout(() => { el.style.willChange = "auto"; }, duration + 100);
        }, delay);
      },
      { threshold, rootMargin: "0px 0px -48px 0px" }
    );

    obs.observe(el);

    // Fallback: show after 3s no matter what
    const fallback = setTimeout(() => {
      Object.assign(el.style, DONE);
    }, 3000 + delay);

    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [direction, delay, duration, threshold]);

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
