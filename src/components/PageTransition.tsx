"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Animasi perpindahan halaman — liquid glass blur-crossfade. Dipasang sekali
 * di root layout, membungkus konten utama (bukan Header/Footer). Setiap kali
 * `pathname` berubah, konten halaman baru masuk dengan blur→fokus + scale
 * halus, senada dengan easing yang dipakai di HeroSection. Tidak ada panel
 * yang menyapu layar — murni fade/blur di tempat.
 *
 * Tidak intercept klik / menunda navigasi — Next.js tetap navigasi normal,
 * animasi ini murni efek visual yang dipicu oleh perubahan route.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const tl = gsap.timeline();

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Muat pertama kali: sedikit lebih ringan, tanpa blur berat.
      tl.fromTo(
        content,
        { opacity: 0, y: 10, scale: 0.99, filter: "blur(6px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power2.out" },
      );
    } else {
      tl.set(content, { opacity: 0, y: 14, scale: 0.985, filter: "blur(10px)" }).to(content, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.65,
        ease: "power3.out",
      });
    }

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div ref={contentRef} key={pathname} style={{ width: "100%" }}>
      {children}
    </div>
  );
}
