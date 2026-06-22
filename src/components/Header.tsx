"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Row, ToggleButton } from "@once-ui-system/core";

import { routes, display, person, about, blog, work, gallery } from "@/resources";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { useLang } from "@/lib/lang-context";
import styles from "./Header.module.scss";

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
  /* P8: track theme toggle clicks for rotation feedback */
  const [themeClickCount, setThemeClickCount] = useState(0);
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
      <style>{`
        /* ── P8: Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .nav-active-dot,
          .theme-toggle-wrap svg,
          .nav-item-wrap::before { transition-duration: 0.01ms !important; }
        }

        /* ── P8: Active nav indicator dot ── */
        .nav-item-wrap {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }

        .nav-active-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--brand-solid-strong);
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          /* P8: animate scale(0)→scale(1) when route matches */
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }
        .nav-active-dot.visible {
          transform: translateX(-50%) scale(1);
        }

        /* ── P8: ThemeToggle icon rotation ── */
        .theme-toggle-wrap {
          display: contents;
        }
        .theme-toggle-wrap svg {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .theme-rotated svg {
          transform: rotate(180deg) !important;
        }

        /* ── P8: Nav item hover — pill expand from center ── */
        .nav-item-wrap > button,
        .nav-item-wrap > a {
          position: relative;
          overflow: hidden;
        }
        .nav-item-wrap > button::before,
        .nav-item-wrap > a::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--neutral-alpha-weak);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          z-index: 0;
        }
        .nav-item-wrap > button:not([data-selected="true"]):hover::before,
        .nav-item-wrap > a:not([data-selected="true"]):hover::before,
        .nav-item-wrap > button:not([aria-pressed="true"]):hover::before {
          transform: scaleX(1);
        }
      `}</style>

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

      {/* Header shell */}
      <header
        className={`${styles.headerShell} ${scrolled ? styles.scrolled : ""}`}
        data-border="rounded"
      >
        <nav className={styles.glassNav} suppressHydrationWarning>

          {/* ── Home ── */}
          {routes["/"] && (
            <div className="nav-item-wrap">
              <ToggleButton
                prefixIcon="home"
                href="/"
                selected={isActive("/", true)}
                className={`${styles.navBtn} ${isActive("/", true) ? styles.active : ""}`}
              >
                <span className={styles.label}>{navLabel("Home")}</span>
              </ToggleButton>
              {/* P8: Active indicator dot */}
              <span className={`nav-active-dot${isActive("/", true) ? " visible" : ""}`} />
            </div>
          )}

          {/* ── About ── */}
          {routes["/about"] && (
            <>
              <span className={styles.sep} />
              <div className="nav-item-wrap">
                <ToggleButton
                  prefixIcon="person"
                  href="/about"
                  selected={isActive("/about", true)}
                  className={`${styles.navBtn} ${isActive("/about", true) ? styles.active : ""}`}
                >
                  <span className={styles.label}>{navLabel(about.label)}</span>
                </ToggleButton>
                <span className={`nav-active-dot${isActive("/about", true) ? " visible" : ""}`} />
              </div>
            </>
          )}

          {/* ── Work ── */}
          {routes["/work"] && (
            <>
              <span className={styles.sep} />
              <div className="nav-item-wrap">
                <ToggleButton
                  prefixIcon="grid"
                  href="/work"
                  selected={isActive("/work")}
                  className={`${styles.navBtn} ${isActive("/work") ? styles.active : ""}`}
                >
                  <span className={styles.label}>{navLabel(work.label)}</span>
                </ToggleButton>
                <span className={`nav-active-dot${isActive("/work") ? " visible" : ""}`} />
              </div>
            </>
          )}

          {/* ── Blog ── */}
          {routes["/blog"] && (
            <>
              <span className={styles.sep} />
              <div className="nav-item-wrap">
                <ToggleButton
                  prefixIcon="book"
                  href="/blog"
                  selected={isActive("/blog")}
                  className={`${styles.navBtn} ${isActive("/blog") ? styles.active : ""}`}
                >
                  <span className={styles.label}>{navLabel(blog.label)}</span>
                </ToggleButton>
                <span className={`nav-active-dot${isActive("/blog") ? " visible" : ""}`} />
              </div>
            </>
          )}

          {/* ── Gallery ── */}
          {routes["/gallery"] && (
            <>
              <span className={styles.sep} />
              <div className="nav-item-wrap">
                <ToggleButton
                  prefixIcon="gallery"
                  href="/gallery"
                  selected={isActive("/gallery")}
                  className={`${styles.navBtn} ${isActive("/gallery") ? styles.active : ""}`}
                >
                  <span className={styles.label}>{navLabel(gallery.label)}</span>
                </ToggleButton>
                <span className={`nav-active-dot${isActive("/gallery") ? " visible" : ""}`} />
              </div>
            </>
          )}

          {/* ── Theme toggle — P8: icon rotates 180° per click ── */}
          {display.themeSwitcher && (
            <>
              <span className={styles.sep} />
              {/* Click on wrapper increments counter; CSS toggles rotation class */}
              <div
                className={`theme-toggle-wrap${themeClickCount % 2 === 1 ? " theme-rotated" : ""}`}
                onClick={() => setThemeClickCount((c) => c + 1)}
              >
                <ThemeToggle />
              </div>
            </>
          )}

          <span className={styles.sep} />
          <LangToggle />
        </nav>
      </header>
    </>
  );
};
