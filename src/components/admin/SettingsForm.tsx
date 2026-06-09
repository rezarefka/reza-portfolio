"use client";

import { useState } from "react";
import { Column, Row, Text, Button, Input, Line } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { SiteSettings } from "@/lib/types";

interface SettingsFormProps {
  settings: SiteSettings | null;
}

const defaultSettings: Omit<SiteSettings, "id" | "updated_at"> = {
  website_name: "Reza Refka Kurniawan",
  tagline_id: "Full Stack Developer & Data Engineer",
  tagline_en: "Full Stack Developer & Data Engineer",
  hero_name: "Reza Refka Kurniawan",
  hero_headline_id: "Membangun solusi digital yang bermakna",
  hero_headline_en: "Building meaningful digital solutions",
  hero_motto_id: "Code. Create. Impact.",
  hero_motto_en: "Code. Create. Impact.",
  hero_description_id: "Saya Reza, seorang developer yang bersemangat membangun aplikasi web, mobile, dan visualisasi data.",
  hero_description_en: "I'm Reza, a developer passionate about building web apps, mobile apps, and data visualizations.",
  hero_cta_text_id: "Tentang Saya",
  hero_cta_text_en: "About Me",
  hero_cta_link: "/about",
  logo: null,
  favicon: null,
  footer_text_id: "Dibuat dengan ❤️ di Makassar",
  footer_text_en: "Made with ❤️ in Makassar",
  avatar: null,
  social_github: "https://github.com/rezarefka",
  social_linkedin: "https://www.linkedin.com/in/rezarefka",
  social_instagram: "https://www.instagram.com/rezarefka",
  social_threads: "",
  social_email: "rezarefka@gmail.com",
  calendar_link: "",
  stats_projects: 0,
  stats_certificates: 0,
  stats_monthly_visitors: 0,
  stats_total_visitors: 0,
  stats_years_experience: 0,
  cv_file: null,
  // Work page
  work_title_id: "Proyek & Kreasi",
  work_title_en: "Projects & Creations",
  work_description_id: "Kumpulan karya nyata — dari web app, mobile, visualisasi data, hingga desain kreatif.",
  work_description_en: "A collection of real works — from web apps, mobile, data visualization, to creative design.",
  // Blog page
  blog_title_id: "Insight & Perspektif dari Dunia Dev",
  blog_title_en: "Insight & Perspectives from the Dev World",
  blog_description_id: "Perspektif, pengalaman, dan insight dari Reza Refka Kurniawan seputar dunia pengembangan perangkat lunak.",
  blog_description_en: "Perspectives, experiences, and insights from Reza Refka Kurniawan about software development.",
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [form, setForm] = useState<Omit<SiteSettings, "id" | "updated_at">>(
    settings ? { ...defaultSettings, ...settings } : defaultSettings,
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    const supabase = createClient();
    const payload = { ...form, updated_at: new Date().toISOString() };
    let err;

    if (settings?.id) {
      ({ error: err } = await supabase.from("settings").update(payload).eq("id", settings.id));
    } else {
      ({ error: err } = await supabase.from("settings").insert([payload]));
    }

    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const section = (title: string, children: React.ReactNode) => (
    <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
      <Text variant="label-strong-m">{title}</Text>
      <Line background="neutral-alpha-weak" />
      {children}
    </Column>
  );

  const field = (label: string, key: string, placeholder?: string, type = "text") => (
    <Column gap="s">
      <Text variant="label-strong-s">{label}</Text>
      <Input id={key} type={type} value={(form as Record<string, unknown>)[key] as string ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value)}
        placeholder={placeholder} />
    </Column>
  );

  const numField = (label: string, key: string) => (
    <Column gap="s" flex={1}>
      <Text variant="label-strong-s">{label}</Text>
      <Input id={key} type="number" value={(form as Record<string, unknown>)[key] as number ?? 0}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(key, parseInt(e.target.value) || 0)} />
    </Column>
  );

  return (
    <Column fillWidth gap="xl" paddingBottom="80">
      {/* Website Info */}
      {section("Informasi Website",
        <Row gap="m" s={{ direction: "column" }}>
          {field("Nama Website", "website_name", "Reza Refka Kurniawan")}
          {field("Tagline (ID)", "tagline_id", "Full Stack Developer...")}
          {field("Tagline (EN)", "tagline_en", "Full Stack Developer...")}
        </Row>
      )}

      {/* Avatar */}
      {section("Avatar / Foto Profil",
        <ImageUpload
          bucket="avatars"
          value={form.avatar ?? ""}
          onChange={(url) => set("avatar", url)}
          autoSaveSettingsKey="avatar"
        />
      )}

      {/* Hero Section */}
      {section("Hero Section",
        <Column gap="m">
          {field("Nama Hero", "hero_name", "Reza Refka Kurniawan")}
          <Row gap="m" s={{ direction: "column" }}>
            {field("Headline (ID)", "hero_headline_id", "Membangun solusi digital...")}
            {field("Headline (EN)", "hero_headline_en", "Building meaningful...")}
          </Row>
          <Row gap="m" s={{ direction: "column" }}>
            {field("Motto (ID)", "hero_motto_id", "Code. Create. Impact.")}
            {field("Motto (EN)", "hero_motto_en", "Code. Create. Impact.")}
          </Row>
          <Column gap="s">
            <Text variant="label-strong-s">Deskripsi Hero (ID)</Text>
            <textarea value={form.hero_description_id}
              onChange={(e) => set("hero_description_id", e.target.value)} rows={3}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
          <Column gap="s">
            <Text variant="label-strong-s">Hero Description (EN)</Text>
            <textarea value={form.hero_description_en}
              onChange={(e) => set("hero_description_en", e.target.value)} rows={3}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
          <Row gap="m" s={{ direction: "column" }}>
            {field("CTA Text (ID)", "hero_cta_text_id", "Tentang Saya")}
            {field("CTA Text (EN)", "hero_cta_text_en", "About Me")}
            {field("CTA Link", "hero_cta_link", "/about")}
          </Row>
        </Column>
      )}

      {/* CV File */}
      {section("File CV / Resume",
        <Column gap="m">
          <Text variant="body-default-s" onBackground="neutral-weak">
            Upload file CV (PDF) yang akan bisa diunduh pengunjung dari halaman utama. Tombol Download CV akan muncul otomatis jika file ini diisi.
          </Text>
          <ImageUpload
            bucket="documents"
            value={form.cv_file ?? ""}
            onChange={(url) => set("cv_file", url)}
            accept=".pdf,.doc,.docx"
            multiple={false}
            autoSaveSettingsKey="cv_file"
          />
        </Column>
      )}

      {/* Statistics */}
      {section("Statistik Homepage",
        <Column gap="m">
          <Text variant="body-default-s" onBackground="neutral-weak">
            Jumlah Proyek dan Tulisan dihitung otomatis dari data yang dipublikasikan. Hanya isi Tahun Pengalaman secara manual.
          </Text>
          <Row gap="m" s={{ direction: "column" }} wrap>
            <Column gap="s" flex={1}>
              <Text variant="label-strong-s">Tahun Pengalaman</Text>
              <Input
                id="stats_years_experience"
                type="number"
                value={(form.stats_years_experience ?? 0) as unknown as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set("stats_years_experience", parseInt(e.target.value) || 0)
                }
                placeholder="cth: 3"
              />
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Masukkan 0 untuk menyembunyikan stat ini
              </Text>
            </Column>
            <Column gap="s" flex={1}>
              <Text variant="label-strong-s">Jumlah Sertifikat (manual)</Text>
              <Input
                id="stats_certificates"
                type="number"
                value={(form.stats_certificates ?? 0) as unknown as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set("stats_certificates", parseInt(e.target.value) || 0)
                }
              />
            </Column>
          </Row>
        </Column>
      )}

      {/* Social Links */}
      {section("Tautan Media Sosial",
        <Column gap="m">
          <Row gap="m" s={{ direction: "column" }}>
            {field("GitHub", "social_github", "https://github.com/...")}
            {field("LinkedIn", "social_linkedin", "https://linkedin.com/in/...")}
          </Row>
          <Row gap="m" s={{ direction: "column" }}>
            {field("Instagram", "social_instagram", "https://instagram.com/...")}
            {field("Threads", "social_threads", "https://www.threads.net/@...")}
          </Row>
          {field("Email", "social_email", "email@example.com", "email")}
          {field("Link Kalender (Booking)", "calendar_link", "https://cal.com/...")}
        </Column>
      )}

      {/* Footer */}
      {section("Footer",
        <Row gap="m" s={{ direction: "column" }}>
          {field("Teks Footer (ID)", "footer_text_id", "Dibuat dengan ❤️ di Makassar")}
          {field("Footer Text (EN)", "footer_text_en", "Made with ❤️ in Makassar")}
        </Row>
      )}

      {/* Work Page */}
      {section("Halaman Work (Proyek)",
        <Column gap="m">
          <Row gap="m" s={{ direction: "column" }}>
            {field("Judul Work (ID)", "work_title_id", "Proyek & Kreasi")}
            {field("Work Title (EN)", "work_title_en", "Projects & Creations")}
          </Row>
          <Column gap="s">
            <Text variant="label-strong-s">Deskripsi Work (ID)</Text>
            <textarea value={(form as Record<string, unknown>).work_description_id as string ?? ""}
              onChange={(e) => set("work_description_id", e.target.value)} rows={2}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
          <Column gap="s">
            <Text variant="label-strong-s">Work Description (EN)</Text>
            <textarea value={(form as Record<string, unknown>).work_description_en as string ?? ""}
              onChange={(e) => set("work_description_en", e.target.value)} rows={2}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
        </Column>
      )}

      {/* Blog Page */}
      {section("Halaman Blog",
        <Column gap="m">
          <Row gap="m" s={{ direction: "column" }}>
            {field("Judul Blog (ID)", "blog_title_id", "Insight & Perspektif dari Dunia Dev")}
            {field("Blog Title (EN)", "blog_title_en", "Insight & Perspectives from the Dev World")}
          </Row>
          <Column gap="s">
            <Text variant="label-strong-s">Deskripsi Blog (ID)</Text>
            <textarea value={(form as Record<string, unknown>).blog_description_id as string ?? ""}
              onChange={(e) => set("blog_description_id", e.target.value)} rows={2}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
          <Column gap="s">
            <Text variant="label-strong-s">Blog Description (EN)</Text>
            <textarea value={(form as Record<string, unknown>).blog_description_en as string ?? ""}
              onChange={(e) => set("blog_description_en", e.target.value)} rows={2}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
        </Column>
      )}

      {error && <Text variant="body-default-s" onBackground="danger-strong">{error}</Text>}
      {success && <Text variant="body-default-s" onBackground="brand-weak">✓ Pengaturan berhasil disimpan!</Text>}

      <Button onClick={handleSave} variant="primary" size="m" loading={loading}>
        Simpan Pengaturan
      </Button>
    </Column>
  );
}
