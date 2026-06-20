"use client";

import { useLang } from "@/lib/lang-context";
import type { Certificate } from "@/lib/types";
import { format } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";

function safeDate(d: string | null | undefined, fmt: string, opts?: Parameters<typeof format>[2]): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return format(date, fmt, opts);
  } catch { return "—"; }
}

interface CertificateInfoProps {
  cert: Certificate;
}

export function CertificateInfo({ cert }: CertificateInfoProps) {
  const { lang } = useLang();

  const title    = lang === "en" && cert.title_en       ? cert.title_en       : cert.title_id;
  const desc     = lang === "en" && cert.description_en ? cert.description_en : cert.description_id;
  const dateStr  = safeDate(cert.issue_date, "d MMMM yyyy", { locale: lang === "en" ? localeEn : localeId });

  const labelSertifikat = lang === "en" ? "Certificate"   : "Sertifikat";
  const labelPenerbit   = lang === "en" ? "Issuer"        : "Penerbit";
  const labelTahun      = lang === "en" ? "Issue Date"    : "Tahun Terbit";
  const labelJudul      = lang === "en" ? "Title (ID)"    : "Judul (ID)";
  const labelDeskripsi  = lang === "en" ? "Description"   : "Deskripsi";

  return (
    <div className="cert-info-col">
      <div className="cert-detail-card">
        <div className="cert-detail-accent" />
        <div className="cert-detail-body">
          <div className="cert-detail-eyebrow">{labelSertifikat}</div>
          <h1 className="cert-detail-title">{title}</h1>

          {/* Issuer badge */}
          <div className="cert-issuer-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {cert.issuer}
          </div>

          {/* Meta grid */}
          <div className="cert-meta-grid">
            <div className="cert-meta-item">
              <div className="cert-meta-label">{labelPenerbit}</div>
              <div className="cert-meta-value">{cert.issuer}</div>
            </div>
            <div className="cert-meta-item">
              <div className="cert-meta-label">{labelTahun}</div>
              <div className="cert-meta-value">{dateStr}</div>
            </div>
            {/* Tampilkan judul bahasa lain jika berbeda */}
            {lang === "en" && cert.title_id && cert.title_id !== title && (
              <div className="cert-meta-item" style={{ gridColumn: "1 / -1" }}>
                <div className="cert-meta-label">{labelJudul}</div>
                <div className="cert-meta-value">{cert.title_id}</div>
              </div>
            )}
            {lang === "id" && cert.title_en && cert.title_en !== title && (
              <div className="cert-meta-item" style={{ gridColumn: "1 / -1" }}>
                <div className="cert-meta-label">Title (EN)</div>
                <div className="cert-meta-value">{cert.title_en}</div>
              </div>
            )}
          </div>

          {/* Deskripsi — hanya bahasa aktif */}
          {desc && (
            <div>
              <div className="cert-desc-label">{labelDeskripsi}</div>
              <p className="cert-desc-text">{desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
