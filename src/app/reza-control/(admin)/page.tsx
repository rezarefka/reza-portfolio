import { Column, Row, Heading, Text, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = { title: "Dashboard – Reza Control" };

async function getStats() {
  const supabase = await createClient();
  const [
    { count: projects },
    { count: blogs },
    { count: certificates },
    { count: media },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("blogs").select("*", { count: "exact", head: true }),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase.from("media").select("*", { count: "exact", head: true }),
  ]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ count: visitorsToday }, { count: visitorsMonth }, { count: visitorsTotal }] =
    await Promise.all([
      supabase
        .from("visitor_analytics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("visitor_analytics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart),
      supabase.from("visitor_analytics").select("*", { count: "exact", head: true }),
    ]);

  const { data: recentProjects } = await supabase
    .from("projects")
    .select("id, title_id, slug, published, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentBlogs } = await supabase
    .from("blogs")
    .select("id, title_id, slug, published, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: activityLogs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    counts: {
      projects: projects || 0,
      blogs: blogs || 0,
      certificates: certificates || 0,
      media: media || 0,
    },
    visitors: {
      today: visitorsToday || 0,
      month: visitorsMonth || 0,
      total: visitorsTotal || 0,
    },
    recentProjects: recentProjects || [],
    recentBlogs: recentBlogs || [],
    activityLogs: activityLogs || [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Dashboard</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Selamat datang di Reza Control Panel.
        </Text>
      </Column>

      <AdminDashboardClient stats={stats} />
    </Column>
  );
}
