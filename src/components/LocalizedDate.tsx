"use client";

import { format } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";
import { useLang } from "@/lib/lang-context";

/**
 * Tanggal yang otomatis ikut format nama bulan sesuai bahasa aktif
 * (Indonesia: "19 Juni 2026" / English: "June 19, 2026").
 */
export function LocalizedDate({
  value,
  fmt,
}: {
  value: string | null | undefined;
  fmt?: string;
}) {
  const { lang } = useLang();
  if (!value) return <>—</>;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return <>—</>;
    const pattern = fmt || (lang === "en" ? "MMMM d, yyyy" : "d MMMM yyyy");
    return <>{format(date, pattern, { locale: lang === "en" ? localeEn : localeId })}</>;
  } catch {
    return <>—</>;
  }
}
