"use client";

import { useState, useRef } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Column, Row, Text, Button, Input } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Media } from "@/lib/types";

interface MediaLibraryClientProps {
  initialMedia: Media[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryClient({ initialMedia }: MediaLibraryClientProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<typeof initialMedia[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = media.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpload = async (file: File) => {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bucket = file.type.startsWith("image/")
      ? "media"
      : file.type.startsWith("video/")
      ? "videos"
      : "documents";

    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) { setUploading(false); alert(error.message); return; }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const newMedia: Media = {
      id: crypto.randomUUID(),
      name: file.name,
      url: data.publicUrl,
      type: file.type,
      size: file.size,
      bucket,
      path,
      created_at: new Date().toISOString(),
    };

    const { data: inserted } = await supabase.from("media").insert([newMedia]).select().single();
    if (inserted) setMedia((prev) => [inserted, ...prev]);

    setUploading(false);
  };

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = (item: Media) => {
    setConfirmItem(item);
  };

  const doDelete = async (item: Media) => {
    setConfirmItem(null);
    const supabase = createClient();
    await supabase.storage.from(item.bucket).remove([item.path]);
    await supabase.from("media").delete().eq("id", item.id);
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    if (selected === item.id) setSelected(null);
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <>
        <Column fillWidth gap="l">
      {/* Toolbar */}
      <Row fillWidth gap="m" wrap>
        <Input
          id="search"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Cari file..."
          style={{ flex: 1 }}
        />
        <Button
          onClick={() => inputRef.current?.click()}
          variant="primary"
          size="m"
          loading={uploading}
          prefixIcon="plus"
        >
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,.pdf,.docx,.xlsx"
          style={{ display: "none" }}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = ""; // reset agar onChange bisa fire lagi untuk file sama
            for (const file of files) {
              await handleUpload(file);
            }
          }}
        />
      </Row>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Column
          border="neutral-alpha-weak"
          radius="m"
          padding="xl"
          background="surface"
          horizontal="center"
          align="center"
          gap="m"
        >
          <Text style={{ fontSize: 48 }}>🖼️</Text>
          <Text variant="heading-strong-m">Belum ada media</Text>
          <Button onClick={() => inputRef.current?.click()} variant="primary" size="m">
            Upload File
          </Button>
        </Column>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(selected === item.id ? null : item.id)}
              style={{
                border: `2px solid ${selected === item.id ? "var(--brand-background-strong)" : "var(--neutral-alpha-weak)"}`,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                background: "var(--neutral-background-medium)",
                transition: "border-color 0.15s",
              }}
            >
              {/* Preview */}
              <div
                style={{
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--neutral-alpha-weak)",
                  overflow: "hidden",
                }}
              >
                {isImage(item.type) ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Text style={{ fontSize: 40 }}>
                    {item.type.includes("pdf")
                      ? "📄"
                      : item.type.includes("video")
                      ? "🎬"
                      : "📎"}
                  </Text>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "8px 10px" }}>
                <Text
                  variant="body-default-xs"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {item.name}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {formatBytes(item.size)}
                </Text>
              </div>

              {/* Actions (visible on select) */}
              {selected === item.id && (
                <div style={{ padding: "0 10px 10px", display: "flex", gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(item.url, item.id); }}
                    style={{
                      flex: 1, padding: "5px 0", borderRadius: 6, border: "none",
                      background: "var(--brand-alpha-weak)", color: "var(--brand-on-background-strong)",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                    }}
                  >
                    {copied === item.id ? "✓ Copied!" : "Copy URL"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    style={{
                      padding: "5px 8px", borderRadius: 6, border: "none",
                      background: "var(--danger-alpha-weak)", color: "var(--danger-on-background-strong)",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                    }}
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {filtered.length} dari {media.length} file
        </Text>
      )}
    </Column>
      <ConfirmModal
        open={!!confirmItem}
        title="Hapus File?"
        message={`File "${confirmItem?.name}" akan dihapus permanen dari storage.`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => confirmItem && doDelete(confirmItem)}
        onCancel={() => setConfirmItem(null)}
      />
    </>
  );
}