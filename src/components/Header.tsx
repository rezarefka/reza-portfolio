"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Fade, ToggleButton } from "@once-ui-system/core";
import { routes, display, person, about, blog, work, gallery } from "@/resources";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { useLang } from "@/lib/lang-context";
import styles from "./Header.module.scss";

const NAV_LABEL_ID: Record<string,string> = {
  Home:"Beranda", About:"Tentang", Work:"Karya", Blog:"Blog", Gallery:"Galeri",
};

type TimeDisplayProps = { timeZone:string; locale?:string; };
const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale="en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");
  useEffect(()=>{
    const update=()=>{ const now=new Date(); setCurrentTime(new Intl.DateTimeFormat(locale,{timeZone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now)); };
    update(); const id=setInterval(update,1000); return ()=>clearInterval(id);
  },[timeZone,locale]);
  return <>{currentTime}</>;
};
export default TimeDisplay;

export const Header = () => {
  const pathname = usePathname()??"";
  const [scrolled, setScrolled] = useState(false);
  const [themeClicks, setThemeClicks] = useState(0);
  const { t } = useLang();
  const navLabel = (en:string) => t(NAV_LABEL_ID[en]||en, en);

  useEffect(()=>{
    const onScroll=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",onScroll,{passive:true});
    return ()=>window.removeEventListener("scroll",onScroll);
  },[]);

  if(pathname.startsWith("/reza-control")) return null;
  const isActive=(path:string,exact=false)=>exact?pathname===path:pathname.startsWith(path);

  return (
    <>
      <style>{`
        @media(prefers-reduced-motion:reduce){
          .nav-dot,.nav-item-btn::before,.theme-wrap svg
          { transition-duration:0.01ms!important; animation-duration:0.01ms!important; }
        }

        /* ── Nav item wrapper ── */
        .nav-item {
          position:relative; display:inline-flex;
          flex-direction:column; align-items:center;
        }

        /* ── P8: Hover pill expand from center ── */
        .nav-item-btn {
          position:relative; overflow:hidden;
        }
        .nav-item-btn::before {
          content:"";
          position:absolute; inset:0; border-radius:inherit;
          background:var(--neutral-alpha-weak);
          transform:scaleX(0); transform-origin:center;
          transition:transform 0.22s cubic-bezier(0.22,1,0.36,1);
          pointer-events:none; z-index:0;
        }
        .nav-item-btn:not([data-selected="true"]):hover::before,
        .nav-item-btn[aria-pressed="false"]:hover::before { transform:scaleX(1); }

        /* ── P8: Active dot 4×4 below item, scale in on route change ── */
        .nav-dot {
          position:absolute; bottom:-9px; left:50%;
          width:4px; height:4px; border-radius:50%;
          background:var(--brand-solid-strong);
          transform:translateX(-50%) scale(0);
          transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
          pointer-events:none;
        }
        .nav-dot.on { transform:translateX(-50%) scale(1); }

        /* ── P8: Theme toggle icon rotation ── */
        .theme-wrap { display:contents; }
        .theme-wrap svg {
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1)!important;
        }
        .theme-rotated svg { transform:rotate(180deg)!important; }
      `}</style>

      <Fade s={{hide:true}} fillWidth position="fixed" height="80" zIndex={9}/>
      <Fade hide s={{hide:false}} fillWidth position="fixed" bottom="0" to="top" height="80" zIndex={9}/>

      <header className={`${styles.headerShell}${scrolled?" "+styles.scrolled:""}`} data-border="rounded">
        <nav className={styles.glassNav} suppressHydrationWarning>

          {routes["/"] && (
            <div className="nav-item">
              <ToggleButton prefixIcon="home" href="/"
                className={`${styles.navBtn} nav-item-btn${isActive("/",true)?" "+styles.active:""}`}>
                <span className={styles.label}>{navLabel("Home")}</span>
              </ToggleButton>
              <span className={`nav-dot${isActive("/",true)?" on":""}`}/>
            </div>
          )}

          {routes["/about"] && (<>
            <span className={styles.sep}/>
            <div className="nav-item">
              <ToggleButton prefixIcon="person" href="/about"
                className={`${styles.navBtn} nav-item-btn${isActive("/about",true)?" "+styles.active:""}`}>
                <span className={styles.label}>{navLabel(about.label)}</span>
              </ToggleButton>
              <span className={`nav-dot${isActive("/about",true)?" on":""}`}/>
            </div>
          </>)}

          {routes["/work"] && (<>
            <span className={styles.sep}/>
            <div className="nav-item">
              <ToggleButton prefixIcon="grid" href="/work"
                className={`${styles.navBtn} nav-item-btn${isActive("/work")?" "+styles.active:""}`}>
                <span className={styles.label}>{navLabel(work.label)}</span>
              </ToggleButton>
              <span className={`nav-dot${isActive("/work")?" on":""}`}/>
            </div>
          </>)}

          {routes["/blog"] && (<>
            <span className={styles.sep}/>
            <div className="nav-item">
              <ToggleButton prefixIcon="book" href="/blog"
                className={`${styles.navBtn} nav-item-btn${isActive("/blog")?" "+styles.active:""}`}>
                <span className={styles.label}>{navLabel(blog.label)}</span>
              </ToggleButton>
              <span className={`nav-dot${isActive("/blog")?" on":""}`}/>
            </div>
          </>)}

          {routes["/gallery"] && (<>
            <span className={styles.sep}/>
            <div className="nav-item">
              <ToggleButton prefixIcon="gallery" href="/gallery"
                className={`${styles.navBtn} nav-item-btn${isActive("/gallery")?" "+styles.active:""}`}>
                <span className={styles.label}>{navLabel(gallery.label)}</span>
              </ToggleButton>
              <span className={`nav-dot${isActive("/gallery")?" on":""}`}/>
            </div>
          </>)}

          {display.themeSwitcher && (<>
            <span className={styles.sep}/>
            {/* P8: Wrap intercepts click → increment → CSS toggles rotation class */}
            <div className={`theme-wrap${themeClicks%2===1?" theme-rotated":""}`}
              onClick={()=>setThemeClicks(c=>c+1)}>
              <ThemeToggle/>
            </div>
          </>)}

          <span className={styles.sep}/>
          <LangToggle/>
        </nav>
      </header>
    </>
  );
};
