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

const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  projects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7a2 2 0 0 1 2-2h4l2 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
    </svg>
  ),
  certificates: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5"/><path d="M9 21v-4l3 1 3-1v4"/>
    </svg>
  ),
  blogs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  gallery: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  media: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  about: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  account: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevronLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  logo: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
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

/* ── Shared Liquid Glass CSS ─────────────────────────────────────────── */
const LIQUID_GLASS_CSS = `
  :root {
    --glass-bg: rgba(10, 15, 30, 0.55);
    --glass-border: rgba(120, 160, 255, 0.18);
    --glass-shine: rgba(180, 210, 255, 0.10);
    --glass-blur: 28px;
    --glass-saturate: 180%;
    --glass-shadow: 0 8px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(180,210,255,0.12) inset;
    --brand-glow: rgba(99, 102, 241, 0.35);
    --teal-glow: rgba(20, 184, 166, 0.25);
  }

  @keyframes drawerIn {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes adminTabPop {
    0%   { transform: scale(0.88); }
    60%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes sidebarIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* ── Bottom mobile nav ── */
  .mob-nav-btn {
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
  .mob-nav-btn.active {
    color: #a5b4fc;
    animation: adminTabPop 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .mob-nav-btn:not(.active) {
    color: rgba(148,163,184,0.65);
  }
  .mob-nav-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    font-family: inherit;
  }
  .mob-nav-dot {
    position: absolute;
    top: 4px;
    width: 20px; height: 3px;
    border-radius: 0 0 4px 4px;
    background: linear-gradient(90deg, #818cf8, #38bdf8);
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 8px rgba(129,140,248,0.6);
  }

  /* ── Drawer items ── */
  .drawer-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 14px 8px;
    border-radius: 16px;
    border: 1px solid rgba(120,160,255,0.10);
    cursor: pointer;
    background: rgba(20,28,58,0.55);
    color: rgba(148,163,184,0.8);
    transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.15s, box-shadow 0.18s;
    -webkit-tap-highlight-color: transparent;
    font-family: inherit;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .drawer-item.active {
    background: rgba(99,102,241,0.18);
    color: #a5b4fc;
    border-color: rgba(129,140,248,0.35);
    box-shadow: 0 0 16px rgba(99,102,241,0.2), inset 0 1px 0 rgba(165,180,252,0.15);
  }
  .drawer-item:active { transform: scale(0.94); }
  .drawer-label {
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    line-height: 1.2;
    font-family: inherit;
  }

  /* ── Desktop sidebar nav items ── */
  .cms-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 12px;
    cursor: pointer;
    background: none;
    border: none;
    color: rgba(148,163,184,0.7);
    font-size: 13px;
    font-weight: 500;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: background 0.16s, color 0.16s, transform 0.16s, box-shadow 0.16s;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }
  .cms-nav-item:hover {
    background: rgba(120,160,255,0.10);
    color: rgba(226,232,240,0.95);
    transform: translateX(2px);
  }
  .cms-nav-item.active {
    background: rgba(99,102,241,0.18) !important;
    color: #a5b4fc !important;
    font-weight: 600;
    box-shadow: 0 0 16px rgba(99,102,241,0.15), inset 0 1px 0 rgba(165,180,252,0.12);
    border: 1px solid rgba(129,140,248,0.22);
  }
  .cms-nav-item.logout-btn { color: rgba(248,113,113,0.75); }
  .cms-nav-item.logout-btn:hover {
    background: rgba(239,68,68,0.12);
    color: #fca5a5;
    transform: none;
  }
  .cms-group-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(100,116,139,0.65);
    padding: 8px 12px 4px;
  }

  /* ── Liquid glass scrollbar ── */
  .cms-scroll::-webkit-scrollbar { width: 4px; }
  .cms-scroll::-webkit-scrollbar-track { background: transparent; }
  .cms-scroll::-webkit-scrollbar-thumb {
    background: rgba(120,160,255,0.18);
    border-radius: 4px;
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

  /* ═══════════════════════════ MOBILE ═══════════════════════════════ */
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

        {/* ── Top Header Bar – LIQUID GLASS ── */}
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          /* Liquid glass effect */
          background: "linear-gradient(135deg, rgba(10,15,40,0.70) 0%, rgba(20,25,60,0.65) 50%, rgba(10,20,50,0.70) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderBottom: "1px solid rgba(120,160,255,0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(180,210,255,0.08) inset",
        }}>
          {/* Shine overlay */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "50%",
            background: "linear-gradient(180deg, rgba(180,210,255,0.07) 0%, transparent 100%)",
            borderRadius: "inherit",
            pointerEvents: "none",
          }} />

          {/* Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #38bdf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", flexShrink: 0,
              boxShadow: "0 0 16px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.3)",
            }}>
              {Icons.logo}
            </div>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em",
                color: "rgba(226,232,240,0.95)", lineHeight: 1,
              }}>
                Reza Control
              </div>
              <div style={{
                fontSize: 10, lineHeight: 1, marginTop: 2,
                color: "rgba(148,163,184,0.65)",
                letterSpacing: "0.01em",
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
              width: 38, height: 38, borderRadius: 12,
              border: "1px solid rgba(120,160,255,0.20)",
              background: drawerOpen
                ? "rgba(99,102,241,0.20)"
                : "rgba(255,255,255,0.05)",
              color: "rgba(226,232,240,0.9)",
              cursor: "pointer",
              transition: "background 0.18s, box-shadow 0.18s",
              boxShadow: drawerOpen ? "0 0 14px rgba(99,102,241,0.25)" : "none",
              position: "relative",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {drawerOpen ? Icons.close : Icons.menu}
          </button>
        </div>

        {/* ── Full Menu Drawer (slide up) ── */}
        {drawerOpen && (
          <>
            <div
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                zIndex: 98,
                animation: "overlayIn 0.2s ease",
              }}
              onClick={() => setDrawerOpen(false)}
            />
            <div style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              zIndex: 99,
              /* Liquid glass drawer */
              background: "linear-gradient(170deg, rgba(10,15,40,0.92) 0%, rgba(15,22,55,0.95) 100%)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              borderRadius: "24px 24px 0 0",
              borderTop: "1px solid rgba(120,160,255,0.18)",
              borderLeft: "1px solid rgba(120,160,255,0.10)",
              borderRight: "1px solid rgba(120,160,255,0.10)",
              paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
              animation: "drawerIn 0.28s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.5), 0 -1px 0 rgba(180,210,255,0.10) inset",
            }}>
              {/* Shine top */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 60,
                background: "linear-gradient(180deg, rgba(180,210,255,0.08) 0%, transparent 100%)",
                borderRadius: "24px 24px 0 0",
                pointerEvents: "none",
              }} />

              {/* Drag handle */}
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: "linear-gradient(90deg, #6366f1, #38bdf8)",
                margin: "14px auto 18px",
                boxShadow: "0 0 10px rgba(99,102,241,0.4)",
              }} />

              {/* User info */}
              <div style={{
                margin: "0 16px 18px",
                padding: "12px 14px",
                borderRadius: 16,
                background: "rgba(30,40,80,0.60)",
                border: "1px solid rgba(120,160,255,0.16)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(56,189,248,0.4))",
                  border: "1px solid rgba(129,140,248,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a5b4fc", fontWeight: 700, fontSize: 14,
                  boxShadow: "0 0 12px rgba(99,102,241,0.3)",
                }}>
                  {user.email?.[0]?.toUpperCase() ?? "R"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(226,232,240,0.9)", lineHeight: 1.3 }}>Admin</div>
                  <div style={{ fontSize: 11, color: "rgba(100,116,139,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Group: Konten */}
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
                  Konten
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {allNavItems.filter(i => i.group === "main").map((item) => (
                    <button key={item.href} className={`drawer-item${isActive(item.href) ? " active" : ""}`} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="drawer-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group: Media & Data */}
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
                  Media & Data
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {allNavItems.filter(i => i.group === "content").map((item) => (
                    <button key={item.href} className={`drawer-item${isActive(item.href) ? " active" : ""}`} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="drawer-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group: Sistem */}
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
                  Sistem
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {allNavItems.filter(i => i.group === "system").map((item) => (
                    <button key={item.href} className={`drawer-item${isActive(item.href) ? " active" : ""}`} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="drawer-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding: "8px 16px 0" }}>
                <div style={{ height: 1, background: "rgba(120,160,255,0.10)", marginBottom: 12 }} />
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    padding: "12px 16px", borderRadius: 14,
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.10)",
                    color: "#fca5a5",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
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
          flex: 1,
          width: "100%",
          maxWidth: "100vw",
          padding: "16px 16px 96px",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}>
          {children}
        </div>

        {/* ── Bottom Navigation Bar – LIQUID GLASS ── */}
        <nav style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 50,
          height: "calc(62px + env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
          /* Liquid glass */
          background: "linear-gradient(135deg, rgba(10,15,40,0.78) 0%, rgba(15,20,55,0.80) 50%, rgba(10,15,45,0.78) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderTop: "1px solid rgba(120,160,255,0.18)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(180,210,255,0.08) inset",
          display: "flex",
          alignItems: "stretch",
          width: "100%",
        }}>
          {/* Shine */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(180,210,255,0.25), transparent)",
            pointerEvents: "none",
          }} />

          {bottomPrimary.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                className={`mob-nav-btn${active ? " active" : ""}`}
                onClick={() => navigate(item.href)}
              >
                {active && <div className="mob-nav-dot" />}
                {item.icon}
                <span className="mob-nav-label">{item.label}</span>
              </button>
            );
          })}

          <button
            className={`mob-nav-btn${drawerOpen ? " active" : ""}`}
            onClick={() => setDrawerOpen((v) => !v)}
            style={{ color: drawerOpen ? "#a5b4fc" : "rgba(148,163,184,0.65)" }}
          >
            {drawerOpen ? Icons.close : Icons.menu}
            <span className="mob-nav-label">Menu</span>
          </button>
        </nav>
      </div>
    );
  }

  /* ═══════════════════════════ DESKTOP ═══════════════════════════════ */
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      background: "var(--page-background)",
    }}>
      <style>{LIQUID_GLASS_CSS}</style>

      {/* ── Sidebar – LIQUID GLASS ── */}
      <div
        style={{
          position: "fixed",
          left: 12, top: 12, bottom: 12,
          width: collapsed ? 64 : 228,
          transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 100,
          borderRadius: 20,
          /* Liquid glass sidebar */
          background: "linear-gradient(160deg, rgba(10,15,42,0.80) 0%, rgba(14,20,54,0.85) 50%, rgba(8,14,40,0.82) 100%)",
          backdropFilter: "blur(32px) saturate(190%)",
          WebkitBackdropFilter: "blur(32px) saturate(190%)",
          border: "1px solid rgba(120,160,255,0.15)",
          boxShadow: `
            0 8px 48px rgba(0,0,0,0.5),
            0 2px 8px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(180,210,255,0.10),
            inset 1px 0 0 rgba(180,210,255,0.05)
          `,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "sidebarIn 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Shine top strip */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 80,
          background: "linear-gradient(180deg, rgba(180,210,255,0.07) 0%, transparent 100%)",
          borderRadius: "20px 20px 0 0",
          pointerEvents: "none",
        }} />

        {/* Orb glow behind */}
        <div style={{
          position: "absolute",
          top: -20, left: -20,
          width: 120, height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px 8px", position: "relative" }}>

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "4px 6px 10px",
            gap: 8,
          }}>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", flexShrink: 0,
                  boxShadow: "0 0 14px rgba(99,102,241,0.4), 0 2px 6px rgba(0,0,0,0.4)",
                }}>
                  {Icons.logo}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.02em", color: "rgba(226,232,240,0.95)", lineHeight: 1.1 }}>
                    Reza Control
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(100,116,139,0.65)", letterSpacing: "0.04em" }}>
                    CMS Panel
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(120,160,255,0.16)",
                cursor: "pointer",
                color: "rgba(100,116,139,0.8)",
                transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                e.currentTarget.style.color = "#a5b4fc";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(100,116,139,0.8)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {collapsed ? Icons.chevronRight : Icons.chevronLeft}
            </button>
          </div>

          <div style={{ height: 1, background: "rgba(120,160,255,0.10)", margin: "0 4px 8px" }} />

          {/* Nav groups */}
          <div className="cms-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 0 }}>
            {!collapsed && <div className="cms-group-label">Konten</div>}
            {allNavItems.filter(i => i.group === "main").map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  className={`cms-nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                      flexShrink: 0,
                      boxShadow: "0 0 6px rgba(129,140,248,0.6)",
                    }} />
                  )}
                </button>
              );
            })}

            {!collapsed && <div className="cms-group-label" style={{ marginTop: 6 }}>Media & Data</div>}
            {collapsed && <div style={{ height: 8 }} />}
            {allNavItems.filter(i => i.group === "content").map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  className={`cms-nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                      flexShrink: 0,
                      boxShadow: "0 0 6px rgba(129,140,248,0.6)",
                    }} />
                  )}
                </button>
              );
            })}

            {!collapsed && <div className="cms-group-label" style={{ marginTop: 6 }}>Sistem</div>}
            {collapsed && <div style={{ height: 8 }} />}
            {allNavItems.filter(i => i.group === "system").map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  className={`cms-nav-item${active ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                      flexShrink: 0,
                      boxShadow: "0 0 6px rgba(129,140,248,0.6)",
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: "rgba(120,160,255,0.10)", margin: "8px 4px" }} />

          {/* Footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {!collapsed && (
              <div style={{
                padding: "8px 12px", borderRadius: 12, marginBottom: 2,
                background: "rgba(30,40,80,0.50)",
                border: "1px solid rgba(120,160,255,0.12)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.45), rgba(56,189,248,0.35))",
                  border: "1px solid rgba(129,140,248,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a5b4fc", fontSize: 10, fontWeight: 700,
                }}>
                  {user.email?.[0]?.toUpperCase() ?? "R"}
                </div>
                <Text variant="body-default-xs" style={{
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "block", color: "rgba(100,116,139,0.75)",
                }}>
                  {user.email}
                </Text>
              </div>
            )}
            <button
              className="cms-nav-item logout-btn"
              onClick={handleLogout}
              title={collapsed ? "Sign Out" : undefined}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <span style={{ flexShrink: 0, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Icons.logout}
              </span>
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? 88 : 252,
        transition: "margin-left 0.26s cubic-bezier(0.4,0,0.2,1)",
        padding: "24px 24px 24px 0",
        minHeight: "100vh",
        width: `calc(100vw - ${collapsed ? 88 : 252}px)`,
        maxWidth: `calc(100vw - ${collapsed ? 88 : 252}px)`,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}>
        {children}
      </div>
    </div>
  );
}
