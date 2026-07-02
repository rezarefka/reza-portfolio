import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase TANPA cookies() — dipakai khusus untuk query publik/read-only
 * (getProjectBySlug, getPublishedProjects, dll di src/lib/db.ts).
 *
 * Kenapa perlu ini: createClient() di ./server.ts manggil cookies() dari
 * "next/headers", yang otomatis bikin Next.js anggap halaman itu "dynamic".
 * Untuk halaman ISR (export const revalidate = 300) yang baru pertama kali
 * di-generate saat runtime (misal project baru yang belum ada di
 * generateStaticParams saat build), ini bentrok dan bikin error:
 * "Page changed from static to dynamic at runtime" → 500.
 *
 * Data yang diambil di sini semua published/public, jadi gak butuh
 * cookie session sama sekali — pakai anon key langsung lebih aman & stabil.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
