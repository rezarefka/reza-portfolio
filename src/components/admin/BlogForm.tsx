"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Column, Row, Text, Button, Input, Line } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Blog } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface BlogFormProps {
  blog?: Blog;
}

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!blog;

  const [form, setForm] = useState({
    title_id: blog?.title_id ?? "",
    title_en: blog?.title_en ?? "",
    slug: blog?.slug ?? "",
    description_id: blog?.description_id ?? "",
    description_en: blog?.description_en ?? "",
    content_id: blog?.content_id ?? "",
    content_en: blog?.content_en ?? "",
    thumbnail: blog?.thumbnail ?? "",
    published: blog?.published ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (val: string) => {
    set("title_id", val);
    if (!isEdit) set("slug", generateSlug(val));
  };

  const handleSubmit = async () => {
    if (!form.title_id || !form.slug) {
      setError("Judul dan slug wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const payload = { ...form, updated_at: new Date().toISOString() };
    let err;

    if (isEdit) {
      ({ error: err } = await supabase.from("blogs").update(payload).eq("id", blog!.id));
    } else {
      ({ error: err } = await supabase.from("blogs").insert([
        { ...payload, created_at: new Date().toISOString() },
      ]));
    }

    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/reza-control/blogs");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!blog) return;
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!blog) return;
    setConfirmOpen(false);
    setDeleting(true);
    const supabase = createClient();
    const { error: delErr } = await supabase.from("blogs").delete().eq("id", blog.id);
    if (delErr) { setError(`Gagal menghapus: ${delErr.message}`); setDeleting(false); return; }
    router.push("/reza-control/blogs");
    router.refresh();
  };

  const tabBtn = (tab: "id" | "en") => ({
    padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
    background: activeTab === tab ? "var(--brand-background-medium)" : "var(--neutral-alpha-weak)",
    color: activeTab === tab ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
    fontSize: 13, fontWeight: 600,
  });

  return (
    <Column fillWidth gap="xl" paddingBottom="80">
      {/* Basic */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Informasi Artikel</Text>
        <Line background="neutral-alpha-weak" />

        <Row gap="m" s={{ direction: "column" }}>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Judul (Indonesia) *</Text>
            <Input id="title_id" value={form.title_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
              placeholder="Judul artikel..." />
          </Column>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Judul (English)</Text>
            <Input id="title_en" value={form.title_en}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("title_en", e.target.value)}
              placeholder="Article title..." />
          </Column>
        </Row>

        <Column gap="s">
          <Text variant="label-strong-s">Slug *</Text>
          <Input id="slug" value={form.slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("slug", e.target.value)}
            placeholder="article-slug" />
        </Column>

        <Row gap="m" s={{ direction: "column" }}>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Deskripsi (Indonesia)</Text>
            <textarea value={form.description_id} onChange={(e) => set("description_id", e.target.value)}
              placeholder="Deskripsi singkat..." rows={3}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
          <Column gap="s" flex={1}>
            <Text variant="label-strong-s">Description (English)</Text>
            <textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)}
              placeholder="Short description..." rows={3}
              style={{ background: "var(--neutral-background-medium)", border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: 8, padding: "10px 12px", color: "var(--neutral-on-background-strong)",
                fontSize: 14, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Column>
        </Row>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "var(--brand-background-strong)" }} />
          <Text variant="body-default-m">Published</Text>
        </label>
      </Column>

      {/* Thumbnail */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Thumbnail</Text>
        <Line background="neutral-alpha-weak" />
        <ImageUpload bucket="blogs" value={form.thumbnail} onChange={(url) => set("thumbnail", url)} />
      </Column>

      {/* Content - Bilingual Tiptap */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Row fillWidth horizontal="between" vertical="center">
          <Text variant="label-strong-m">Konten Artikel</Text>
          <Row gap="4">
            <button onClick={() => setActiveTab("id")} style={tabBtn("id")}>ID</button>
            <button onClick={() => setActiveTab("en")} style={tabBtn("en")}>EN</button>
          </Row>
        </Row>
        <Line background="neutral-alpha-weak" />
        {activeTab === "id" ? (
          <TiptapEditor key="blog_id" value={form.content_id}
            onChange={(html) => set("content_id", html)} />
        ) : (
          <TiptapEditor key="blog_en" value={form.content_en}
            onChange={(html) => set("content_en", html)} />
        )}
      </Column>

      {error && <Text variant="body-default-s" onBackground="danger-strong">{error}</Text>}

      <Row gap="m" wrap>
        <Button onClick={handleSubmit} variant="primary" size="m" loading={loading}>
          {isEdit ? "Simpan Perubahan" : "Terbitkan Artikel"}
        </Button>
        <Button href="/reza-control/blogs" variant="secondary" size="m">Batal</Button>
        {isEdit && (
          <Button onClick={handleDelete} variant="danger" size="m" loading={deleting}
            style={{ marginLeft: "auto" }}>
            Hapus Artikel
          </Button>
        )}
      </Row>

      <ConfirmModal
        open={confirmOpen}
        title="Hapus Artikel?"
        message={`Artikel "${blog?.title_id}" akan dihapus permanen dan tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Column>
  );
}