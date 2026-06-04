"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Column, Row, Text, Button, Input, Line } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ToolsInput } from "@/components/admin/ToolsInput";
import type { Project, ProjectCategory } from "@/lib/types";

const CATEGORIES: ProjectCategory[] = [
  "Web App",
  "Mobile App",
  "Data Visualization",
  "Creativity",
];

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!project;

  const [form, setForm] = useState({
    title_id: project?.title_id ?? "",
    title_en: project?.title_en ?? "",
    slug: project?.slug ?? "",
    category: project?.category ?? ("Web App" as ProjectCategory),
    thumbnail: project?.thumbnail ?? "",
    description_id: project?.description_id ?? "",
    description_en: project?.description_en ?? "",
    content_id: project?.content_id ?? "",
    content_en: project?.content_en ?? "",
    live_demo_url: project?.live_demo_url ?? "",
    attachment: project?.attachment ?? "",
    featured: project?.featured ?? false,
    published: project?.published ?? false,
    tools: project?.tools ?? [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [deleting, setDeleting] = useState(false);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleTitleIdChange = (val: string) => {
    set("title_id", val);
    if (!isEdit) set("slug", generateSlug(val));
  };

  const handleSubmit = async () => {
    if (!form.title_id || !form.slug) {
      setError("Judul (ID) dan slug wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const payload = {
      ...form,
      gallery: isEdit ? (project?.gallery ?? []) : [],
      tools: form.tools,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (isEdit) {
      ({ error: err } = await supabase.from("projects").update(payload).eq("id", project!.id));
    } else {
      ({ error: err } = await supabase.from("projects").insert([
        { ...payload, created_at: new Date().toISOString() },
      ]));
    }

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/reza-control/projects");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm(`Hapus project "${project.title_id}"? Tindakan ini tidak dapat dibatalkan.`))
      return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/reza-control/projects");
    router.refresh();
  };

  return (
    <Column fillWidth gap="xl" paddingBottom="80">
      {/* Basic Info */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Informasi Dasar</Text>
        <Line background="neutral-alpha-weak" />

        <Row gap="m" s={{ direction: "column" }}>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Judul (Indonesia) *</Text>
            <Input
              id="title_id"
              value={form.title_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleTitleIdChange(e.target.value)
              }
              placeholder="Nama project..."
            />
          </Column>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Judul (English)</Text>
            <Input
              id="title_en"
              value={form.title_en}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                set("title_en", e.target.value)
              }
              placeholder="Project name..."
            />
          </Column>
        </Row>

        <Row gap="m" s={{ direction: "column" }}>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Slug *</Text>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("slug", e.target.value)}
              placeholder="project-slug"
            />
          </Column>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Kategori</Text>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              style={{
                background: "var(--neutral-background-medium)",
                border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8,
                padding: "10px 12px",
                color: "var(--neutral-on-background-strong)",
                fontSize: 14,
                width: "100%",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Column>
        </Row>

        <Column gap="s">
          <Text variant="label-strong-s">Live Demo URL</Text>
          <Input
            id="live_demo_url"
            value={form.live_demo_url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("live_demo_url", e.target.value)
            }
            placeholder="https://..."
          />
        </Column>
      </Column>

      {/* Thumbnail */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Thumbnail</Text>
        <Line background="neutral-alpha-weak" />
        <ImageUpload
          bucket="projects"
          value={form.thumbnail}
          onChange={(url) => set("thumbnail", url)}
        />
      </Column>

      {/* Descriptions */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Deskripsi Singkat</Text>
        <Line background="neutral-alpha-weak" />
        <Column gap="s">
          <Text variant="label-strong-s">Deskripsi (Indonesia)</Text>
          <textarea
            value={form.description_id}
            onChange={(e) => set("description_id", e.target.value)}
            placeholder="Deskripsi singkat project..."
            rows={3}
            style={{
              background: "var(--neutral-background-medium)",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--neutral-on-background-strong)",
              fontSize: 14,
              width: "100%",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </Column>
        <Column gap="s">
          <Text variant="label-strong-s">Description (English)</Text>
          <textarea
            value={form.description_en}
            onChange={(e) => set("description_en", e.target.value)}
            placeholder="Short project description..."
            rows={3}
            style={{
              background: "var(--neutral-background-medium)",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--neutral-on-background-strong)",
              fontSize: 14,
              width: "100%",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </Column>
      </Column>

      {/* Content - Bilingual Tiptap */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Row fillWidth horizontal="between" vertical="center">
          <Text variant="label-strong-m">Konten Lengkap</Text>
          <Row gap="4">
            <button
              onClick={() => setActiveTab("id")}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background:
                  activeTab === "id"
                    ? "var(--brand-background-medium)"
                    : "var(--neutral-alpha-weak)",
                color:
                  activeTab === "id"
                    ? "var(--brand-on-background-strong)"
                    : "var(--neutral-on-background-weak)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ID
            </button>
            <button
              onClick={() => setActiveTab("en")}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background:
                  activeTab === "en"
                    ? "var(--brand-background-medium)"
                    : "var(--neutral-alpha-weak)",
                color:
                  activeTab === "en"
                    ? "var(--brand-on-background-strong)"
                    : "var(--neutral-on-background-weak)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              EN
            </button>
          </Row>
        </Row>
        <Line background="neutral-alpha-weak" />
        {activeTab === "id" ? (
          <TiptapEditor
            key="content_id"
            value={form.content_id}
            onChange={(html) => set("content_id", html)}
          />
        ) : (
          <TiptapEditor
            key="content_en"
            value={form.content_en}
            onChange={(html) => set("content_en", html)}
          />
        )}
      </Column>

      {/* Tools Used */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Tools yang Digunakan</Text>
        <Line background="neutral-alpha-weak" />
        <Text variant="body-default-s" onBackground="neutral-weak">
          Tambahkan teknologi / tools yang digunakan dalam proyek ini. Akan tampil sebagai chip di kartu proyek.
        </Text>
        <ToolsInput
          value={form.tools}
          onChange={(tools) => set("tools", tools)}
        />
      </Column>

      {/* Attachment / File Karya */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">File Karya (Attachment)</Text>
        <Line background="neutral-alpha-weak" />
        <Text variant="body-default-s" onBackground="neutral-weak">
          Upload file karya: PDF, video, atau gambar. Akan ditampilkan di halaman preview karya.
        </Text>
        <ImageUpload
          bucket="projects"
          value={form.attachment}
          onChange={(url) => set("attachment", url)}
          accept="image/*,video/*,.pdf"
        />
      </Column>

      {/* Settings */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Pengaturan</Text>
        <Line background="neutral-alpha-weak" />
        <Row gap="xl">
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--brand-background-strong)" }}
            />
            <Text variant="body-default-m">Published</Text>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--brand-background-strong)" }}
            />
            <Text variant="body-default-m">Featured</Text>
          </label>
        </Row>
      </Column>

      {error && (
        <Text variant="body-default-s" onBackground="danger-strong">
          {error}
        </Text>
      )}

      <Row gap="m" wrap>
        <Button onClick={handleSubmit} variant="primary" size="m" loading={loading}>
          {isEdit ? "Simpan Perubahan" : "Buat Project"}
        </Button>
        <Button href="/reza-control/projects" variant="secondary" size="m">
          Batal
        </Button>
        {isEdit && (
          <Button
            onClick={handleDelete}
            variant="danger"
            size="m"
            loading={deleting}
            style={{ marginLeft: "auto" }}
          >
            Hapus Project
          </Button>
        )}
      </Row>
    </Column>
  );
}
