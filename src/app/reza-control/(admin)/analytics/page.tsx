import { Column, Heading, Text } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { getTopViewedProjects, getTopViewedBlogs, getVisitorStats } from "@/lib/db";
import { AnalyticsDashboardClient } from "@/components/admin/AnalyticsDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics – Reza Control" };

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [visitorStats, topProjects, topBlogs] = await Promise.all([
    getVisitorStats(),
    getTopViewedProjects(8),
    getTopViewedBlogs(8),
  ]);

  // Last 7 days daily breakdown
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: dailyRaw } = await supabase
    .from("visitor_analytics")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Group by day
  const dayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("id-ID", {
      timeZone: "Asia/Makassar",
      weekday: "short",
      day: "numeric",
    });
    dayMap[key] = 0;
  }

  (dailyRaw || []).forEach((row: { created_at: string }) => {
    const key = new Date(row.created_at).toLocaleDateString("id-ID", {
      timeZone: "Asia/Makassar",
      weekday: "short",
      day: "numeric",
    });
    if (key in dayMap) dayMap[key]++;
  });

  const dailyData = Object.entries(dayMap).map(([day, visits]) => ({ day, visits }));

  // Recent visitor log
  const { data: recentVisitors } = await supabase
    .from("visitor_analytics")
    .select("page, created_at, referrer")
    .order("created_at", { ascending: false })
    .limit(15);

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Analytics</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Pantau performa konten dan tren pengunjung secara real-time.
        </Text>
      </Column>

      <AnalyticsDashboardClient
        visitorStats={visitorStats}
        topProjects={topProjects}
        topBlogs={topBlogs}
        dailyData={dailyData}
        recentVisitors={(recentVisitors || []).map((v) => ({
          page: v.page,
          created_at: v.created_at,
          referrer: v.referrer,
        }))}
      />
    </Column>
  );
}
