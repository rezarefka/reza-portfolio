"use client";

import { Column, Row, Text } from "@once-ui-system/core";
import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  Cell, PieChart, Pie,
} from "recharts";
import { useState, useEffect } from "react";

interface AnalyticsDashboardClientProps {
  visitorStats: { today: number; month: number; total: number };
  topProjects: Array<{
    project_id: string;
    count: number;
    project: { title_id: string; title_en: string; slug: string };
  }>;
  topBlogs: Array<{
    blog_id: string;
    count: number;
    blog: { title_id: string; title_en: string; slug: string };
  }>;
  dailyData: Array<{ day: string; visits: number }>;
  recentVisitors: Array<{ page: string; created_at: string; referrer: string | null }>;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <>
      <style>{`
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
        .live-ping { animation: ping 1.4s cubic-bezier(0,0,.2,1) infinite; }
      `}</style>
      <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
        <span className="live-ping" style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "#4ade80", opacity: 0.5,
        }} />
        <span style={{
          position: "relative", width: 10, height: 10,
          borderRadius: "50%", background: "#4ade80",
        }} />
      </span>
    </>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--neutral-background-strong)",
      border: "1px solid var(--neutral-alpha-medium)",
      borderRadius: 10, padding: "10px 16px",
      fontSize: 12, color: "var(--neutral-on-background-strong)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      backdropFilter: "blur(16px)",
    }}>
      {label && <div style={{ opacity: 0.55, marginBottom: 5, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontWeight: 700, fontSize: 16, color: "var(--neutral-on-background-strong)" }}>
          {p.value.toLocaleString()}
          <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, opacity: 0.6 }}>kunjungan</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sublabel, icon, accent, trend, live = false,
}: {
  label: string; value: number; sublabel: string;
  icon: React.ReactNode; accent: string; trend?: number; live?: boolean;
}) {
  return (
    <>
      <style>{`
        .kpi-card {
          position: relative; overflow: hidden;
          flex: 1 1 180px; min-width: 160px;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-weak);
          transition: border-color .25s, transform .2s;
        }
        .kpi-card:hover { border-color: var(--neutral-alpha-medium); transform: translateY(-2px); }
        .kpi-card::before {
          content:""; position:absolute; top:-1px; left:12%; right:12%; height:1px;
          background: linear-gradient(90deg, transparent, var(--kpi-accent, #6366f1), transparent);
          opacity:.6;
        }
        .kpi-card::after {
          content:""; position:absolute; top:0; right:0;
          width:80px; height:80px; border-radius:50%;
          background: var(--kpi-accent, #6366f1);
          opacity:.06; transform:translate(30%, -30%);
          pointer-events:none;
        }
      `}</style>
      <div className="kpi-card" style={{ "--kpi-accent": accent } as React.CSSProperties}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            border: "1px solid var(--neutral-alpha-medium)",
            background: "var(--neutral-background-medium)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent, flexShrink: 0,
          }}>
            {icon}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {live && <LiveDot />}
            {trend !== undefined && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
                background: trend >= 0 ? "rgba(74,222,128,.12)" : "rgba(248,113,113,.12)",
                color: trend >= 0 ? "#4ade80" : "#f87171",
              }}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>

        <div style={{
          fontSize: 38, fontWeight: 800, lineHeight: 1,
          letterSpacing: "-0.03em", color: "var(--neutral-on-background-strong)",
          marginBottom: 6,
        }}>
          <Counter value={value} />
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-on-background-strong)", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
          {sublabel}
        </div>
      </div>
    </>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Panel({ title, subtitle, children, action }: {
  title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{
      border: "1px solid var(--neutral-alpha-weak)",
      borderRadius: 16,
      background: "var(--neutral-background-weak)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "18px 24px 14px",
        borderBottom: "1px solid var(--neutral-alpha-weak)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--neutral-on-background-strong)" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ─── Horizontal rank bar ──────────────────────────────────────────────────────
function RankBar({ name, value, max, rank, color }: {
  name: string; value: number; max: number; rank: number; color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
      <span style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
        background: rank <= 3 ? color : "var(--neutral-background-strong)",
        border: rank > 3 ? "1px solid var(--neutral-alpha-medium)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 800,
        color: rank <= 3 ? "#000" : "var(--neutral-on-background-weak)",
        opacity: rank <= 3 ? 1 : 0.6,
      }}>
        {rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 500, marginBottom: 4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: "var(--neutral-on-background-strong)",
        }}>
          {name}
        </div>
        <div style={{ height: 4, borderRadius: 99, background: "var(--neutral-alpha-weak)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            width: `${pct}%`,
            transition: "width 1s cubic-bezier(.22,1,.36,1)",
          }} />
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, flexShrink: 0,
        color: "var(--neutral-on-background-strong)",
        minWidth: 28, textAlign: "right",
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Page tag badge ───────────────────────────────────────────────────────────
function PageBadge({ page }: { page: string }) {
  const clean = page.replace(/^\//, "") || "home";
  const part = clean.split("/")[0] || "home";
  const colors: Record<string, { bg: string; text: string }> = {
    project: { bg: "rgba(99,102,241,.15)", text: "#818cf8" },
    blog:    { bg: "rgba(34,211,238,.15)", text: "#22d3ee" },
    about:   { bg: "rgba(52,211,153,.15)", text: "#34d399" },
    work:    { bg: "rgba(251,191,36,.12)", text: "#fbbf24" },
    gallery: { bg: "rgba(232,121,249,.15)", text: "#e879f9" },
    home:    { bg: "rgba(156,163,175,.12)", text: "#9ca3af" },
  };
  const c = colors[part] || colors.home;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
      background: c.bg, color: c.text, letterSpacing: "0.05em",
      textTransform: "uppercase", flexShrink: 0,
    }}>
      {part}
    </span>
  );
}

// ─── ACCENTCHIP ───────────────────────────────────────────────────────────────
const ACCENT_PROJECT = "#6366f1";
const ACCENT_BLOG    = "#22d3ee";
const ACCENT_TODAY   = "#4ade80";
const ACCENT_MONTH   = "#f59e0b";
const ACCENT_TOTAL   = "#a78bfa";
const PIE_COLORS     = [ACCENT_PROJECT, ACCENT_BLOG, "#34d399", "#f87171", "#fbbf24", "#e879f9", "#60a5fa", "#fb923c"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function AnalyticsDashboardClient({
  visitorStats, topProjects, topBlogs, dailyData, recentVisitors,
}: AnalyticsDashboardClientProps) {

  const maxProjectViews = topProjects[0]?.count ?? 1;
  const maxBlogViews    = topBlogs[0]?.count ?? 1;

  const pieData = [
    ...topProjects.slice(0, 4).map((p) => ({
      name: p.project.title_id?.slice(0, 22) ?? "Project",
      value: p.count,
      type: "project",
    })),
    ...topBlogs.slice(0, 4).map((b) => ({
      name: b.blog.title_id?.slice(0, 22) ?? "Blog",
      value: b.count,
      type: "blog",
    })),
  ].sort((a, b) => b.value - a.value).slice(0, 8);

  const totalPieViews = pieData.reduce((s, d) => s + d.value, 0);

  const maxDailyVisit = Math.max(...dailyData.map((d) => d.visits), 1);

  return (
    <>
      <style>{`
        .analytics-root { display:flex; flex-direction:column; gap:24px; }
        .analytics-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .analytics-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media (max-width:768px) {
          .analytics-grid-3 { grid-template-columns:1fr; }
          .analytics-grid-2 { grid-template-columns:1fr; }
        }
        .log-row {
          display:grid;
          grid-template-columns: auto 1fr auto auto;
          gap:10px; align-items:center;
          padding:9px 0;
          border-bottom:1px solid var(--neutral-alpha-weak);
          transition: background .15s;
        }
        .log-row:last-child { border-bottom:none; }
        .log-row:hover { background:var(--neutral-alpha-weak); border-radius:8px; padding-left:8px; padding-right:8px; }
      `}</style>

      <div className="analytics-root">

        {/* ── Header bar ─────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          borderRadius: 14,
          border: "1px solid var(--neutral-alpha-weak)",
          background: "var(--neutral-background-weak)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LiveDot />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-on-background-strong)" }}>
              Live Dashboard
            </span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 99,
              background: "var(--neutral-alpha-weak)",
              color: "var(--neutral-on-background-weak)",
            }}>
              Asia/Makassar (UTC+8)
            </span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Total Konten", value: topProjects.length + topBlogs.length },
              { label: "Puncak Harian", value: maxDailyVisit },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--neutral-on-background-strong)" }}>
                  {s.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "var(--neutral-on-background-weak)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────── */}
        <div className="analytics-grid-3">
          <KpiCard
            label="Hari Ini"
            sublabel="Kunjungan sejak tengah malam"
            value={visitorStats.today}
            icon={<IconSun />}
            accent={ACCENT_TODAY}
            live
          />
          <KpiCard
            label="Bulan Ini"
            sublabel="Total kunjungan bulan berjalan"
            value={visitorStats.month}
            icon={<IconCalendar />}
            accent={ACCENT_MONTH}
          />
          <KpiCard
            label="Total Sepanjang Masa"
            sublabel="Sejak website diluncurkan"
            value={visitorStats.total}
            icon={<IconGlobe />}
            accent={ACCENT_TOTAL}
          />
        </div>

        {/* ── Area Chart ──────────────────────────────────────────────── */}
        <Panel
          title="Tren Kunjungan"
          subtitle="7 hari terakhir — jumlah halaman dikunjungi per hari"
          action={
            <div style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 99,
              background: "rgba(99,102,241,.12)", color: ACCENT_PROJECT,
              fontWeight: 600,
            }}>
              7D
            </div>
          }
        >
          <div style={{ height: 220, marginLeft: -8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={ACCENT_PROJECT} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ACCENT_PROJECT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="var(--neutral-alpha-weak)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--neutral-on-background-weak)", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--neutral-on-background-weak)", fontSize: 10 }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="visits"
                  stroke={ACCENT_PROJECT} strokeWidth={2.5}
                  fill="url(#aG)"
                  dot={false}
                  activeDot={{ r: 5, fill: ACCENT_PROJECT, stroke: "var(--neutral-background-strong)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* ── Top Content Row ─────────────────────────────────────────── */}
        <div className="analytics-grid-2">

          {/* Projects ranking */}
          <Panel
            title="Project Terpopuler"
            subtitle={`${topProjects.length} project · ranked by views`}
          >
            {topProjects.length === 0 ? (
              <EmptyState label="Belum ada data views project" />
            ) : (
              <div>
                {topProjects.slice(0, 7).map((p, i) => (
                  <RankBar
                    key={p.project_id}
                    rank={i + 1}
                    name={p.project.title_id || "Untitled"}
                    value={p.count}
                    max={maxProjectViews}
                    color={ACCENT_PROJECT}
                  />
                ))}
              </div>
            )}
          </Panel>

          {/* Blogs ranking */}
          <Panel
            title="Blog Terpopuler"
            subtitle={`${topBlogs.length} artikel · ranked by views`}
          >
            {topBlogs.length === 0 ? (
              <EmptyState label="Belum ada data views blog" />
            ) : (
              <div>
                {topBlogs.slice(0, 7).map((b, i) => (
                  <RankBar
                    key={b.blog_id}
                    rank={i + 1}
                    name={b.blog.title_id || "Untitled"}
                    value={b.count}
                    max={maxBlogViews}
                    color={ACCENT_BLOG}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Pie + log row ────────────────────────────────────────────── */}
        <div className="analytics-grid-2">

          {/* Donut distribution */}
          {pieData.length > 0 && (
            <Panel title="Distribusi Konten" subtitle="Proporsi views per konten">
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                {/* Donut */}
                <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={48} outerRadius={72}
                        paddingAngle={2} dataKey="value" strokeWidth={0}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--neutral-on-background-strong)" }}>
                        {d.name}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }}>
                        {totalPieViews > 0 ? Math.round((d.value / totalPieViews) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          )}

          {/* Recent log */}
          <Panel title="Log Kunjungan Terbaru" subtitle="15 aktivitas terakhir secara real-time">
            {recentVisitors.length === 0 ? (
              <EmptyState label="Belum ada data kunjungan" />
            ) : (
              <div>
                {recentVisitors.map((v, i) => (
                  <div key={i} className="log-row">
                    <PageBadge page={v.page} />
                    <span style={{
                      fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: "var(--neutral-on-background-strong)", fontFamily: "monospace",
                    }}>
                      {v.page || "/"}
                    </span>
                    {v.referrer ? (
                      <span style={{
                        fontSize: 10, color: "var(--neutral-on-background-weak)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: 80,
                      }}>
                        {v.referrer.replace(/^https?:\/\//, "").slice(0, 16)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--neutral-alpha-medium)" }}>direct</span>
                    )}
                    <span style={{ fontSize: 10, color: "var(--neutral-on-background-weak)", flexShrink: 0 }}>
                      {new Date(v.created_at).toLocaleString("id-ID", {
                        timeZone: "Asia/Makassar",
                        hour: "2-digit", minute: "2-digit",
                        day: "numeric", month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

      </div>
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, padding: "32px 16px",
      color: "var(--neutral-on-background-weak)",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={0.4}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}
