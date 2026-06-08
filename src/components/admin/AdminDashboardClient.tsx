"use client";

import { Text, Button } from "@once-ui-system/core";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface DashboardStats {
  counts: { projects: number; blogs: number; certificates: number; media: number };
  visitors: { today: number; month: number; total: number };
  recentProjects: Array<{ id: string; title_id: string; slug: string; published: boolean; created_at: string }>;
  recentBlogs: Array<{ id: string; title_id: string; slug: string; published: boolean; created_at: string }>;
  activityLogs: Array<{ id: string; action: string; entity_type: string; created_at: string }>;
}

const ContentIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    projects: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7a2 2 0 0 1 2-2h4l2 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
      </svg>
    ),
    blogs: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    certificates: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5"/><path d="M9 21v-4l3 1 3-1v4"/><path d="M6 13.18A7 7 0 0 0 5 17v4"/>
        <path d="M18 13.18A7 7 0 0 1 19 17v4"/>
      </svg>
    ),
    media: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  };
  return <span style={{ display: "flex" }}>{icons[type]}</span>;
};

const VisitorIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    today: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    month: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    total: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  };
  return <span style={{ display: "flex" }}>{icons[type]}</span>;
};

/* Card color config */
const CARD_COLORS: Record<string, { icon: string; glow: string; border: string; bg: string }> = {
  projects:     { icon: "linear-gradient(135deg,#6366f1,#818cf8)", glow: "rgba(99,102,241,0.22)", border: "rgba(129,140,248,0.25)", bg: "rgba(99,102,241,0.08)" },
  blogs:        { icon: "linear-gradient(135deg,#0ea5e9,#38bdf8)", glow: "rgba(14,165,233,0.22)", border: "rgba(56,189,248,0.25)", bg: "rgba(14,165,233,0.08)" },
  certificates: { icon: "linear-gradient(135deg,#14b8a6,#2dd4bf)", glow: "rgba(20,184,166,0.22)", border: "rgba(45,212,191,0.25)", bg: "rgba(20,184,166,0.08)" },
  media:        { icon: "linear-gradient(135deg,#f59e0b,#fbbf24)", glow: "rgba(245,158,11,0.22)", border: "rgba(251,191,36,0.25)", bg: "rgba(245,158,11,0.08)" },
  today:        { icon: "linear-gradient(135deg,#8b5cf6,#a78bfa)", glow: "rgba(139,92,246,0.22)", border: "rgba(167,139,250,0.25)", bg: "rgba(139,92,246,0.08)" },
  month:        { icon: "linear-gradient(135deg,#ec4899,#f472b6)", glow: "rgba(236,72,153,0.22)", border: "rgba(244,114,182,0.25)", bg: "rgba(236,72,153,0.08)" },
  total:        { icon: "linear-gradient(135deg,#10b981,#34d399)", glow: "rgba(16,185,129,0.22)", border: "rgba(52,211,153,0.25)", bg: "rgba(16,185,129,0.08)" },
};

export function AdminDashboardClient({ stats }: { stats: DashboardStats }) {
  const router = useRouter();

  const contentCards = [
    { key: "projects",     label: "Projects",     value: stats.counts.projects,     href: "/reza-control/projects",     desc: "Proyek aktif" },
    { key: "blogs",        label: "Blog Posts",   value: stats.counts.blogs,        href: "/reza-control/blogs",        desc: "Artikel tersimpan" },
    { key: "certificates", label: "Certificates", value: stats.counts.certificates, href: "/reza-control/certificates", desc: "Sertifikat" },
    { key: "media",        label: "Media Files",  value: stats.counts.media,        href: "/reza-control/media",        desc: "File media" },
  ];

  const visitorCards = [
    { key: "today",  label: "Hari Ini",        value: stats.visitors.today,  sub: "Sejak tengah malam" },
    { key: "month",  label: "Bulan Ini",       value: stats.visitors.month,  sub: "30 hari terakhir" },
    { key: "total",  label: "Total",           value: stats.visitors.total,  sub: "Sepanjang waktu" },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 28,
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    }}>

      {/* ── Welcome ── */}
      <div style={{
        padding: "20px 24px",
        borderRadius: 20,
        background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(56,189,248,0.08) 50%, rgba(20,184,166,0.06) 100%)",
        border: "1px solid rgba(129,140,248,0.20)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(180,210,255,0.08)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--neutral-on-background-strong)", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
          Dashboard
        </div>
        <div style={{ fontSize: 13, color: "var(--neutral-on-background-weak)", marginTop: 4 }}>
          Selamat datang di Reza Control Panel.
        </div>
      </div>

      {/* ── Content Stats ── */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neutral-on-background-weak)", marginBottom: 12, opacity: 0.6 }}>
          Konten
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          width: "100%",
        }}>
          {contentCards.map((card) => {
            const col = CARD_COLORS[card.key];
            return (
              <button
                key={card.key}
                onClick={() => router.push(card.href)}
                style={{
                  all: "unset",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  padding: "18px 18px",
                  borderRadius: 18,
                  border: `1px solid ${col.border}`,
                  background: col.bg,
                  cursor: "pointer",
                  transition: "transform 0.18s, box-shadow 0.18s, background 0.18s",
                  position: "relative",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 32px ${col.glow}`;
                  (e.currentTarget as HTMLButtonElement).style.background = `${col.bg.replace("0.08", "0.14")}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLButtonElement).style.background = col.bg;
                }}
              >
                {/* Subtle shine */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
                  borderRadius: "inherit", pointerEvents: "none",
                }} />
                <div style={{
                  width: 42, height: 42, borderRadius: 13,
                  background: col.icon,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white",
                  boxShadow: `0 4px 16px ${col.glow}`,
                }}>
                  <ContentIcon type={card.key} />
                </div>
                <div>
                  <div style={{
                    fontSize: "2rem", fontWeight: 700, lineHeight: 1,
                    color: "var(--neutral-on-background-strong)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {card.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-on-background-medium)", marginTop: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", marginTop: 2 }}>
                    {card.desc}
                  </div>
                </div>
                <div style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--neutral-on-background-weak)", opacity: 0.4,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Visitor Stats ── */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neutral-on-background-weak)", marginBottom: 12, opacity: 0.6 }}>
          Statistik Pengunjung
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
          width: "100%",
        }}>
          {visitorCards.map((card) => {
            const col = CARD_COLORS[card.key];
            return (
              <div
                key={card.key}
                style={{
                  padding: "18px 18px",
                  borderRadius: 18,
                  border: `1px solid ${col.border}`,
                  background: col.bg,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxSizing: "border-box",
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: col.icon,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white",
                  boxShadow: `0 4px 14px ${col.glow}`,
                }}>
                  <VisitorIcon type={card.key} />
                </div>
                <div>
                  <div style={{
                    fontSize: "1.75rem", fontWeight: 700, lineHeight: 1,
                    color: "var(--neutral-on-background-strong)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {card.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-on-background-medium)", marginTop: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", marginTop: 2 }}>
                    {card.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Content ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
        width: "100%",
      }}>
        {/* Recent Projects */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neutral-on-background-weak)", opacity: 0.6 }}>
              Proyek Terbaru
            </div>
            <Button href="/reza-control/projects" variant="tertiary" size="s" arrowIcon>
              Lihat semua
            </Button>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 16,
            border: "1px solid rgba(120,160,255,0.12)",
            overflow: "hidden",
            width: "100%",
          }}>
            {stats.recentProjects.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <Text variant="body-default-s" onBackground="neutral-weak">Belum ada proyek.</Text>
              </div>
            ) : (
              stats.recentProjects.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/reza-control/projects/${p.id}`)}
                  style={{
                    all: "unset",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    cursor: "pointer",
                    borderBottom: i < stats.recentProjects.length - 1 ? "1px solid rgba(120,160,255,0.08)" : "none",
                    transition: "background 0.12s",
                    gap: 12,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(120,160,255,0.06)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: "var(--neutral-on-background-strong)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.title_id}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
                      {format(new Date(p.created_at), "d MMM yyyy")}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0,
                    background: p.published ? "rgba(99,102,241,0.15)" : "rgba(100,116,139,0.12)",
                    color: p.published ? "#a5b4fc" : "var(--neutral-on-background-weak)",
                    border: `1px solid ${p.published ? "rgba(129,140,248,0.25)" : "transparent"}`,
                  }}>
                    {p.published ? "Tayang" : "Draft"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Recent Blogs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neutral-on-background-weak)", opacity: 0.6 }}>
              Blog Terbaru
            </div>
            <Button href="/reza-control/blogs" variant="tertiary" size="s" arrowIcon>
              Lihat semua
            </Button>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 16,
            border: "1px solid rgba(120,160,255,0.12)",
            overflow: "hidden",
            width: "100%",
          }}>
            {stats.recentBlogs.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <Text variant="body-default-s" onBackground="neutral-weak">Belum ada blog.</Text>
              </div>
            ) : (
              stats.recentBlogs.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/reza-control/blogs/${b.id}`)}
                  style={{
                    all: "unset",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    cursor: "pointer",
                    borderBottom: i < stats.recentBlogs.length - 1 ? "1px solid rgba(120,160,255,0.08)" : "none",
                    transition: "background 0.12s",
                    gap: 12,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(120,160,255,0.06)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: "var(--neutral-on-background-strong)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {b.title_id}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
                      {format(new Date(b.created_at), "d MMM yyyy")}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0,
                    background: b.published ? "rgba(99,102,241,0.15)" : "rgba(100,116,139,0.12)",
                    color: b.published ? "#a5b4fc" : "var(--neutral-on-background-weak)",
                    border: `1px solid ${b.published ? "rgba(129,140,248,0.25)" : "transparent"}`,
                  }}>
                    {b.published ? "Tayang" : "Draft"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neutral-on-background-weak)", marginBottom: 12, opacity: 0.6 }}>
          Aksi Cepat
        </div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          width: "100%",
        }}>
          {[
            { label: "Proyek Baru",     href: "/reza-control/projects/new",      bg: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.08))", border: "rgba(129,140,248,0.25)", color: "#a5b4fc",  glow: "rgba(99,102,241,0.25)" },
            { label: "Blog Baru",       href: "/reza-control/blogs/new",         bg: "linear-gradient(135deg,rgba(14,165,233,0.15),rgba(14,165,233,0.08))",  border: "rgba(56,189,248,0.25)",  color: "#7dd3fc",  glow: "rgba(14,165,233,0.25)" },
            { label: "Sertifikat Baru", href: "/reza-control/certificates/new",  bg: "linear-gradient(135deg,rgba(20,184,166,0.15),rgba(20,184,166,0.08))",  border: "rgba(45,212,191,0.25)",  color: "#5eead4",  glow: "rgba(20,184,166,0.25)" },
            { label: "Edit Profil",     href: "/reza-control/about",             bg: "linear-gradient(135deg,rgba(100,116,139,0.15),rgba(100,116,139,0.08))", border: "rgba(100,116,139,0.20)", color: "#94a3b8", glow: "rgba(100,116,139,0.2)" },
          ].map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              style={{
                all: "unset",
                padding: "11px 18px",
                borderRadius: 12,
                background: action.bg,
                border: `1px solid ${action.border}`,
                color: action.color,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
                boxSizing: "border-box",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${action.glow}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {action.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
