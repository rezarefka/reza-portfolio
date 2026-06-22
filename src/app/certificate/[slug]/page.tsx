export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Column, Heading, Text, SmartLink, Meta } from "@once-ui-system/core";
import { baseURL } from "@/resources";
import { getCertificateBySlug, getCertificates } from "@/lib/db";
import { Metadata } from "next";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ScrollToHash } from "@/components";
import { CertificateSlider } from "@/components/certificate/CertificateSlider";
import { CertificateInfo } from "@/components/certificate/CertificateInfo";
import { T } from "@/components/T";

function safeDate(d: string | null | undefined, fmt: string, opts?: Parameters<typeof format>[2]): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return format(date, fmt, opts);
  } catch { return "—"; }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cert = await getCertificateBySlug(slug).catch(() => null);
  if (!cert) return {};
  const certMeta = Meta.generate({
    title: cert.title_id,
    description: cert.description_id || `Sertifikat dari ${cert.issuer}`,
    baseURL,
    image: cert.thumbnail || `/api/og/generate?title=${encodeURIComponent(cert.title_id)}`,
    path: `/certificate/${cert.id}`,
  });
  return { ...certMeta, robots: { index: false, follow: false } };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cert = await getCertificateBySlug(slug).catch(() => null);
  if (!cert) notFound();

  const allCerts = await getCertificates().catch(() => []);
  const otherCerts = allCerts.filter((c) => c.id !== cert.id).slice(0, 3);

  /* Gambar untuk slider: images[] > thumbnail fallback */
  const sliderImages: string[] = [];
  if (cert.images && cert.images.length > 0) {
    sliderImages.push(...cert.images.filter(Boolean));
  } else if (cert.thumbnail) {
    sliderImages.push(cert.thumbnail);
  }

  return (
    <Column as="section" maxWidth="m" gap="l" paddingTop="24">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <SmartLink href="/about#sertifikat">
        <Text variant="label-strong-m">← <T id="Kembali ke Sertifikat" en="Back to Certificates" /></Text>
      </SmartLink>

      {/* ── Styles ──────────────────────────────────────────────── */}
      <style>{`
        .cert-detail-wrap {
          display: flex;
          flex-direction: row;
          gap: 36px;
          align-items: flex-start;
          width: 100%;
        }
        .cert-slider-col {
          flex: 0 0 min(420px, 52%);
          max-width: min(420px, 52%);
          position: sticky;
          top: 100px;
        }
        .cert-info-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 720px) {
          .cert-detail-wrap { flex-direction: column; gap: 24px; }
          .cert-slider-col { flex: none; max-width: 100%; width: 100%; position: static; }
        }
        .cert-detail-card {
          border-radius: 16px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          overflow: hidden;
        }
        .cert-detail-accent {
          height: 3px;
          background: linear-gradient(90deg, #f59e0b 0%, var(--brand-background-strong) 60%, transparent 100%);
        }
        .cert-detail-body { padding: 22px 24px; }
        .cert-detail-eyebrow {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.14em; color: var(--neutral-on-background-weak);
          margin-bottom: 6px;
        }
        .cert-detail-title {
          font-size: 20px; font-weight: 800; line-height: 1.25;
          color: var(--neutral-on-background-strong);
          margin: 0 0 14px; word-break: break-word;
        }
        .cert-issuer-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 99px; margin-bottom: 20px;
          background: var(--brand-alpha-weak);
          border: 1px solid var(--brand-alpha-medium);
          color: var(--brand-on-background-medium);
          font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
        }
        .cert-meta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          padding: 14px 0;
          border-top: 1px solid var(--neutral-alpha-weak);
          border-bottom: 1px solid var(--neutral-alpha-weak);
          margin-bottom: 20px;
        }
        .cert-meta-label {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--neutral-on-background-weak); margin-bottom: 4px;
        }
        .cert-meta-value {
          font-size: 13px; font-weight: 600;
          color: var(--neutral-on-background-strong); line-height: 1.4;
        }
        .cert-desc-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--neutral-on-background-weak); margin-bottom: 8px;
        }
        .cert-desc-text {
          font-size: 13.5px; color: var(--neutral-on-background-weak);
          line-height: 1.75; text-align: justify; hyphens: auto; -webkit-hyphens: auto; margin: 0;
        }
        .other-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .other-card {
          border-radius: 12px; overflow: hidden;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          text-decoration: none; display: block;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, border-color 0.2s;
        }
        .other-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 24px color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent);
          border-color: var(--neutral-alpha-medium);
        }
        .other-thumb-wrap { width: 100%; overflow: hidden; background: var(--neutral-alpha-weak); }
        .other-thumb { width: 100%; height: auto; display: block; object-fit: contain; }
        .other-body { padding: 12px 14px 14px; }
        .other-issuer {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--brand-on-background-medium);
          margin-bottom: 4px; display: flex; align-items: center; gap: 4px;
        }
        .other-title {
          font-size: 13px; font-weight: 700;
          color: var(--neutral-on-background-strong);
          line-height: 1.35; margin-bottom: 4px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .other-date { font-size: 11px; color: var(--neutral-on-background-weak); }
      `}</style>

      {/* ── Main: 2-col layout ──────────────────────────────────── */}
      <div className="cert-detail-wrap">
        {/* Kiri: slider */}
        <div className="cert-slider-col">
          <CertificateSlider images={sliderImages} title={cert.title_id} />
        </div>

        {/* Kanan: info bilingual (client) */}
        <CertificateInfo cert={cert} />
      </div>

      {/* ── Sertifikat Lainnya ───────────────────────────────────── */}
      {otherCerts.length > 0 && (
        <Column fillWidth gap="20" marginTop="24"
          style={{ borderTop: "1px solid var(--neutral-alpha-weak)", paddingTop: 32 }}>
          <Heading as="h2" variant="heading-strong-l"><T id="Sertifikat Lainnya" en="Other Certificates" /></Heading>
          <div className="other-grid">
            {otherCerts.map((c) => (
              <a key={c.id} href={`/certificate/${c.id}`} className="other-card">
                {c.thumbnail && (
                  <div className="other-thumb-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.thumbnail} alt={c.title_id} className="other-thumb" />
                  </div>
                )}
                <div className="other-body">
                  <div className="other-issuer">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    {c.issuer}
                  </div>
                  <div className="other-title"><T id={c.title_id} en={c.title_en || c.title_id} /></div>
                  <div className="other-date">
                    {safeDate(c.issue_date, "MMMM yyyy", { locale: localeId })}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Column>
      )}

      <ScrollToHash />
    </Column>
  );
}
