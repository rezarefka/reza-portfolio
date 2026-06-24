import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const faviconTs = settings?.updated_at
    ? new Date(settings.updated_at).getTime()
    : Date.now();

  return {
    title: "Reza Control – CMS",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
    icons: {
      icon: [{ url: `/api/favicon?v=${faviconTs}`, type: "image/png" }],
      shortcut: `/api/favicon?v=${faviconTs}`,
    },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/reza-control/login");
  }

  // Inject favicon langsung lewat <head> karena admin layout override root layout icons
  const settings = await getSettings();
  const faviconTs = settings?.updated_at
    ? new Date(settings.updated_at).getTime()
    : Date.now();
  const faviconUrl = `/api/favicon?v=${faviconTs}`;

  return (
    <>
      <head>
        <link rel="icon" type="image/png" href={faviconUrl} />
        <link rel="shortcut icon" type="image/png" href={faviconUrl} />
      </head>
      <AdminShell user={user}>{children}</AdminShell>
    </>
  );
}
