"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Animasi perpindahan halaman — liquid glass flash + blur-crossfade. Dipasang
 * sekali di root layout, membungkus konten utama (bukan Header/Footer).
 * Setiap kali `pathname` berubah: overlay kaca (blur + tint brand, radial di
 * tengah layar) memudar masuk lalu keluar DI TEMPAT — tidak menyapu dari sisi
 * manapun — bersamaan dengan konten baru yang masuk lewat blur→fokus + scale
 * halus. Senada dengan easing & aesthetic liquid glass yang dipakai di navbar
 * dan HeroSection.
 *
 * Tidak intercept klik / menunda navigasi — Next.js tetap navigasi normal,
 * animasi ini murni efek visual yang dipicu oleh perubahan route.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!content) return;

    const tl = gsap.timeline();

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Muat pertama kali: sedikit lebih ringan, tanpa overlay.
      tl.fromTo(
        content,
        { opacity: 0, y: 10, scale: 0.99, filter: "blur(6px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power2.out" },
      );
    } else {
      tl.set(content, { opacity: 0, y: 14, scale: 0.985, filter: "blur(10px)" });
      if (overlay) tl.set(overlay, { opacity: 0 });
      if (overlay) tl.to(overlay, { opacity: 1, duration: 0.28, ease: "power2.out" });
      tl.to(
        content,
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out" },
        overlay ? "-=0.05" : 0,
      );
      if (overlay) tl.to(overlay, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, "-=0.35");
    }

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div ref={overlayRef} className="page-transition-overlay" aria-hidden="true" />
      <div ref={contentRef} key={pathname} style={{ width: "100%" }}>
        {children}
      </div>
    </>
  );
}
