"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Text } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminShellProps {
  children: React.ReactNode;
  user: User;
}

/* ══════════════════════════════════════════════════════════════════════════════
   ELEGANT ICONS  –  thin 1.5px stroke, refined phosphor-inspired geometry
══════════════════════════════════════════════════════════════════════════════ */
const Icons = {
  dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/>
      <rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>
    </svg>
  ),
  projects: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h3.5l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  ),
  certificates: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="4.5"/><path d="M8.5 21v-3.5l3.5 1 3.5-1V21"/>
      <path d="M4.5 14.5A9 9 0 1 1 19.5 14.5"/>
    </svg>
  ),
  blogs: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  ),
  gallery: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="m3 16 5-5 4 4 3-3 5 5"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
    </svg>
  ),
  media: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M10 9l5 3-5 3V9z"/>
    </svg>
  ),
  analytics: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18"/><path d="M5 20V14"/><path d="M9 20V8"/><path d="M13 20V11"/><path d="M17 20V4"/>
    </svg>
  ),
  about: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  account: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4.5"/>
      <path d="M3.5 21a8.5 8.5 0 0 1 17 0"/>
    </svg>
  ),
  logout: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevronLeft: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  menu: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="12" x2="16" y2="12"/>
      <line x1="4" y1="17" x2="20" y2="17"/>
    </svg>
  ),
  close: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  logo: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
};

const allNavItems = [
  { href: "/reza-control",              label: "Dashboard",    icon: Icons.dashboard,    group: "main" },
  { href: "/reza-control/projects",     label: "Projects",     icon: Icons.projects,     group: "main" },
  { href: "/reza-control/certificates", label: "Certificates", icon: Icons.certificates, group: "main" },
  { href: "/reza-control/blogs",        label: "Blog Posts",   icon: Icons.blogs,        group: "main" },
  { href: "/reza-control/gallery",      label: "Gallery",      icon: Icons.gallery,      group: "content" },
  { href: "/reza-control/media",        label: "Media",        icon: Icons.media,        group: "content" },
  { href: "/reza-control/analytics",   label: "Analytics",    icon: Icons.analytics,    group: "content" },
  { href: "/reza-control/about",        label: "About Page",   icon: Icons.about,        group: "system" },
  { href: "/reza-control/settings",     label: "Settings",     icon: Icons.settings,     group: "system" },
  { href: "/reza-control/account",      label: "Account",      icon: Icons.account,      group: "system" },
];

const bottomPrimary = allNavItems.slice(0, 4);

/* ══════════════════════════════════════════════════════════════════════════════
   LIQUID GLASS CSS  –  theme-aware, no blue override, elegant
   Uses Once UI CSS variables + data-theme detection
══════════════════════════════════════════════════════════════════════════════ */
const LIQUID_GLASS_CSS = `
  /* ── Animations ─────────────────────────────────────────── */
  @keyframes adminDrawerIn {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes adminOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes adminTabPop {
    0%   { transform: scale(0.86); }
    55%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  @keyframes adminSidebarIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ══════════════════════════════════════════════════════════
     DARK MODE  (html[data-theme="dark"] atau sistem gelap)
  ══════════════════════════════════════════════════════════ */
  :root,
  html[data-theme="dark"] {
    --adm-glass-bg:       linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(22,24,30,0.74) 45%, rgba(9,10,14,0.90) 100%);
    --adm-glass-bg-deep:  linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(16,18,23,0.90) 100%);
    --adm-glass-border:   rgba(255, 255, 255, 0.09);
    --adm-glass-border-soft: rgba(255, 255, 255, 0.04);
    --adm-glass-shine:    rgba(255, 255, 255, 0.05);
    --adm-glass-blur:     30px;
    --adm-glass-shadow:   0 20px 60px -12px rgba(0,0,0,0.65), 0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.09) inset;
    --adm-glass-glow:     0 0 60px -8px rgba(var(--brand-rgb, 6,182,212), 0.16);
    --adm-active-bg:      linear-gradient(135deg, rgba(var(--brand-rgb, 6,182,212), 0.20), rgba(var(--brand-rgb, 6,182,212), 0.08));
    --adm-active-border:  rgba(var(--brand-rgb, 6,182,212), 0.30);
    --adm-active-color:   var(--brand-on-background-medium, #22d3ee);
    --adm-active-dot:     var(--brand-background-strong, #0891b2);
    --adm-active-glow:    0 4px 16px -2px rgba(var(--brand-rgb, 6,182,212), 0.35), 0 0 0 1px rgba(var(--brand-rgb, 6,182,212), 0.12) inset;
    --adm-hover-bg:       rgba(255, 255, 255, 0.055);
    --adm-text-strong:    rgba(248, 250, 252, 0.94);
    --adm-text-muted:     rgba(148, 163, 184, 0.62);
    --adm-text-label:     rgba(100, 116, 139, 0.58);
    --adm-divider:        linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 50%, transparent);
    --adm-user-bg:        linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    --adm-user-border:    rgba(255, 255, 255, 0.09);
    --adm-tab-inactive:   rgba(148, 163, 184, 0.50);
    --adm-drawer-bg:      linear-gradient(165deg, rgba(24,26,33,0.97), rgba(10,11,15,0.98));
    --adm-logout-bg:      rgba(239, 68, 68, 0.10);
    --adm-logout-border:  rgba(239, 68, 68, 0.20);
    --adm-logout-color:   rgba(252, 165, 165, 0.85);
    --adm-dot-top-color:  rgba(255, 255, 255, 0.07);
  }

  /* ══════════════════════════════════════════════════════════
     LIGHT MODE
  ══════════════════════════════════════════════════════════ */
  html[data-theme="light"] {
    --adm-glass-bg:       linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.66) 45%, rgba(240,242,247,0.78) 100%);
    --adm-glass-bg-deep:  linear-gradient(155deg, rgba(255,255,255,0.96) 0%, rgba(246,248,251,0.92) 100%);
    --adm-glass-border:   rgba(0, 0, 0, 0.075);
    --adm-glass-border-soft: rgba(0, 0, 0, 0.03);
    --adm-glass-shine:    rgba(255, 255, 255, 0.85);
    --adm-glass-blur:     26px;
    --adm-glass-shadow:   0 20px 50px -14px rgba(15,23,42,0.16), 0 4px 16px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 1px 0 rgba(255,255,255,0.9) inset;
    --adm-glass-glow:     0 0 50px -10px rgba(var(--brand-rgb, 8,145,178), 0.14);
    --adm-active-bg:      linear-gradient(135deg, rgba(var(--brand-rgb, 8,145,178), 0.14), rgba(var(--brand-rgb, 8,145,178), 0.05));
    --adm-active-border:  rgba(var(--brand-rgb, 8,145,178), 0.26);
    --adm-active-color:   var(--brand-on-background-strong, #0e7490);
    --adm-active-dot:     var(--brand-background-strong, #0891b2);
    --adm-active-glow:    0 4px 14px -2px rgba(var(--brand-rgb, 8,145,178), 0.22), 0 0 0 1px rgba(var(--brand-rgb, 8,145,178), 0.10) inset;
    --adm-hover-bg:       rgba(0, 0, 0, 0.04);
    --adm-text-strong:    rgba(15, 23, 42, 0.92);
    --adm-text-muted:     rgba(71, 85, 105, 0.75);
    --adm-text-label:     rgba(100, 116, 139, 0.60);
    --adm-divider:        linear-gradient(90deg, transparent, rgba(0,0,0,0.10) 50%, transparent);
    --adm-user-bg:        linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.35));
    --adm-user-border:    rgba(0, 0, 0, 0.07);
    --adm-tab-inactive:   rgba(71, 85, 105, 0.50);
    --adm-drawer-bg:      linear-gradient(165deg, rgba(255,255,255,0.98), rgba(247,249,252,0.98));
    --adm-logout-bg:      rgba(239, 68, 68, 0.07);
    --adm-logout-border:  rgba(239, 68, 68, 0.18);
    --adm-logout-color:   rgba(185, 28, 28, 0.85);
    --adm-dot-top-color:  rgba(255, 255, 255, 0.85);
  }

  /* ── Bottom mobile nav button ────────────────────────── */
  .adm-mob-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex: 1;
    padding: 8px 4px 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.15s ease;
  }
  .adm-mob-btn.active {
    color: var(--adm-active-color);
    animation: adminTabPop 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  .adm-mob-btn:not(.active) {
    color: var(--adm-tab-inactive);
  }
  .adm-mob-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    font-family: inherit;
  }
  .adm-mob-dot {
    position: absolute;
    top: 4px;
    width: 18px; height: 2.5px;
    border-radius: 0 0 3px 3px;
    background: linear-gradient(90deg, var(--adm-active-color), var(--adm-active-dot));
    box-shadow: 0 1px 8px rgba(var(--brand-rgb, 6,182,212), 0.55);
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.9;
  }

  /* ── Drawer grid items ───────────────────────────────── */
  .adm-drawer-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 13px 8px;
    border-radius: 14px;
    border: 1px solid var(--adm-glass-border);
    cursor: pointer;
    background: var(--adm-hover-bg);
    color: var(--adm-text-muted);
    transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.16s, box-shadow 0.18s;
    -webkit-tap-highlight-color: transparent;
    font-family: inherit;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .adm-drawer-item.active {
    background: var(--adm-active-bg);
    color: var(--adm-active-color);
    border-color: var(--adm-active-border);
    box-shadow: var(--adm-active-glow);
  }
  .adm-drawer-item:active { transform: scale(0.93); }
  .adm-drawer-label {
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    line-height: 1.2;
    font-family: inherit;
  }

  /* ── Desktop sidebar nav items ───────────────────────── */
  .adm-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8.5px 11px;
    border-radius: 11px;
    cursor: pointer;
    background: none;
    border: 1px solid transparent;
    color: var(--adm-text-muted);
    font-size: 12.5px;
    font-weight: 500;
    width: 100%;
    text-align: left;
    font-family: inherit;
    position: relative;
    transition: background 0.22s cubic-bezier(0.4,0,0.2,1), color 0.18s, border-color 0.22s, transform 0.18s, box-shadow 0.22s;
    white-space: nowrap;
    letter-spacing: -0.005em;
  }
  .adm-nav-item::before {
    content: "";
    position: absolute;
    left: -6px; top: 50%;
    width: 3px; height: 0;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, var(--adm-active-color), var(--adm-active-dot));
    transform: translateY(-50%);
    transition: height 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  .adm-nav-item:hover {
    background: var(--adm-hover-bg);
    color: var(--adm-text-strong);
    transform: translateX(2px);
  }
  .adm-nav-item.active {
    background: var(--adm-active-bg) !important;
    color: var(--adm-active-color) !important;
    border-color: var(--adm-active-border) !important;
    box-shadow: var(--adm-active-glow);
    font-weight: 600;
  }
  .adm-nav-item.active::before {
    height: 16px;
  }
  .adm-nav-item.adm-logout {
    color: var(--adm-logout-color);
    border-color: transparent;
  }
  .adm-nav-item.adm-logout::before { display: none; }
  .adm-nav-item.adm-logout:hover {
    background: var(--adm-logout-bg);
    border-color: var(--adm-logout-border);
    color: var(--adm-logout-color);
    transform: none;
    opacity: 1;
  }
  .adm-group-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--adm-text-label);
    padding: 10px 11px 5px;
  }

  /* ── Frosted noise texture (adds tactile, premium grain to glass) ── */
  .adm-noise { position: relative; }
  .adm-noise::after {
    content: "";
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.025;
    mix-blend-mode: overlay;
    pointer-events: none;
    border-radius: inherit;
  }

  /* ── Thin scrollbar ──────────────────────────────────── */
  .adm-scroll::-webkit-scrollbar { width: 3px; }
  .adm-scroll::-webkit-scrollbar-track { background: transparent; }
  .adm-scroll::-webkit-scrollbar-thumb {
    background: var(--adm-glass-border);
    border-radius: 3px;
  }
`;

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryList | MediaQueryListEvent) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/reza-control/login");
    router.refresh();
  };

  const navigate = (href: string) => {
    router.push(href);
    setDrawerOpen(false);
  };

  const isActive = (href: string) =>
    href === "/reza-control"
      ? pathname === "/reza-control"
      : pathname.startsWith(href);

  const currentPage = allNavItems.find((i) =>
    i.href === "/reza-control"
      ? pathname === "/reza-control"
      : pathname.startsWith(i.href)
  );

  /* ════════════════════════════════ MOBILE ════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        background: "var(--page-background)",
        position: "relative",
      }}>
        <style>{LIQUID_GLASS_CSS}</style>

        {/* Ambient liquid-glass glow backdrop */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-10%", right: "-20%", width: "70%", paddingBottom: "70%",
            borderRadius: "50%", background: "var(--brand-alpha-weak)", filter: "blur(60px)", opacity: 0.5,
          }} />
          <div style={{
            position: "absolute", bottom: "-15%", left: "-25%", width: "65%", paddingBottom: "65%",
            borderRadius: "50%", background: "var(--brand-alpha-weak)", filter: "blur(70px)", opacity: 0.35,
          }} />
        </div>

        {/* ── Top Header — floating pill, same glass model as dock/sidebar ── */}
        <div className="adm-noise" style={{
          position: "fixed", top: 12, left: 12, right: 12, zIndex: 50,
          height: 56,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 14px",
          borderRadius: 18,
          background: "var(--adm-glass-bg)",
          backdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
          WebkitBackdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
          border: "1px solid var(--adm-glass-border)",
          boxShadow: "var(--adm-glass-shadow), var(--adm-glass-glow)",
          overflow: "hidden",
        }}>
          {/* Shine */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "linear-gradient(180deg, var(--adm-glass-shine) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(150deg, var(--brand-background-strong), var(--brand-solid-strong, var(--brand-background-strong)) 70%, rgba(0,0,0,0.15))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--brand-on-solid-strong)", flexShrink: 0,
              boxShadow: "0 3px 14px -2px rgba(var(--brand-rgb, 6,182,212), 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset",
            }}>
              {Icons.logo}
            </div>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em",
                color: "var(--adm-text-strong)", lineHeight: 1,
              }}>
                Reza Control
              </div>
              <div style={{
                fontSize: 10, lineHeight: 1, marginTop: 2.5,
                color: "var(--adm-text-label)",
              }}>
                {currentPage?.label ?? "CMS"}
              </div>
            </div>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid var(--adm-glass-border)",
              background: drawerOpen ? "var(--adm-active-bg)" : "var(--adm-hover-bg)",
              color: drawerOpen ? "var(--adm-active-color)" : "var(--adm-text-muted)",
              cursor: "pointer",
              transition: "background 0.16s, color 0.16s",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {drawerOpen ? Icons.close : Icons.menu}
          </button>
        </div>

        {/* ── Full Menu Drawer ── */}
        {drawerOpen && (
          <>
            <div
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.40)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 98,
                animation: "adminOverlayIn 0.2s ease",
              }}
              onClick={() => setDrawerOpen(false)}
            />
            <div className="adm-noise" style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              zIndex: 99,
              background: "var(--adm-drawer-bg)",
              backdropFilter: `blur(var(--adm-glass-blur)) saturate(200%)`,
              WebkitBackdropFilter: `blur(var(--adm-glass-blur)) saturate(200%)`,
              borderRadius: "22px 22px 0 0",
              borderTop: "1px solid var(--adm-glass-border)",
              paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
              animation: "adminDrawerIn 0.26s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.05) inset",
            }}>
              {/* Shine top */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, height: 56,
                background: "linear-gradient(180deg, var(--adm-dot-top-color) 0%, transparent 100%)",
                borderRadius: "22px 22px 0 0",
                pointerEvents: "none",
              }} />

              {/* Drag handle */}
              <div style={{
                width: 36, height: 3.5, borderRadius: 2,
                background: "var(--adm-divider)",
                margin: "14px auto 18px",
              }} />

              {/* User info */}
              <div style={{
                margin: "0 16px 16px",
                padding: "11px 13px",
                borderRadius: 14,
                background: "var(--adm-user-bg)",
                border: "1px solid var(--adm-user-border)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(150deg, var(--brand-alpha-weak), var(--brand-alpha-medium, var(--brand-alpha-weak)))",
                  border: "1px solid var(--adm-active-border)",
                  boxShadow: "0 0 0 3px var(--adm-hover-bg), 0 2px 8px -2px rgba(var(--brand-rgb, 6,182,212), 0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--adm-active-color)", fontWeight: 700, fontSize: 14,
                }}>
                  {user.email?.[0]?.toUpperCase() ?? "R"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--adm-text-strong)", lineHeight: 1.3 }}>Admin</div>
                  <div style={{ fontSize: 11, color: "var(--adm-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Group: Konten */}
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "var(--adm-text-label)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>
                  Konten
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
                  {allNavItems.filter(i => i.group === "main").map((item) => (
                    <button key={item.href} className={`adm-drawer-item${isActive(item.href) ? " active" : ""}`} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="adm-drawer-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group: Media & Data */}
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "var(--adm-text-label)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>
                  Media & Data
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
                  {allNavItems.filter(i => i.group === "content").map((item) => (
                    <button key={item.href} className={`adm-drawer-item${isActive(item.href) ? " active" : ""}`} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="adm-drawer-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group: Sistem */}
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "var(--adm-text-label)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>
                  Sistem
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
                  {allNavItems.filter(i => i.group === "system").map((item) => (
                    <button key={item.href} className={`adm-drawer-item${isActive(item.href) ? " active" : ""}`} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="adm-drawer-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding: "6px 16px 0" }}>
                <div style={{ height: 1, background: "var(--adm-divider)", marginBottom: 12 }} />
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    padding: "11px 16px", borderRadius: 12,
                    border: "1px solid var(--adm-logout-border)",
                    background: "var(--adm-logout-bg)",
                    color: "var(--adm-logout-color)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {Icons.logout}
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Main Content ── */}
        <div style={{
          flex: 1, width: "100%", maxWidth: "100vw",
          padding: "84px 16px 110px",
          overflowX: "hidden", boxSizing: "border-box",
          position: "relative", zIndex: 1,
        }}>
          {children}
        </div>

        {/* ── Bottom Dock — floating rounded, same glass model as desktop sidebar ── */}
        <nav className="adm-noise" style={{
          position: "fixed",
          left: 12, right: 12,
          bottom: "max(env(safe-area-inset-bottom), 12px)",
          zIndex: 50,
          height: 62,
          borderRadius: 20,
          background: "var(--adm-glass-bg)",
          backdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
          WebkitBackdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
          border: "1px solid var(--adm-glass-border)",
          boxShadow: "var(--adm-glass-shadow), var(--adm-glass-glow)",
          display: "flex", alignItems: "stretch",
          overflow: "hidden",
        }}>
          {/* Shine line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "linear-gradient(180deg, var(--adm-dot-top-color) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {bottomPrimary.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                className={`adm-mob-btn${active ? " active" : ""}`}
                onClick={() => navigate(item.href)}
              >
                {active && <div className="adm-mob-dot" />}
                {item.icon}
                <span className="adm-mob-label">{item.label}</span>
              </button>
            );
          })}

          <button
            className={`adm-mob-btn${drawerOpen ? " active" : ""}`}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? Icons.close : Icons.menu}
            <span className="adm-mob-label">Menu</span>
          </button>
        </nav>
      </div>
    );
  }

  /* ════════════════════════════════ DESKTOP ════════════════════════════════ */
  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      width: "100%", background: "var(--page-background)",
    }}>
      <style>{LIQUID_GLASS_CSS}</style>

      {/* Ambient liquid-glass glow backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-15%", right: "-10%", width: "50%", paddingBottom: "50%",
          borderRadius: "50%", background: "var(--brand-alpha-weak)", filter: "blur(80px)", opacity: 0.45,
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "10%", width: "45%", paddingBottom: "45%",
          borderRadius: "50%", background: "var(--brand-alpha-weak)", filter: "blur(90px)", opacity: 0.3,
        }} />
      </div>

      {/* ── Sidebar (Velocity-style floating dock, edge toggle) ── */}
      <div
        style={{
          position: "fixed",
          left: 12, top: 12, bottom: 12,
          width: collapsed ? 64 : 224,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 100,
          animation: "adminSidebarIn 0.30s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Glass surface — clips shine & scroll, rounded */}
        <div className="adm-noise" style={{
          position: "absolute", inset: 0,
          borderRadius: 18,
          background: "var(--adm-glass-bg)",
          backdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
          WebkitBackdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
          border: "1px solid var(--adm-glass-border)",
          boxShadow: "var(--adm-glass-shadow), var(--adm-glass-glow)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Shine top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 72,
            background: "linear-gradient(180deg, var(--adm-dot-top-color) 0%, transparent 100%)",
            borderRadius: "18px 18px 0 0", pointerEvents: "none",
          }} />

          <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "10px 7px", position: "relative" }}>

          {/* Header — logo only, toggle moved to floating edge button */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: "4px 5px 10px", gap: 9,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: "linear-gradient(150deg, var(--brand-background-strong), var(--brand-solid-strong, var(--brand-background-strong)) 70%, rgba(0,0,0,0.15))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--brand-on-solid-strong)", flexShrink: 0,
              boxShadow: "0 3px 12px -2px rgba(var(--brand-rgb, 6,182,212), 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset",
            }}>
              {Icons.logo}
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--adm-text-strong)", lineHeight: 1.1 }}>
                  Reza Control
                </div>
                <div style={{ fontSize: 9, color: "var(--adm-text-label)", letterSpacing: "0.04em", marginTop: 1 }}>
                  CMS Panel
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "var(--adm-divider)", margin: "0 4px 7px" }} />

          {/* Nav groups */}
          <div className="adm-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 0 }}>
            {!collapsed && <div className="adm-group-label">Konten</div>}
            {allNavItems.filter(i => i.group === "main").map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  className={`adm-nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--adm-active-dot)", flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}

            {!collapsed && <div className="adm-group-label" style={{ marginTop: 6 }}>Media & Data</div>}
            {collapsed && <div style={{ height: 7 }} />}
            {allNavItems.filter(i => i.group === "content").map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  className={`adm-nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--adm-active-dot)", flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}

            {!collapsed && <div className="adm-group-label" style={{ marginTop: 6 }}>Sistem</div>}
            {collapsed && <div style={{ height: 7 }} />}
            {allNavItems.filter(i => i.group === "system").map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  className={`adm-nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--adm-active-dot)", flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: "var(--adm-divider)", margin: "7px 4px" }} />

          {/* Footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {!collapsed && (
              <div style={{
                padding: "8px 11px", borderRadius: 11, marginBottom: 2,
                background: "var(--adm-user-bg)",
                border: "1px solid var(--adm-user-border)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(150deg, var(--brand-alpha-weak), var(--brand-alpha-medium, var(--brand-alpha-weak)))",
                  border: "1px solid var(--adm-active-border)",
                  boxShadow: "0 2px 6px -1px rgba(var(--brand-rgb, 6,182,212), 0.30)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--adm-active-color)", fontSize: 9, fontWeight: 700,
                }}>
                  {user.email?.[0]?.toUpperCase() ?? "R"}
                </div>
                <Text variant="body-default-xs" style={{
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "block", color: "var(--adm-text-muted)",
                }}>
                  {user.email}
                </Text>
              </div>
            )}
            <button
              className="adm-nav-item adm-logout"
              onClick={handleLogout}
              title={collapsed ? "Sign Out" : undefined}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <span style={{ flexShrink: 0, width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Icons.logout}
              </span>
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
          </div>
        </div>

        {/* Floating edge toggle — Velocity-style circular button, vertically centered */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            position: "absolute", top: "50%", right: -13,
            transform: "translateY(-50%) scale(1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, borderRadius: "50%",
            background: "var(--adm-glass-bg-deep)",
            backdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
            WebkitBackdropFilter: `blur(var(--adm-glass-blur)) saturate(180%)`,
            border: "1px solid var(--adm-glass-border)",
            boxShadow: "0 4px 16px -2px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset",
            cursor: "pointer", color: "var(--adm-text-muted)",
            transition: "background 0.18s, color 0.18s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s",
            zIndex: 101,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--adm-active-bg)";
            e.currentTarget.style.color = "var(--adm-active-color)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.10)";
            e.currentTarget.style.boxShadow = "0 4px 18px -2px rgba(var(--brand-rgb, 6,182,212), 0.45), 0 0 0 1px rgba(255,255,255,0.08) inset";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--adm-glass-bg-deep)";
            e.currentTarget.style.color = "var(--adm-text-muted)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px -2px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset";
          }}
        >
          {collapsed ? Icons.chevronRight : Icons.chevronLeft}
        </button>
      </div>

      {/* ── Main Content ── */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? 92 : 252,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        padding: "24px 24px 24px 0",
        minHeight: "100vh",
        width: `calc(100vw - ${collapsed ? 92 : 252}px)`,
        maxWidth: `calc(100vw - ${collapsed ? 92 : 252}px)`,
        overflowX: "hidden",
        boxSizing: "border-box",
        position: "relative", zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}
