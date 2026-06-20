"use client";

import { useLang } from "@/lib/lang-context";

/**
 * Komponen kecil untuk menyisipkan teks bilingual ke dalam server component
 * tanpa perlu mengubah seluruh halaman jadi client component.
 * Pakai: <T id="Teks Indonesia" en="English text" />
 */
export function T({ id, en }: { id: string; en: string }) {
  const { t } = useLang();
  return <>{t(id, en)}</>;
}
