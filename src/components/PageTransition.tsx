"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Animasi perpindahan halaman ala "slider wipe" — dipasang sekali di root
 * layout, membungkus konten utama (bukan Header/Footer). Setiap kali
 * `pathname` berubah (klik link/button navigasi apapun), overlay warna
 * brand nyapu dari kiri ke kanan menutupi layar sebentar sambil konten
 * halaman baru fade-in di baliknya, lalu overlay lanjut menyapu keluar
 * ke kanan.
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

    // Muat pertama kali: cukup fade-in halus, tanpa overlay sapuan.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.fromTo(
        content,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
      return;
    }

    if (!overlay) return;

    const tl = gsap.timeline();
    tl.set(overlay, { xPercent: -100, opacity: 1 })
      .set(content, { opacity: 0, y: 14 })
      .to(overlay, { xPercent: 0, duration: 0.32, ease: "power3.inOut" })
      .to(content, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.06")
      .to(overlay, { xPercent: 100, duration: 0.38, ease: "power3.inOut" }, "-=0.16")
      .set(overlay, { opacity: 0 });

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
