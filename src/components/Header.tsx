"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Row, ToggleButton } from "@once-ui-system/core";

import { routes, display, person, about, blog, work, gallery } from "@/resources";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { useLang } from "@/lib/lang-context";
import styles from "./Header.module.scss";

// Label nav disimpan dalam bahasa Inggris di resources/content.tsx;
// versi Indonesia dipetakan di sini supaya nav ikut berubah saat toggle bahasa.
const NAV_LABEL_ID: Record<string, string> = {
  Home: "Beranda",
  About: "Tentang",
  Work: "Karya",
  Blog: "Blog",
  Gallery: "Galeri",
};

type TimeDisplayProps = {
  timeZone: string;
  locale?: string;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setCurrentTime(new Intl.DateTimeFormat(locale, options).format(now));
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

export const Header = () => {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLang();
  const navLabel = (en: string) => t(NAV_LABEL_ID[en] || en, en);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/reza-control")) return null;

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <>
      {/* Desktop: top fade mask */}
      <Fade s={{ hide: true }} fillWidth position="fixed" height="80" zIndex={9} />
      {/* Mobile: bottom fade mask */}
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />

      {/* Header shell — full width, centers the pill */}
      <header
        className={`${styles.headerShell} ${scrolled ? styles.scrolled : ""}`}
        data-border="rounded"
      >
        <nav className={styles.glassNav} suppressHydrationWarning>
          {/* ── Nav links ── */}
          {routes["/"] && (
            <ToggleButton
              prefixIcon="home"
              href="/"
              selected={isActive("/", true)}
              className={`${styles.navBtn} ${isActive("/", true) ? styles.active : ""}`}
            >
              <span className={styles.label}>{navLabel("Home")}</span>
            </ToggleButton>
          )}

          {routes["/about"] && (
            <>
              <span className={styles.sep} />
              <ToggleButton
                prefixIcon="person"
                href="/about"
                selected={isActive("/about", true)}
                className={`${styles.navBtn} ${isActive("/about", true) ? styles.active : ""}`}
              >
                <span className={styles.label}>{navLabel(about.label)}</span>
              </ToggleButton>
            </>
          )}

          {routes["/work"] && (
            <>
              <span className={styles.sep} />
              <ToggleButton
                prefixIcon="grid"
                href="/work"
                selected={isActive("/work")}
                className={`${styles.navBtn} ${isActive("/work") ? styles.active : ""}`}
              >
                <span className={styles.label}>{navLabel(work.label)}</span>
              </ToggleButton>
            </>
          )}

          {routes["/blog"] && (
            <>
              <span className={styles.sep} />
              <ToggleButton
                prefixIcon="book"
                href="/blog"
                selected={isActive("/blog")}
                className={`${styles.navBtn} ${isActive("/blog") ? styles.active : ""}`}
              >
                <span className={styles.label}>{navLabel(blog.label)}</span>
              </ToggleButton>
            </>
          )}

          {routes["/gallery"] && (
            <>
              <span className={styles.sep} />
              <ToggleButton
                prefixIcon="gallery"
                href="/gallery"
                selected={isActive("/gallery")}
                className={`${styles.navBtn} ${isActive("/gallery") ? styles.active : ""}`}
              >
                <span className={styles.label}>{navLabel(gallery.label)}</span>
              </ToggleButton>
            </>
          )}

          {/* ── Utilities ── */}
          {display.themeSwitcher && (
            <>
              <span className={styles.sep} />
              <ThemeToggle />
            </>
          )}

          <span className={styles.sep} />
          <LangToggle />
        </nav>
      </header>
    </>
  );
};
