"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Column, Row, Text, Line } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import styles from "./AdminShell.module.scss";

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
  gallery: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  more: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
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
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const allNavItems = [
  { href: "/reza-control",              label: "Dashboard",      icon: Icons.dashboard },
  { href: "/reza-control/projects",     label: "Projects",       icon: Icons.projects },
  { href: "/reza-control/certificates", label: "Certificates",   icon: Icons.certificates },
  { href: "/reza-control/blogs",        label: "Blog Posts",     icon: Icons.blogs },
  { href: "/reza-control/gallery",      label: "Gallery",        icon: Icons.gallery },
  { href: "/reza-control/media",        label: "Media Library",  icon: Icons.media },
  { href: "/reza-control/analytics",    label: "Analytics",      icon: Icons.analytics },
  { href: "/reza-control/about",        label: "About Page",     icon: Icons.about },
  { href: "/reza-control/settings",     label: "Site Settings",  icon: Icons.settings },
  { href: "/reza-control/account",      label: "My Account",     icon: Icons.account },
];

// Bottom nav shows only 4 primary items + "More" drawer
const bottomPrimary = allNavItems.slice(0, 4);

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryList | MediaQueryListEvent) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close "more" drawer on route change
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/reza-control/login");
    router.refresh();
  };

  const navigate = (href: string) => {
    router.push(href);
    setMoreOpen(false);
  };

  const isActive = (href: string) =>
    href === "/reza-control"
      ? pathname === "/reza-control"
      : pathname.startsWith(href);

  // ── Mobile layout ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* More drawer overlay */}
        {moreOpen && (
          <div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              zIndex: 299,
              animation: "fadeIn 0.2s ease",
            }}
            onClick={() => setMoreOpen(false)}
          />
        )}

        {/* More drawer — slides up from bottom */}
        <div style={{
          position: "fixed",
          bottom: moreOpen ? 68 : -400,
          left: 0, right: 0,
          background: "var(--neutral-background-strong)",
          borderRadius: "20px 20px 0 0",
          padding: "16px 12px 12px",
          zIndex: 300,
          transition: "bottom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
          border: "1px solid var(--neutral-alpha-weak)",
          borderBottom: "none",
        }}>
          {/* Drawer handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: "var(--neutral-alpha-medium)",
            margin: "0 auto 16px",
          }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {allNavItems.slice(4).map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                style={{
                  all: "unset",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "12px 8px", borderRadius: 14, gap: 6,
                  cursor: "pointer",
                  background: isActive(item.href) ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
                  color: isActive(item.href) ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-medium)",
                  transition: "background 0.15s",
                }}
              >
                {item.icon}
                <span style={{ fontSize: 10, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                  {item.label}
                </span>
              </button>
            ))}

            {/* Logout in drawer */}
            <button
              onClick={handleLogout}
              style={{
                all: "unset",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "12px 8px", borderRadius: 14, gap: 6,
                cursor: "pointer",
                background: "var(--danger-alpha-weak)",
                color: "var(--danger-on-background-medium)",
                transition: "background 0.15s",
              }}
            >
              {Icons.logout}
              <span style={{ fontSize: 10, fontWeight: 600 }}>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          padding: "16px 16px 80px", // 80px = bottom nav height
          overflowY: "auto",
        }}>
          {children}
        </div>

        {/* Bottom Navigation Bar — always visible */}
        <nav style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          height: 64,
          background: "var(--neutral-background-strong)",
          borderTop: "1px solid var(--neutral-alpha-weak)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 200,
          paddingBottom: "env(safe-area-inset-bottom)",
          backdropFilter: "blur(12px)",
        }}>
          {bottomPrimary.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                style={{
                  all: "unset",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4,
                  padding: "6px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  color: active ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
                  position: "relative",
                  minWidth: 56,
                  justifyContent: "center",
                  transition: "color 0.15s",
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 32, height: 3,
                    borderRadius: "0 0 4px 4px",
                    background: "var(--brand-background-strong)",
                  }} />
                )}
                {item.icon}
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1 }}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            style={{
              all: "unset",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
              padding: "6px 12px",
              borderRadius: 12,
              cursor: "pointer",
              color: moreOpen ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
              minWidth: 56, justifyContent: "center",
              transition: "color 0.15s",
            }}
          >
            {moreOpen ? Icons.close : Icons.more}
            <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1 }}>
              {moreOpen ? "Close" : "More"}
            </span>
          </button>
        </nav>
      </div>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────
  return (
    <Row fillWidth style={{ minHeight: "100vh", background: "var(--page-background)" }}>
      <style>{`
        @keyframes sidebarSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .cms-sidebar-inner {
          animation: sidebarSlideIn 0.32s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cms-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          background: none;
          border: none;
          color: var(--neutral-on-background-weak);
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          text-align: left;
          transition: background 0.14s, color 0.14s, transform 0.14s;
          white-space: nowrap;
          position: relative;
          letter-spacing: -0.01em;
        }
        .cms-nav-item:hover {
          background: color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
          color: var(--neutral-on-background-strong);
          transform: translateX(2px);
        }
        .cms-nav-item.active {
          background: color-mix(in srgb, var(--brand-background-strong) 12%, transparent) !important;
          color: var(--brand-on-background-strong) !important;
          font-weight: 600;
        }
        .cms-nav-item.logout-btn {
          color: var(--danger-on-background-weak);
        }
        .cms-nav-item.logout-btn:hover {
          background: var(--danger-alpha-weak);
          color: var(--danger-on-background-strong);
          transform: none;
        }
      `}</style>

      {/* ── Floating Liquid Glass Sidebar ─────────────────────── */}
      <div style={{
        position: "fixed",
        left: 12,
        top: 12,
        bottom: 12,
        width: collapsed ? 60 : 220,
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 100,
        borderRadius: 20,
        // Liquid glass effect
        background: "color-mix(in srgb, var(--neutral-background-strong) 72%, transparent)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid color-mix(in srgb, var(--neutral-on-background-strong) 9%, transparent)",
        boxShadow: `
          0 8px 40px color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent),
          0 2px 8px color-mix(in srgb, var(--neutral-on-background-strong) 4%, transparent),
          inset 0 1px 0 color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)
        `,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <div className="cms-sidebar-inner" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px 8px" }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "4px 8px 12px",
            gap: 8,
          }}>
            {!collapsed && (
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em",
                  color: "var(--brand-on-background-strong)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: "var(--brand-background-strong)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brand-on-background-strong)",
                    flexShrink: 0,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                  Reza Control
                </div>
                <div style={{ fontSize: 10, color: "var(--neutral-on-background-weak)", marginTop: 2, paddingLeft: 26, letterSpacing: "0.04em" }}>
                  CMS Panel
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                background: "none",
                border: "1px solid color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent)",
                cursor: "pointer",
                color: "var(--neutral-on-background-weak)",
                transition: "background 0.15s, color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-weak)"; e.currentTarget.style.color = "var(--neutral-on-background-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--neutral-on-background-weak)"; }}
            >
              {collapsed ? Icons.chevronRight : Icons.chevronLeft}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)", margin: "0 4px 8px" }} />

          {/* Nav Items */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", overflowX: "hidden" }}>
            {allNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`cms-nav-item${active ? " active" : ""}`}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  {active && !collapsed && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-background-strong)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent)", margin: "8px 4px" }} />

          {/* Footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {!collapsed && (
              <div style={{
                padding: "6px 12px", borderRadius: 8,
                background: "color-mix(in srgb, var(--neutral-on-background-strong) 5%, transparent)",
                marginBottom: 2,
              }}>
                <Text variant="body-default-xs" onBackground="neutral-weak"
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                  {user.email}
                </Text>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="cms-nav-item logout-btn"
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

      {/* Main content — offset sidebar */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? 84 : 244,
        transition: "margin-left 0.26s cubic-bezier(0.4,0,0.2,1)",
        padding: "24px 24px 24px 0",
        minHeight: "100vh",
        maxWidth: `calc(100vw - ${collapsed ? 84 : 244}px)`,
      }}>
        {children}
      </div>
    </Row>
  );
}
