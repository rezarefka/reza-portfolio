"use client";

import { useState } from "react";
import { Column, Row, Text, Button, Input, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AboutEducation } from "@/lib/types";

interface Props { initialData: AboutEducation[]; }

const LEVELS = ["S1", "D3", "D4", "S2", "S3", "SMA/SMK"] as const;
type Level = typeof LEVELS[number];

const isUni = (l: string) => l !== "SMA/SMK";

const instLabel  = (l: string) => isUni(l) ? "Nama Universitas / Institut" : "Nama Sekolah";
const majorLabel = (l: string) => isUni(l) ? "Jurusan / Prodi" : "Kompetensi Keahlian / Jurusan";
const gpaLabel   = (l: string) => isUni(l) ? "IPK" : "Nilai Rata-rata";
const thesisLabel: Record<string, string> = {
  S1: "Skripsi", D3: "Proyek Akhir", D4: "Proyek Akhir / Skripsi",
  S2: "Tesis", S3: "Disertasi",
};

const levelColor: Record<string, string> = {
  S1: "#818cf8", D3: "#34d399", D4: "#34d399",
  S2: "#a78bfa", S3: "#c084fc", "SMA/SMK": "#fb923c",
};

const empty = (): Omit<AboutEducation, "id" | "created_at" | "updated_at"> => ({
  education_level: "S1",
  university_name: "",
  faculty: "",
  major: "",
  year_start: new Date().getFullYear().toString(),
  year_end: "",
  gpa: "",
  thesis_title: "",
  thesis_goal: "",
  thesis_output: "",
  thesis_impact: "",
  journal_url: "",
  journal_pdf: "",
  logo: "",
  description_id: "",
  description_en: "",
  sort_order: 0,
});

const inputStyle = {
  background: "var(--neutral-background-medium)",
  border: "1px solid var(--neutral-alpha-medium)",
  borderRadius: 10, padding: "10px 12px",
  color: "var(--neutral-on-background-strong)",
  fontSize: 14, width: "100%", fontFamily: "inherit",
  outline: "none",
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "var(--neutral-on-background-weak)",
  textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4,
};

const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", overflow: "hidden" }}>
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-alpha-weak)" }}>
      <Text variant="label-strong-s">{title}</Text>
    </div>
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  </div>
);

export function EducationClient({ initialData }: Props) {
  const [items, setItems]     = useState<AboutEducation[]>(initialData);
  const [editing, setEditing] = useState<Partial<AboutEducation> | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");

  const set = (k: string, v: unknown) => setEditing((e) => e ? { ...e, [k]: v } : e);

  const level = (editing?.education_level ?? "S1") as Level;
  const uni = isUni(level);
  const color = levelColor[level] ?? "#818cf8";
  const tLabel = thesisLabel[level] ?? "Tugas Akhir";

  const handleSave = async () => {
    if (!editing?.university_name) { setMsg(`${instLabel(level)} wajib diisi.`); return; }
    setLoading(true); setMsg("");
    const supabase = createClient();
    const payload = { ...editing, updated_at: new Date().toISOString() };
    // Clear thesis fields for SMA/SMK
    if (!uni) {
      Object.assign(payload, { thesis_title: null, thesis_goal: null, thesis_output: null, thesis_impact: null, journal_url: null, journal_pdf: null, faculty: null });
    }

    if (isNew) {
      const { data, error } = await supabase.from("about_education")
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select().single();
      if (error) { setMsg(error.message); }
      else { setItems((p) => [...p, data]); setEditing(null); }
    } else {
      const { error } = await supabase.from("about_education")
        .update(payload).eq("id", editing.id!);
      if (error) { setMsg(error.message); }
      else {
        setItems((p) => p.map((x) => x.id === editing.id ? { ...x, ...editing } as AboutEducation : x));
        setEditing(null);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pendidikan ini?")) return;
    await createClient().from("about_education").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  // ── FORM ──────────────────────────────────────────────────────────
  if (editing !== null) return (
    <Column fillWidth gap="m" paddingBottom="80">

      {/* Level Picker */}
      <div style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-alpha-weak)" }}>
          <Text variant="label-strong-s">Jenjang Pendidikan</Text>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LEVELS.map((l) => {
              const active = level === l;
              const c = levelColor[l];
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => set("education_level", l)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 99,
                    border: active ? `1.5px solid ${c}` : "1.5px solid var(--neutral-alpha-medium)",
                    background: active ? `color-mix(in srgb, ${c} 15%, transparent)` : "transparent",
                    color: active ? c : "var(--neutral-on-background-weak)",
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
          {!uni && (
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, fontSize: 12, color: "var(--neutral-on-background-weak)", lineHeight: 1.6 }}>
              Mode <strong>SMA/SMK</strong> — form disederhanakan (tanpa skripsi &amp; jurnal)
            </div>
          )}
        </div>
      </div>

      {/* Identitas Institusi */}
      <SectionBox title={isUni(level) ? "Identitas Kampus" : "Identitas Sekolah"}>
        <div>
          <div style={labelStyle}>{instLabel(level)} *</div>
          <Input id="uni" value={editing.university_name ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("university_name", e.target.value)}
            placeholder={uni ? "Universitas Hasanuddin" : "SMK Negeri 4 Makassar"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: uni ? "1fr 1fr" : "1fr", gap: 12 }}>
          {uni && (
            <div>
              <div style={labelStyle}>Fakultas</div>
              <Input id="faculty" value={editing.faculty ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("faculty", e.target.value)}
                placeholder="Teknik" />
            </div>
          )}
          <div>
            <div style={labelStyle}>{majorLabel(level)}</div>
            <Input id="major" value={editing.major ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("major", e.target.value)}
              placeholder={uni ? "Teknik Informatika" : "Rekayasa Perangkat Lunak"} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Tahun Masuk</div>
            <Input id="ys" value={editing.year_start ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("year_start", e.target.value)}
              placeholder="2020" />
          </div>
          <div>
            <div style={labelStyle}>Tahun Lulus</div>
            <Input id="ye" value={editing.year_end ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("year_end", e.target.value)}
              placeholder="2023" />
          </div>
          <div>
            <div style={labelStyle}>{gpaLabel(level)}</div>
            <Input id="gpa" value={editing.gpa ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("gpa", e.target.value)}
              placeholder={uni ? "3.91" : "87.5"} />
          </div>
        </div>
      </SectionBox>

      {/* Skripsi — hanya untuk jenjang universitas */}
      {uni && (
        <SectionBox title={tLabel}>
          <div>
            <div style={labelStyle}>Judul {tLabel}</div>
            <Input id="thesis" value={editing.thesis_title ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("thesis_title", e.target.value)}
              placeholder={`Judul ${tLabel} kamu…`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ borderRadius: 12, border: "1px solid var(--neutral-alpha-medium)", background: "var(--neutral-background-strong)", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "color-mix(in srgb, #818cf8 8%, transparent)", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#818cf8", textTransform: "uppercase" as const }}>Output / Hasil</span>
              </div>
              <div style={{ padding: 12 }}>
                <textarea value={editing.thesis_output ?? ""}
                  onChange={(e) => set("thesis_output", e.target.value)}
                  rows={5} placeholder="Produk, model, atau sistem yang dihasilkan…"
                  style={{ ...inputStyle, resize: "vertical" as const, fontSize: 13 }} />
              </div>
            </div>

            <div style={{ borderRadius: 12, border: "1px solid var(--neutral-alpha-medium)", background: "var(--neutral-background-strong)", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "color-mix(in srgb, #34d399 8%, transparent)", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#34d399", textTransform: "uppercase" as const }}>Dampak / Manfaat</span>
              </div>
              <div style={{ padding: 12 }}>
                <textarea value={editing.thesis_impact ?? ""}
                  onChange={(e) => set("thesis_impact", e.target.value)}
                  rows={5} placeholder="Dampak nyata bagi pengguna atau masyarakat…"
                  style={{ ...inputStyle, resize: "vertical" as const, fontSize: 13 }} />
              </div>
            </div>
          </div>
          <input type="hidden" value={editing.thesis_goal ?? ""} onChange={() => {}} />
        </SectionBox>
      )}

      {/* Jurnal — hanya untuk jenjang universitas */}
      {uni && (
        <SectionBox title="Jurnal &amp; Akses Dokumen">
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--brand-alpha-weak)", border: "1px solid var(--brand-alpha-medium)", fontSize: 12, color: "var(--brand-on-background-weak)", lineHeight: 1.6 }}>
            💡 Upload PDF agar pengunjung bisa membaca langsung di halaman About.
          </div>
          <div>
            <div style={labelStyle}>Upload PDF {tLabel}</div>
            <ImageUpload bucket="media" value={editing.journal_pdf ?? ""} onChange={(url) => set("journal_pdf", url)} accept=".pdf,application/pdf" label="" />
          </div>
          <div>
            <div style={labelStyle}>URL Jurnal Eksternal (opsional)</div>
            <Input id="journal_url" value={editing.journal_url ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("journal_url", e.target.value)}
              placeholder="https://journal.example.com/paper/..." />
            <div style={{ fontSize: 11, color: "var(--neutral-on-background-weak)", marginTop: 4 }}>Google Scholar, ResearchGate, repositori kampus, dll.</div>
          </div>
        </SectionBox>
      )}

      {/* Logo */}
      <div style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-alpha-weak)" }}>
          <Text variant="label-strong-s">Logo {uni ? "Kampus" : "Sekolah"}</Text>
        </div>
        <div style={{ padding: 16 }}>
          <Text variant="body-default-xs" onBackground="neutral-weak" style={{ marginBottom: 12 }}>
            PNG transparan disarankan. Logo tampil bulat dengan efek kilau di halaman About.
          </Text>
          <ImageUpload bucket="media" value={editing.logo ?? ""} onChange={(url) => set("logo", url)} />
        </div>
      </div>

      {msg && <Text variant="body-default-s" onBackground="danger-strong">{msg}</Text>}

      <Row gap="m" wrap>
        <Button onClick={handleSave} variant="primary" size="m" loading={loading}>
          {isNew ? "Tambah" : "Simpan"}
        </Button>
        <Button onClick={() => setEditing(null)} variant="secondary" size="m">Batal</Button>
        {!isNew && (
          <Button onClick={() => handleDelete(editing.id!)} variant="danger" size="m" style={{ marginLeft: "auto" }}>Hapus</Button>
        )}
      </Row>
    </Column>
  );

  // ── LIST ──────────────────────────────────────────────────────────
  return (
    <Column fillWidth gap="m">
      <Button onClick={() => { setEditing(empty()); setIsNew(true); }} variant="primary" size="m" prefixIcon="plus">
        Tambah Pendidikan
      </Button>

      {items.length === 0 && (
        <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="l">
          <Column gap="m" horizontal="center" align="center">
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--brand-alpha-weak)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-on-background-medium)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <Text variant="heading-strong-m">Belum ada data pendidikan</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">Tambah universitas, sekolah, atau jenjang pendidikan lainnya.</Text>
          </Column>
        </Card>
      )}

      {items.map((edu) => {
        const lvlColor = levelColor[edu.education_level] ?? "#818cf8";
        return (
          <div key={edu.id} onClick={() => { setEditing(edu); setIsNew(false); }}
            style={{ borderRadius: 14, border: "1px solid var(--neutral-alpha-weak)", background: "var(--neutral-background-medium)", cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-alpha-medium)"; e.currentTarget.style.boxShadow = "0 2px 12px var(--brand-alpha-weak)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--neutral-alpha-weak)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ height: 3, background: `linear-gradient(90deg, ${lvlColor}, var(--accent-background-strong), transparent)` }} />
            <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center" }}>
              {edu.logo
                ? <img src={edu.logo} alt={edu.university_name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "contain", flexShrink: 0, background: "var(--neutral-alpha-weak)", padding: 6 }} />
                : <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--brand-alpha-weak)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--brand-on-background-medium)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Text variant="heading-strong-m">{edu.university_name}</Text>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `color-mix(in srgb, ${lvlColor} 14%, transparent)`, color: lvlColor, border: `1px solid color-mix(in srgb, ${lvlColor} 30%, transparent)`, letterSpacing: "0.05em" }}>
                    {edu.education_level}
                  </span>
                  {isUni(edu.education_level) && (edu.journal_pdf || edu.journal_url) && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb, #ef4444 25%, transparent)", letterSpacing: "0.05em" }}>PDF</span>
                  )}
                </div>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {edu.major} · {edu.year_start}–{edu.year_end || "Sekarang"}
                  {edu.gpa ? ` · ${isUni(edu.education_level) ? "IPK" : "Nilai"} ${edu.gpa}` : ""}
                </Text>
                {isUni(edu.education_level) && edu.thesis_title && (
                  <Text variant="body-default-xs" onBackground="neutral-weak" style={{ marginTop: 2, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    📄 {edu.thesis_title}
                  </Text>
                )}
              </div>
              <div style={{ flexShrink: 0, color: "var(--neutral-on-background-weak)", fontSize: 18 }}>›</div>
            </div>
          </div>
        );
      })}
    </Column>
  );
}
