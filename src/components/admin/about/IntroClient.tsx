"use client";

import { useState } from "react";
import { Column, Row, Text, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import type { AboutIntro } from "@/lib/types";

interface Props { initialData: AboutIntro | null; }

const inputStyle = {
  background: "var(--neutral-background-medium)",
  border: "1px solid var(--neutral-alpha-medium)",
  borderRadius: 10, padding: "10px 12px",
  color: "var(--neutral-on-background-strong)",
  fontSize: 14, width: "100%", fontFamily: "inherit",
  outline: "none", resize: "vertical" as const,
  lineHeight: 1.65,
};

const labelStyle = {
  fontSize: 12, fontWeight: 600 as const,
  color: "var(--neutral-on-background-weak)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em", marginBottom: 6, display: "block",
};

export function IntroClient({ initialData }: Props) {
  const [bioId, setBioId] = useState(initialData?.bio_id ?? "");
  const [bioEn, setBioEn] = useState(initialData?.bio_en ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!bioId.trim()) { setMsg("Teks Indonesia wajib diisi."); return; }
    setLoading(true); setMsg(""); setSaved(false);
    const supabase = createClient();

    const payload = {
      bio_id: bioId.trim(),
      bio_en: bioEn.trim(),
      updated_at: new Date().toISOString(),
    };

    if (initialData?.id) {
      const { error } = await supabase
        .from("about_intro")
        .update(payload)
        .eq("id", initialData.id);
      if (error) setMsg(error.message);
      else setSaved(true);
    } else {
      const { error } = await supabase
        .from("about_intro")
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (error) setMsg(error.message);
      else setSaved(true);
    }
    setLoading(false);
  };

  return (
    <Column fillWidth gap="l">

      {/* Info card */}
      <div style={{
        padding: "14px 16px", borderRadius: 12,
        background: "var(--brand-alpha-weak)",
        border: "1px solid var(--brand-alpha-medium)",
        fontSize: 13, color: "var(--brand-on-background-weak)", lineHeight: 1.6,
      }}>
        <strong style={{ display: "block", marginBottom: 4 }}>💡 Tentang Saya</strong>
        Teks ini tampil di bagian <em>"Perkenalan"</em> halaman About. Mendukung bullet point —
        mulai baris baru dengan <code style={{ fontFamily: "monospace", background: "var(--neutral-alpha-weak)", padding: "0 4px", borderRadius: 4 }}>- </code>
        untuk membuat daftar. Jika dikosongkan, teks default dari <code style={{ fontFamily: "monospace", background: "var(--neutral-alpha-weak)", padding: "0 4px", borderRadius: 4 }}>content.tsx</code> akan digunakan.
      </div>

      {/* Indonesia */}
      <div style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-alpha-weak)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🇮🇩</span>
          <Text variant="label-strong-s">Deskripsi (Indonesia)</Text>
        </div>
        <div style={{ padding: 16 }}>
          <label style={labelStyle}>Teks Tentang Saya *</label>
          <textarea
            value={bioId}
            onChange={(e) => setBioId(e.target.value)}
            rows={8}
            placeholder={`Contoh tanpa bullet:\nReza Refka Kurniawan adalah seorang Full Stack Developer...

Contoh dengan bullet:\nSaya adalah Full Stack Developer dengan fokus pada:\n- Pengembangan web dengan Next.js dan React\n- Rekayasa data dan pipeline ETL\n- Desain antarmuka yang intuitif`}
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", marginTop: 6 }}>
            Mulai baris dengan <strong>-</strong> untuk bullet point · Tekan Enter untuk baris baru
          </div>
        </div>
      </div>

      {/* English */}
      <div style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-alpha-weak)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🇬🇧</span>
          <Text variant="label-strong-s">Description (English)</Text>
        </div>
        <div style={{ padding: 16 }}>
          <label style={labelStyle}>About Me Text (optional)</label>
          <textarea
            value={bioEn}
            onChange={(e) => setBioEn(e.target.value)}
            rows={8}
            placeholder="Reza Refka Kurniawan is a Full Stack Developer and Data Engineer based in Makassar, Indonesia..."
            style={inputStyle}
          />
        </div>
      </div>

      {/* Live preview */}
      {bioId && (
        <div style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-alpha-weak)" }}>
            <Text variant="label-strong-s">Preview</Text>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <PreviewBio text={bioId} />
          </div>
        </div>
      )}

      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}
      {saved && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--success-alpha-weak, color-mix(in srgb, #22c55e 12%, transparent))", border: "1px solid color-mix(in srgb, #22c55e 25%, transparent)", fontSize: 13, color: "#4ade80" }}>
          ✓ Tersimpan! Perubahan akan tampil di halaman About.
        </div>
      )}

      <Row gap="m" wrap>
        <Button onClick={handleSave} variant="primary" size="m" loading={loading}>
          Simpan Perkenalan
        </Button>
        {(bioId || bioEn) && (
          <Button onClick={() => { setBioId(""); setBioEn(""); }} variant="secondary" size="m">
            Reset ke Default
          </Button>
        )}
      </Row>
    </Column>
  );
}

/** Mini preview renderer — sama logika dengan renderDescription di about/page.tsx */
function PreviewBio({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const hasBullet = lines.some(l => /^[-•*]\s/.test(l));

  if (!hasBullet) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--neutral-on-background-weak)", lineHeight: 1.7, margin: 0, textAlign: "justify" }}>
        {text}
      </p>
    );
  }

  const introLines: string[] = [];
  const listItems: string[] = [];
  let inList = false;
  for (const line of lines) {
    if (/^[-•*]\s/.test(line)) { inList = true; listItems.push(line.replace(/^[-•*]\s+/, "")); }
    else if (!inList) introLines.push(line);
  }

  return (
    <>
      {introLines.length > 0 && (
        <p style={{ fontSize: 13.5, color: "var(--neutral-on-background-weak)", lineHeight: 1.7, margin: "0 0 10px", textAlign: "justify" }}>
          {introLines.join(" ")}
        </p>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {listItems.map((item, idx) => (
          <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: "var(--neutral-on-background-weak)", lineHeight: 1.65 }}>
            <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: "50%", background: "var(--brand-background-strong)", marginTop: 7 }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
