"use client";

import { useState, useRef } from "react";
import { Column, Row, Text, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { compressFile, formatBytes, type CompressionResult } from "@/lib/mediaCompressor";

interface UploadedFile {
  name: string;
  url: string;
  type: "image" | "video" | "pdf" | "other";
  size: number;
  originalSize?: number;
  compressed?: boolean;
  compressionMethod?: string;
}

interface ImageUploadProps {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  autoSaveSettingsKey?: string;
  /** Allow picking multiple files at once */
  multiple?: boolean;
  /** Callback when multiple files uploaded — returns all URLs */
  onMultipleChange?: (urls: string[]) => void;
  /** Aktifkan kompresi otomatis. Default: true */
  enableCompression?: boolean;
}

function detectType(name: string, mime: string): UploadedFile["type"] {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  return "other";
}

const FileIcon = ({ type }: { type: UploadedFile["type"] }) => {
  if (type === "pdf") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
  if (type === "video") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
  if (type === "image") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  );
};

const typeColor: Record<UploadedFile["type"], string> = {
  image: "#3ecf8e",
  video: "#818cf8",
  pdf:   "#ef4444",
  other: "#94a3b8",
};

/* ── Progress states per file ── */
interface FileProgress {
  phase: "compressing" | "uploading" | "done" | "error";
  pct: number;
  label: string;
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  accept = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar",
  label,
  autoSaveSettingsKey,
  multiple = true,
  onMultipleChange,
  enableCompression = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, FileProgress>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = value ? value.split("?")[0] : "";
  const isPdf = displayUrl.endsWith(".pdf");
  const isVideo = /\.(mp4|webm|mov|ogg)$/.test(displayUrl);
  const isImage = !isPdf && !isVideo;
  const previewUrl = displayUrl && isImage ? `${displayUrl}?t=${Math.floor(Date.now() / 30000)}` : "";

  const setPhase = (name: string, phase: FileProgress["phase"], pct: number, label: string) => {
    setFileProgress((prev) => ({ ...prev, [name]: { phase, pct, label } }));
  };

  const removePhase = (name: string) => {
    setFileProgress((prev) => {
      const n = { ...prev };
      delete n[name];
      return n;
    });
  };

  const uploadFile = async (originalFile: File): Promise<{ url: string | null; result: CompressionResult | null }> => {
    const supabase = createClient();
    let fileToUpload = originalFile;
    let compressionResult: CompressionResult | null = null;

    // ── FASE 1: KOMPRESI ──────────────────────────────────────
    if (enableCompression) {
      setPhase(originalFile.name, "compressing", 5, "Mengompres…");

      try {
        compressionResult = await compressFile(originalFile, {
          imageMaxBytes: 800 * 1024,
          imageQuality: 0.82,
          imageMaxDimension: 2560,
          imageFormat: "image/webp",
          videoBitrate: 800_000,
          onProgress: (pct) => {
            setPhase(
              originalFile.name,
              "compressing",
              Math.round(pct * 0.6),
              pct < 50 ? "Mengompres…" : "Finalisasi kompresi…"
            );
          },
        });
        fileToUpload = compressionResult.file;
      } catch {
        // Kompresi gagal → pakai file asli
        compressionResult = null;
      }
    }

    // ── FASE 2: UPLOAD ────────────────────────────────────────
    setPhase(originalFile.name, "uploading", 62, "Mengunggah…");

    const ext = fileToUpload.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, fileToUpload, { upsert: false, contentType: fileToUpload.type });

    if (uploadError) {
      setPhase(originalFile.name, "error", 0, uploadError.message);
      setTimeout(() => removePhase(originalFile.name), 4000);
      setError(`${originalFile.name}: ${uploadError.message}`);
      return { url: null, result: compressionResult };
    }

    setPhase(originalFile.name, "uploading", 88, "Mendapatkan URL…");

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    // Log ke media
    supabase.from("media").insert([{
      name: originalFile.name,
      url: publicUrl,
      type: fileToUpload.type,
      size: fileToUpload.size,
      bucket, path,
      created_at: new Date().toISOString(),
    }]).then(() => {});

    setPhase(originalFile.name, "done", 100, "Selesai ✓");
    setTimeout(() => removePhase(originalFile.name), 2000);

    return { url: publicUrl, result: compressionResult };
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;
    setUploading(true);
    setError("");
    setSaved(false);

    const urls: string[] = [];
    const newUploaded: UploadedFile[] = [];

    for (const file of fileArr) {
      const { url, result } = await uploadFile(file);
      if (url) {
        urls.push(url);
        newUploaded.push({
          name: result?.wasCompressed ? result.file.name : file.name,
          url,
          type: detectType(file.name, file.type),
          size: result?.compressedSize ?? file.size,
          originalSize: result?.wasCompressed ? result.originalSize : undefined,
          compressed: result?.wasCompressed ?? false,
          compressionMethod: result?.method,
        });
      }
    }

    if (urls.length > 0) {
      const primaryUrl = `${urls[0]}?t=${Date.now()}`;
      onChange(primaryUrl);
      setUploadedFiles((prev) => [...prev, ...newUploaded]);

      if (onMultipleChange && urls.length > 1) {
        onMultipleChange(urls.map((u) => `${u}?t=${Date.now()}`));
      }

      if (autoSaveSettingsKey) {
        const supabase = createClient();
        const { data: rows } = await supabase.from("settings").select("id")
          .order("updated_at", { ascending: false }).limit(1);
        if (rows?.length) {
          const { error: saveErr } = await supabase.from("settings")
            .update({ [autoSaveSettingsKey]: urls[0], updated_at: new Date().toISOString() })
            .eq("id", rows[0].id);
          if (!saveErr) { setSaved(true); setTimeout(() => setSaved(false), 4000); }
        }
      }
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const progressEntries = Object.entries(fileProgress);
  const hasActiveProgress = progressEntries.length > 0;

  const phaseColors: Record<FileProgress["phase"], string> = {
    compressing: "#f59e0b",
    uploading: "var(--brand-background-strong)",
    done: "#3ecf8e",
    error: "#ef4444",
  };

  return (
    <Column gap="m">
      {label && <Text variant="label-strong-s">{label}</Text>}

      {/* Compression info badge */}
      {enableCompression && (
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 10px", borderRadius: 8,
          background: "rgba(62,207,142,0.07)",
          border: "1px solid rgba(62,207,142,0.18)",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span style={{ fontSize: 11, color: "#3ecf8e", fontWeight: 500 }}>
            Kompresi otomatis aktif — gambar dioptimasi ke WebP sebelum upload
          </span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--brand-background-strong)" : displayUrl ? "var(--brand-alpha-medium)" : "var(--neutral-alpha-medium)"}`,
          borderRadius: 12,
          padding: displayUrl ? 12 : 28,
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          transition: "border-color 0.2s, background 0.2s",
          background: dragOver
            ? "color-mix(in srgb, var(--brand-background-strong) 6%, transparent)"
            : "var(--neutral-alpha-weak)",
          minHeight: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
          position: "relative",
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview"
            style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : displayUrl && isPdf ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <Text variant="body-default-s" onBackground="neutral-weak">PDF terupload ✓</Text>
          </div>
        ) : displayUrl && isVideo ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <Text variant="body-default-s" onBackground="neutral-weak">Video terupload ✓</Text>
          </div>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-on-background-weak)" strokeWidth="1.5" strokeLinecap="round">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {uploading ? "Memproses…" : dragOver ? "Lepaskan file di sini" : "Klik atau seret file ke sini"}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Gambar (→ WebP) · Video · PDF · ZIP · dll · {multiple ? "Bisa beberapa file" : "1 file"}
            </Text>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Progress per file */}
      {hasActiveProgress && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {progressEntries.map(([name, fp]) => (
            <div key={name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                  {/* Phase icon */}
                  {fp.phase === "compressing" && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  )}
                  {fp.phase === "uploading" && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand-background-strong)" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  )}
                  {fp.phase === "done" && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  <Text variant="body-default-xs" onBackground="neutral-weak" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                    {name}
                  </Text>
                </div>
                <Text variant="body-default-xs" style={{ color: phaseColors[fp.phase], flexShrink: 0, fontSize: 10, fontWeight: 600 }}>
                  {fp.label}
                </Text>
              </div>
              <div style={{ height: 3, borderRadius: 99, background: "var(--neutral-alpha-weak)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${fp.pct}%`,
                  borderRadius: 99,
                  background: phaseColors[fp.phase],
                  transition: "width 0.25s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded file list */}
      {uploadedFiles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <Text variant="label-default-xs" onBackground="neutral-weak">File terupload ({uploadedFiles.length})</Text>
          {uploadedFiles.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "7px 11px", borderRadius: 8,
              background: "var(--neutral-alpha-weak)",
              border: `1px solid ${f.compressed ? "rgba(62,207,142,0.2)" : "var(--neutral-alpha-medium)"}`,
            }}>
              <span style={{ color: typeColor[f.type], flexShrink: 0 }}>
                <FileIcon type={f.type} />
              </span>
              <span style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--neutral-on-background-strong)" }}>
                {f.name}
              </span>

              {/* Size info */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 1 }}>
                <span style={{ fontSize: 11, color: "var(--neutral-on-background-weak)" }}>
                  {formatBytes(f.size)}
                </span>
                {f.compressed && f.originalSize && (
                  <span style={{ fontSize: 9, color: "#3ecf8e", fontWeight: 600 }}>
                    ↓ {formatBytes(f.originalSize)} → {formatBytes(f.size)}
                  </span>
                )}
              </div>

              {/* Compression badge */}
              {f.compressed && (
                <div style={{
                  padding: "2px 6px", borderRadius: 99,
                  background: "rgba(62,207,142,0.12)", border: "1px solid rgba(62,207,142,0.25)",
                  fontSize: 9, color: "#3ecf8e", fontWeight: 700,
                  flexShrink: 0, letterSpacing: "0.02em",
                }}>
                  OPTIMIZED
                </div>
              )}

              {/* Open link */}
              <a href={f.url} target="_blank" rel="noopener noreferrer"
                style={{ flexShrink: 0, color: "var(--neutral-on-background-weak)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* URL input */}
      <Row gap="m" vertical="center">
        <input
          type="text"
          value={displayUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Atau paste URL langsung..."
          style={{
            flex: 1,
            background: "var(--neutral-background-medium)",
            border: "1px solid var(--neutral-alpha-medium)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--neutral-on-background-strong)",
            fontSize: 13,
            fontFamily: "monospace",
          }}
        />
        {value && (
          <Button size="s" variant="tertiary" onClick={() => { onChange(""); setUploadedFiles([]); setSaved(false); }}>
            Hapus
          </Button>
        )}
      </Row>

      {saved && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅</Text>
          <Text variant="body-default-s" onBackground="brand-weak">Tersimpan otomatis!</Text>
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 14 }}>❌</Text>
          <Text variant="body-default-s" onBackground="danger-strong">{error}</Text>
        </div>
      )}
    </Column>
  );
}
