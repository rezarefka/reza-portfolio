"use client";

import { useState, useRef } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Column, Row, Text, Button, Input } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Media } from "@/lib/types";
import { compressFile, formatBytes } from "@/lib/mediaCompressor";

interface MediaLibraryClientProps { initialMedia: Media[]; }

export function MediaLibraryClient({ initialMedia }: MediaLibraryClientProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmItem, setConfirmItem] = useState<Media | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compressInfo, setCompressInfo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = media.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const allFilteredIds = filtered.map((m) => m.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleSelectAll = () => {
    if (allSelected) setSelected((prev) => { const s = new Set(prev); allFilteredIds.forEach((id) => s.delete(id)); return s; });
    else setSelected((prev) => { const s = new Set(prev); allFilteredIds.forEach((id) => s.add(id)); return s; });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setCompressInfo("");
    const supabase = createClient();

    // Compress images before upload
    let uploadFile = file;
    if (file.type.startsWith("image/")) {
      const res = await compressFile(file, { imageMaxBytes: 800 * 1024, imageQuality: 0.82, imageFormat: "image/webp" });
      uploadFile = res.file;
      if (res.wasCompressed) setCompressInfo(`${formatBytes(res.originalSize)} → ${formatBytes(res.compressedSize)} (-${Math.round((1 - res.compressedSize / res.originalSize) * 100)}%)`);
    }

    const ext = uploadFile.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bucket = file.type.startsWith("image/") ? "media" : file.type.startsWith("video/") ? "videos" : "documents";

    const { error } = await supabase.storage.from(bucket).upload(path, uploadFile);
    if (error) { setUploading(false); alert(error.message); return; }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const newMedia: Media = {
      id: crypto.randomUUID(), name: file.name, url: data.publicUrl,
      type: uploadFile.type || file.type, size: uploadFile.size, bucket, path,
      created_at: new Date().toISOString(),
    };
    const { data: inserted } = await supabase.from("media").insert([newMedia]).select().single();
    if (inserted) setMedia((prev) => [inserted, ...prev]);
    setUploading(false);
  };

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const doDelete = async (item: Media) => {
    setConfirmItem(null);
    const supabase = createClient();
    await supabase.storage.from(item.bucket).remove([item.path]);
    await supabase.from("media").delete().eq("id", item.id);
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    setSelected((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
  };

  const doBulkDelete = async () => {
    setConfirmBulk(false);
    const supabase = createClient();
    const toDelete = media.filter((m) => selected.has(m.id));
    for (const item of toDelete) {
      await supabase.storage.from(item.bucket).remove([item.path]);
      await supabase.from("media").delete().eq("id", item.id);
    }
    setMedia((prev) => prev.filter((m) => !selected.has(m.id)));
    setSelected(new Set());
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <>
      <style>{`
        .ml-card { border:2px solid var(--neutral-alpha-weak); border-radius:12px; overflow:hidden; cursor:pointer; background:var(--neutral-background-medium); transition:border-color 0.15s,transform 0.15s; position:relative; }
        .ml-card:hover { transform:translateY(-2px); }
        .ml-card.selected { border-color:var(--brand-background-strong); }
        .ml-checkbox { position:absolute; top:7px; left:7px; z-index:2; width:20px; height:20px; border-radius:6px; border:2px solid rgba(255,255,255,0.7); background:rgba(0,0,0,0.35); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; transition:background 0.12s,border-color 0.12s; }
        .ml-card.selected .ml-checkbox { background:var(--brand-background-strong); border-color:var(--brand-background-strong); }
        .ml-compress-badge { display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:9px;background:color-mix(in srgb,#22c55e 10%,transparent);border:1px solid color-mix(in srgb,#22c55e 25%,transparent);font-size:12px;color:#4ade80; }
      `}</style>
      <Column fillWidth gap="l">
        {/* Toolbar */}
        <Row fillWidth gap="m" wrap>
          <Input id="search" value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Cari file..." style={{ flex: 1 }} />
          <Button onClick={() => inputRef.current?.click()} variant="primary" size="m" loading={uploading} prefixIcon="plus">Upload</Button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,.pdf,.docx,.xlsx" style={{ display: "none" }}
            onChange={async (e) => { const files = Array.from(e.target.files || []); e.target.value = ""; for (const f of files) await handleUpload(f); }} />
        </Row>

        {/* Compress result */}
        {compressInfo && (
          <div className="ml-compress-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Gambar dikompres: {compressInfo}
          </div>
        )}

        {/* Select toolbar */}
        {filtered.length > 0 && (
          <Row gap="m" vertical="center" wrap>
            <button onClick={toggleSelectAll} style={{
              display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",
              borderRadius:8,border:"1px solid var(--neutral-alpha-medium)",
              background: allSelected ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
              color: allSelected ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-strong)",
              cursor:"pointer",fontSize:12,fontWeight:600,
            }}>
              <div style={{
                width:14,height:14,borderRadius:4,border:"2px solid currentColor",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              }}>
                {allSelected && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              {allSelected ? "Batal Semua" : "Pilih Semua"}
            </button>

            {someSelected && (
              <>
                <Text variant="body-default-xs" onBackground="neutral-weak">{selected.size} dipilih</Text>
                <button onClick={() => setConfirmBulk(true)} style={{
                  display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",
                  borderRadius:8,border:"1px solid var(--danger-alpha-medium)",
                  background:"var(--danger-alpha-weak)",color:"var(--danger-on-background-strong)",
                  cursor:"pointer",fontSize:12,fontWeight:600,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Hapus ({selected.size})
                </button>
              </>
            )}
          </Row>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <Column border="neutral-alpha-weak" radius="m" padding="xl" background="surface" horizontal="center" align="center" gap="m">
            <Text style={{ fontSize: 48 }}>🖼️</Text>
            <Text variant="heading-strong-m">Belum ada media</Text>
            <Button onClick={() => inputRef.current?.click()} variant="primary" size="m">Upload File</Button>
          </Column>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
            {filtered.map((item) => {
              const isSel = selected.has(item.id);
              return (
                <div key={item.id} className={`ml-card${isSel ? " selected" : ""}`}
                  onClick={() => toggleSelect(item.id)}>
                  {/* Checkbox overlay */}
                  <div className="ml-checkbox">
                    {isSel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>

                  {/* Preview */}
                  <div style={{ height:120, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--neutral-alpha-weak)", overflow:"hidden" }}>
                    {isImage(item.type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    ) : (
                      <Text style={{ fontSize:40 }}>
                        {item.type.includes("pdf") ? "📄" : item.type.includes("video") ? "🎬" : "📎"}
                      </Text>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding:"8px 10px" }}>
                    <Text variant="body-default-xs" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{item.name}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">{formatBytes(item.size)}</Text>
                  </div>

                  {/* Actions — show when selected */}
                  {isSel && (
                    <div style={{ padding:"0 10px 10px", display:"flex", gap:6 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleCopy(item.url, item.id)}
                        style={{ flex:1, padding:"5px 0", borderRadius:6, border:"none", background:"var(--brand-alpha-weak)", color:"var(--brand-on-background-strong)", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                        {copied === item.id ? "✓ Copied!" : "Copy URL"}
                      </button>
                      <button onClick={() => setConfirmItem(item)}
                        style={{ padding:"5px 8px", borderRadius:6, border:"none", background:"var(--danger-alpha-weak)", color:"var(--danger-on-background-strong)", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {filtered.length} dari {media.length} file
            {someSelected && ` · ${selected.size} dipilih`}
          </Text>
        )}
      </Column>

      <ConfirmModal open={!!confirmItem} title="Hapus File?"
        message={`File "${confirmItem?.name}" akan dihapus permanen dari storage.`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => confirmItem && doDelete(confirmItem)}
        onCancel={() => setConfirmItem(null)} />

      <ConfirmModal open={confirmBulk} title={`Hapus ${selected.size} File?`}
        message="File yang dipilih akan dihapus permanen dari storage. Tindakan ini tidak bisa dibatalkan."
        confirmLabel={`Hapus ${selected.size} File`}
        onConfirm={doBulkDelete}
        onCancel={() => setConfirmBulk(false)} />
    </>
  );
}
