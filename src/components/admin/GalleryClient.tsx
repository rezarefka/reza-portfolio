"use client";

import { useState, useRef } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Column, Row, Text, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { compressFile, formatBytes } from "@/lib/mediaCompressor";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  orientation: "horizontal" | "vertical";
  created_at: string;
}

interface GalleryClientProps {
  initialPhotos: GalleryPhoto[];
}

export function GalleryClient({ initialPhotos }: GalleryClientProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [compressInfo, setCompressInfo] = useState<{name:string;before:number;after:number}|null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [confirmPhoto, setConfirmPhoto] = useState<typeof initialPhotos[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setCompressInfo(null);
    const supabase = createClient();

    for (const rawFile of Array.from(files)) {
      // Compress image before upload
      const result = await compressFile(rawFile, {
        imageMaxBytes: 600 * 1024,
        imageQuality: 0.82,
        imageMaxDimension: 2560,
        imageFormat: "image/webp",
      });
      const file = result.file;
      if (result.wasCompressed) {
        setCompressInfo({ name: rawFile.name, before: result.originalSize, after: result.compressedSize });
      }

      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) { alert(error.message); continue; }

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);

      // Detect orientation
      const orientation = await new Promise<"horizontal" | "vertical">((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width >= img.height ? "horizontal" : "vertical");
        img.onerror = () => resolve("horizontal");
        img.src = URL.createObjectURL(file);
      });

      const newPhoto = {
        id: crypto.randomUUID(),
        url: urlData.publicUrl,
        caption: null,
        orientation,
        created_at: new Date().toISOString(),
      };

      const { data: inserted } = await supabase
        .from("gallery_photos")
        .insert([newPhoto])
        .select()
        .single();

      if (inserted) setPhotos((prev) => [inserted, ...prev]);
    }
    setUploading(false);
  };

  const handleDelete = (photo: GalleryPhoto) => {
    setConfirmPhoto(photo);
  };

  const doDelete = async (photo: GalleryPhoto) => {
    setConfirmPhoto(null);
    const supabase = createClient();
    const path = photo.url.split("/media/")[1];
    if (path) await supabase.storage.from("media").remove([path]);
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    if (preview === photo.url) setPreview(null);
  };

  const handleSaveCaption = async (id: string) => {
    const supabase = createClient();
    await supabase.from("gallery_photos").update({ caption: editCaption }).eq("id", id);
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, caption: editCaption } : p));
    setEditingId(null);
  };

  return (
    <>
        <Column fillWidth gap="l">
      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files); }}
        style={{
          border: "2px dashed var(--neutral-alpha-medium)",
          borderRadius: 16,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: "var(--neutral-alpha-weak)",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--brand-alpha-strong)";
          e.currentTarget.style.background = "var(--brand-alpha-weak)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--neutral-alpha-medium)";
          e.currentTarget.style.background = "var(--neutral-alpha-weak)";
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--brand-alpha-weak)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--brand-on-background-strong)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
              <line x1="12" y1="5" x2="12" y2="11"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
            </svg>
          </div>
          <div>
            <Text variant="heading-strong-m">
              {uploading ? "Mengupload..." : "Upload Foto Galeri"}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak" style={{ marginTop: 4 }}>
              Klik atau drag & drop · JPG, PNG, WebP · Bisa pilih banyak
            </Text>
          </div>
          {!uploading && (
            <Button variant="primary" size="s" prefixIcon="plus">Pilih Foto</Button>
          )}
          {uploading && (
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "3px solid var(--brand-alpha-weak)",
              borderTopColor: "var(--brand-background-strong)",
              animation: "spin 0.8s linear infinite",
            }} />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }}
        />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Compress result badge */}
      {compressInfo && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"8px 14px", borderRadius:10,
          background:"color-mix(in srgb,#22c55e 10%,transparent)",
          border:"1px solid color-mix(in srgb,#22c55e 25%,transparent)",
          fontSize:12, color:"#4ade80",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Dikompres: <strong>{formatBytes(compressInfo.before)}</strong> → <strong>{formatBytes(compressInfo.after)}</strong>
          {" "}(-{Math.round((1-compressInfo.after/compressInfo.before)*100)}%)</span>
        </div>
      )}

      {/* Count */}
      <Text variant="body-default-s" onBackground="neutral-weak">
        {photos.length} foto tersimpan
      </Text>

      {/* Grid */}
      {photos.length === 0 ? (
        <Column border="neutral-alpha-weak" radius="m" padding="xl" background="surface"
          horizontal="center" align="center" gap="m">
          <Text variant="heading-strong-m" onBackground="neutral-weak">Belum ada foto</Text>
          <Text variant="body-default-s" onBackground="neutral-weak">Upload foto pertama kamu di atas</Text>
        </Column>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{
              borderRadius: 12, overflow: "hidden",
              border: "1px solid var(--neutral-alpha-weak)",
              background: "var(--neutral-background-medium)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption || "gallery"}
                style={{
                  width: "100%",
                  aspectRatio: photo.orientation === "horizontal" ? "16/9" : "3/4",
                  objectFit: "cover", display: "block",
                }}
              />
              <div style={{ padding: "10px 12px" }}>
                {editingId === photo.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption..."
                      style={{
                        flex: 1, padding: "4px 8px", fontSize: 12,
                        background: "var(--neutral-alpha-weak)",
                        border: "1px solid var(--neutral-alpha-medium)",
                        borderRadius: 6, color: "inherit",
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveCaption(photo.id); if (e.key === "Escape") setEditingId(null); }}
                    />
                    <button onClick={() => handleSaveCaption(photo.id)}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "var(--brand-alpha-weak)", color: "var(--brand-on-background-strong)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      ✓
                    </button>
                  </div>
                ) : (
                  <Text variant="body-default-xs" onBackground="neutral-weak"
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                    onClick={() => { setEditingId(photo.id); setEditCaption(photo.caption || ""); }}>
                    {photo.caption || <span style={{ fontStyle: "italic" }}>+ tambah caption</span>}
                  </Text>
                )}
                <Row gap="8" paddingTop="8">
                  <button
                    onClick={() => { setEditingId(photo.id); setEditCaption(photo.caption || ""); }}
                    style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none", background: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(photo)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "var(--danger-alpha-weak)", color: "var(--danger-on-background-strong)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                    Hapus
                  </button>
                </Row>
              </div>
            </div>
          ))}
        </div>
      )}
    </Column>
      <ConfirmModal
        open={!!confirmPhoto}
        title="Hapus Foto?"
        message="Foto ini akan dihapus permanen dari galeri."
        confirmLabel="Ya, Hapus"
        onConfirm={() => confirmPhoto && doDelete(confirmPhoto)}
        onCancel={() => setConfirmPhoto(null)}
      />
    </>
  );
}