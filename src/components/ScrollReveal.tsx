"use client";

import { useEffect, useRef, ReactNode, CSSProperties, Children, cloneElement, isValidElement } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;          // ms — delay before reveal
  type?: "up" | "left" | "right" | "scale" | "fade";
  style?: CSSProperties;
  stagger?: boolean;       // stagger direct children one-by-one
  staggerDelay?: number;   // ms between each staggered child (default 80)
  threshold?: number;      // 0–1, how much of element must be visible (default 0.1)
}

/**
 * Wraps children in a div that animates when scrolled into view.
 * When stagger=true, each direct child gets its own cascaded delay.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  type = "up",
  style,
  stagger = false,
  staggerDelay = 80,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const revealClass =
      type === "left"  ? "reveal-left"  :
      type === "right" ? "reveal-right" :
      type === "scale" ? "reveal-scale" :
      type === "fade"  ? "reveal-fade"  :
      "reveal";

    if (stagger) {
      // Apply stagger to each direct child
      const kids = Array.from(el.children) as HTMLElement[];
      kids.forEach((kid, i) => {
        kid.classList.add(revealClass);
        kid.style.transitionDelay = `${delay + i * staggerDelay}ms`;
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            kids.forEach((kid) => kid.classList.add("visible"));
            observer.unobserve(el);
          }
        },
        { threshold, rootMargin: "0px 0px -30px 0px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      el.classList.add(revealClass);

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("visible"), delay);
            observer.unobserve(el);
          }
        },
        { threshold, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [delay, type, stagger, staggerDelay, threshold]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
