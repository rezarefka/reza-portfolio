export const dynamic = "force-dynamic";

import { JurnalPageContent } from "@/components/jurnal/JurnalPageContent";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; title?: string }>;
}) {
  const { title } = await searchParams;
  return {
    title: title ? `${title} · Journal Preview` : "Journal Preview",
  };
}

export default async function JurnalPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; title?: string }>;
}) {
  const { url, title } = await searchParams;

  if (!url) {
    return <JurnalPageContent url={undefined} title={undefined} proxyUrl="" />;
  }

  /* Build proxy URL for Supabase PDFs */
  const isSupabaseUrl = /\.(supabase\.co|supabase\.in)$/.test(
    (() => { try { return new URL(url).hostname; } catch { return ""; } })()
  );
  const proxyUrl = isSupabaseUrl && !url.includes("/api/")
    ? `/api/pdf-proxy?url=${encodeURIComponent(url)}`
    : url;

  return <JurnalPageContent url={url} title={title} proxyUrl={proxyUrl} />;
}
