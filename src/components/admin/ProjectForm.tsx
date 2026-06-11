"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Column, Row, Text, Button, Input, Line } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/slug";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ToolsInput } from "@/components/admin/ToolsInput";
import type { Project, ProjectCategory, GalleryItem } from "@/lib/types";

const CATEGORIES: ProjectCategory[] = [
  "Web App",
  "Mobile App",
  "Data Visualization",
  "Creativity",
];

interface ProjectFormProps {
  project?: Project;
}

function detectFileType(url: string): "image" | "video" {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg|mkv|avi|m4v)$/.test(clean) || /\/video\//i.test(clean)) return "video";
  return "image";
}

/* ─── Gallery Item Card ─────────────────────────────────────────────── */
function GalleryItemCard({
  item,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  onCaptionChange,
  dragHandleProps,
}: {
  item: GalleryItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}) {
  const type = detectFileType(item.url);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${hovered ? "var(--brand-alpha-medium)" : "var(--neutral-alpha-weak)"}`,
        background: hovered ? "var(--brand-alpha-weak)" : "var(--neutral-background-medium)",
        transition: "border-color 0.18s, background 0.18s",
      }}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        title="Seret untuk ubah urutan"
        style={{
          flexShrink: 0,
          cursor: "grab",
          color: "var(--neutral-on-background-weak)",
          display: "flex",
          alignItems: "center",
          paddingTop: 2,
          opacity: 0.6,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/>
          <circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>
          <circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>
        </svg>
      </div>

      {/* Thumbnail preview */}
      <div style={{
        flexShrink: 0,
        width: 72,
        height: 52,
        borderRadius: 8,
        overflow: "hidden",
        background: type === "video" ? "linear-gradient(135deg,#0f0f1e,#1a1a3e)" : "var(--neutral-background-strong)",
        border: "1px solid var(--neutral-alpha-weak)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(129,140,248,0.85)"><polygon points="5 3 19 12 5 21"/></svg>
        )}
        {/* Order badge */}
        <div style={{
          position: "absolute", bottom: 3, right: 3,
          background: "rgba(0,0,0,0.7)",
          borderRadius: 4,
          fontSize: 9, fontWeight: 800,
          color: "#fff",
          padding: "1px 5px",
          letterSpacing: "0.04em",
        }}>
          #{index + 1}
        </div>
      </div>

      {/* Caption input */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: type === "video" ? "#818cf8" : "var(--brand-on-background-strong)",
            opacity: 0.75,
          }}>
            {type === "video" ? "VIDEO" : "GAMBAR"} {index + 1}
          </span>
        </div>
        <input
          type="text"
          value={item.caption ?? ""}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Caption / keterangan (opsional)..."
          style={{
            background: "var(--neutral-background-strong)",
            border: "1px solid var(--neutral-alpha-medium)",
            borderRadius: 7,
            padding: "7px 10px",
            color: "var(--neutral-on-background-strong)",
            fontSize: 13,
            width: "100%",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <div style={{
          fontSize: 10, color: "var(--neutral-on-background-weak)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          opacity: 0.55,
        }}>
          {item.url.split("/").pop()?.split("?")[0] ?? item.url}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          title="Pindah ke atas"
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--neutral-alpha-weak)",
            border: "1px solid var(--neutral-alpha-medium)",
            color: index === 0 ? "var(--neutral-on-background-weak)" : "var(--neutral-on-background-strong)",
            cursor: index === 0 ? "default" : "pointer",
            opacity: index === 0 ? 0.3 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Pindah ke bawah"
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--neutral-alpha-weak)",
            border: "1px solid var(--neutral-alpha-medium)",
            color: index === total - 1 ? "var(--neutral-on-background-weak)" : "var(--neutral-on-background-strong)",
            cursor: index === total - 1 ? "default" : "pointer",
            opacity: index === total - 1 ? 0.3 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button
          onClick={onRemove}
          title="Hapus"
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Gallery Manager ────────────────────────────────────────────────── */
function GalleryManager({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reorder = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((item, i) => ({ ...item, sort_order: i })));
  };

  const moveUp = (idx: number) => { if (idx > 0) reorder(idx, idx - 1); };
  const moveDown = (idx: number) => { if (idx < items.length - 1) reorder(idx, idx + 1); };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, sort_order: i })));
  };

  const updateCaption = (idx: number, caption: string) => {
    onChange(items.map((item, i) => i === idx ? { ...item, caption } : item));
  };

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const supabase = createClient();
    setUploading(true);
    setUploadError("");

    const newItems: GalleryItem[] = [];
    const fileArr = Array.from(files).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );

    if (fileArr.length === 0) {
      setUploadError("Hanya file gambar dan video yang didukung.");
      setUploading(false);
      return;
    }

    for (const file of fileArr) {
      const ext = file.name.split(".").pop() ?? "bin";
      const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("projects")
        .upload(filename, file, { upsert: false });

      if (error) {
        setUploadError(`Gagal upload ${file.name}: ${error.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from("projects").getPublicUrl(data.path);
      newItems.push({
        url: publicUrl,
        caption: "",
        sort_order: items.length + newItems.length,
      });
    }

    onChange([...items, ...newItems]);
    setUploading(false);
  }, [items, onChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  // Drag-and-drop reorder
  const handleItemDragStart = (idx: number) => setDragIdx(idx);
  const handleItemDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleItemDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== toIdx) reorder(dragIdx, toIdx);
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleItemDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--brand-background-strong)" : "var(--neutral-alpha-medium)"}`,
          borderRadius: 12,
          padding: "28px 20px",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragOver ? "var(--brand-alpha-weak)" : "var(--neutral-background-medium)",
          transition: "all 0.18s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {uploading ? (
          <>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "3px solid var(--brand-alpha-medium)",
              borderTopColor: "var(--brand-background-strong)",
              animation: "pgSpin 0.8s linear infinite",
            }} />
            <style>{`@keyframes pgSpin{to{transform:rotate(360deg)}}`}</style>
            <Text variant="body-default-s" onBackground="neutral-weak">Mengupload...</Text>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "var(--brand-alpha-weak)",
              border: "1px solid var(--brand-alpha-medium)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--brand-on-background-strong)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <Text variant="label-strong-s">Drag & drop gambar/video</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                atau klik untuk pilih file • Bisa pilih beberapa sekaligus
              </Text>
            </div>
            <div style={{
              fontSize: 11, color: "var(--neutral-on-background-weak)",
              background: "var(--neutral-alpha-weak)",
              borderRadius: 99, padding: "3px 12px",
            }}>
              JPG, PNG, WEBP, GIF, MP4, WEBM, MOV
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleFileInput}
        />
      </div>

      {uploadError && (
        <Text variant="body-default-s" onBackground="danger-strong">{uploadError}</Text>
      )}

      {/* Item list */}
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="label-strong-s">
              {items.length} file • Seret untuk ubah urutan
            </Text>
            <button
              onClick={() => {
                if (confirm("Hapus semua gambar galeri?")) onChange([]);
              }}
              style={{
                fontSize: 11, fontWeight: 600,
                color: "#ef4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 6, padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              Hapus Semua
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              draggable
              onDragStart={() => handleItemDragStart(idx)}
              onDragOver={(e) => handleItemDragOver(e, idx)}
              onDrop={(e) => handleItemDrop(e, idx)}
              onDragEnd={handleItemDragEnd}
              style={{
                opacity: dragIdx === idx ? 0.4 : 1,
                outline: dragOverIdx === idx && dragIdx !== idx ? "2px dashed var(--brand-background-strong)" : "none",
                borderRadius: 12,
                transition: "opacity 0.15s",
              }}
            >
              <GalleryItemCard
                item={item}
                index={idx}
                total={items.length}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)}
                onRemove={() => removeItem(idx)}
                onCaptionChange={(caption) => updateCaption(idx, caption)}
                dragHandleProps={{
                  title: "Seret untuk ubah urutan",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !uploading && (
        <div style={{
          textAlign: "center",
          padding: "16px 0",
          color: "var(--neutral-on-background-weak)",
          fontSize: 13,
          fontStyle: "italic",
          opacity: 0.6,
        }}>
          Belum ada gambar/video. Upload di atas untuk menambahkan.
        </div>
      )}
    </div>
  );
}

/* ─── Main Form ──────────────────────────────────────────────────────── */
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
    gallery: (project?.gallery ?? []) as GalleryItem[],
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

    // Normalize gallery sort_order before saving
    const galleryPayload: GalleryItem[] = form.gallery.map((item, i) => ({
      url: item.url,
      caption: item.caption ?? "",
      sort_order: i,
    }));

    const payload = {
      ...form,
      gallery: galleryPayload,
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
                <option key={c} value={c}>{c}</option>
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
        <Text variant="body-default-s" onBackground="neutral-weak">
          Gambar utama yang tampil di kartu proyek. Rasio thumbnail akan digunakan sebagai aspect ratio utama di halaman detail.
        </Text>
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

      {/* ── Gallery Manager ─────────────────────────────────────────── */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Row fillWidth horizontal="between" vertical="center">
          <Column gap="4">
            <Text variant="label-strong-m">Galeri Karya</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Upload gambar & video. Atur urutan dengan drag atau tombol ↑↓. Tambahkan caption untuk tiap file.
            </Text>
          </Column>
          {form.gallery.length > 0 && (
            <div style={{
              fontSize: 11, fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 99,
              background: "var(--brand-alpha-weak)",
              border: "1px solid var(--brand-alpha-medium)",
              color: "var(--brand-on-background-strong)",
              letterSpacing: "0.04em",
            }}>
              {form.gallery.length} file
            </div>
          )}
        </Row>
        <Line background="neutral-alpha-weak" />
        <GalleryManager
          items={form.gallery}
          onChange={(items) => set("gallery", items)}
        />
      </Column>

      {/* Content - Bilingual Tiptap */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Row fillWidth horizontal="between" vertical="center">
          <Text variant="label-strong-m">Konten Lengkap</Text>
          <Row gap="4">
            <button
              onClick={() => setActiveTab("id")}
              style={{
                padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activeTab === "id" ? "var(--brand-background-medium)" : "var(--neutral-alpha-weak)",
                color: activeTab === "id" ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
                fontSize: 13, fontWeight: 600,
              }}
            >ID</button>
            <button
              onClick={() => setActiveTab("en")}
              style={{
                padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activeTab === "en" ? "var(--brand-background-medium)" : "var(--neutral-alpha-weak)",
                color: activeTab === "en" ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-weak)",
                fontSize: 13, fontWeight: 600,
              }}
            >EN</button>
          </Row>
        </Row>
        <Line background="neutral-alpha-weak" />
        {activeTab === "id" ? (
          <TiptapEditor key="content_id" value={form.content_id} onChange={(html) => set("content_id", html)} />
        ) : (
          <TiptapEditor key="content_en" value={form.content_en} onChange={(html) => set("content_en", html)} />
        )}
      </Column>

      {/* Tools Used */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">Tools yang Digunakan</Text>
        <Line background="neutral-alpha-weak" />
        <Text variant="body-default-s" onBackground="neutral-weak">
          Tambahkan teknologi / tools yang digunakan dalam proyek ini.
        </Text>
        <ToolsInput value={form.tools} onChange={(tools) => set("tools", tools)} />
      </Column>

      {/* Attachment */}
      <Column gap="m" border="neutral-alpha-weak" radius="m" padding="l" background="surface">
        <Text variant="label-strong-m">File Lampiran (Opsional)</Text>
        <Line background="neutral-alpha-weak" />
        <Text variant="body-default-s" onBackground="neutral-weak">
          File tambahan seperti laporan, dokumentasi, atau file utama proyek. Akan tampil sebagai tombol download di halaman detail.
        </Text>
        <ImageUpload
          bucket="projects"
          value={form.attachment}
          onChange={(url) => set("attachment", url)}
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
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
        <Text variant="body-default-s" onBackground="danger-strong">{error}</Text>
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
