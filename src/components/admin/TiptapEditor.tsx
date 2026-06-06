"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import { useState, useCallback } from "react";
import styles from "./TiptapEditor.module.scss";

const lowlight = createLowlight();
lowlight.register("javascript", js);
lowlight.register("typescript", ts);
lowlight.register("python", python);
lowlight.register("css", css);
lowlight.register("html", html);
lowlight.register("bash", bash);
lowlight.register("sql", sql);

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/* ── Toolbar Button ─────────────────────────────────────────────── */
const Btn = ({
  onClick, active, disabled, title, children, danger,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  title?: string; danger?: boolean; children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`${styles.menuBtn} ${active ? styles.active : ""} ${danger ? styles.danger : ""}`}
  >
    {children}
  </button>
);

const Sep = () => <div className={styles.sep} />;

/* ── Color palette picker ───────────────────────────────────────── */
const TEXT_COLORS = [
  { label: "Default",  value: "" },
  { label: "Brand",    value: "var(--brand-on-background-medium)" },
  { label: "Weak",     value: "var(--neutral-on-background-weak)" },
  { label: "Red",      value: "#ef4444" },
  { label: "Orange",   value: "#f97316" },
  { label: "Amber",    value: "#f59e0b" },
  { label: "Green",    value: "#22c55e" },
  { label: "Teal",     value: "#14b8a6" },
  { label: "Blue",     value: "#3b82f6" },
  { label: "Violet",   value: "#8b5cf6" },
  { label: "Pink",     value: "#ec4899" },
  { label: "White",    value: "#ffffff" },
];

const HIGHLIGHT_COLORS = [
  { label: "None",     value: "" },
  { label: "Yellow",   value: "rgba(250,204,21,0.25)" },
  { label: "Green",    value: "rgba(34,197,94,0.2)" },
  { label: "Blue",     value: "rgba(59,130,246,0.2)" },
  { label: "Pink",     value: "rgba(236,72,153,0.2)" },
  { label: "Orange",   value: "rgba(249,115,22,0.2)" },
  { label: "Purple",   value: "rgba(139,92,246,0.2)" },
];

/* ── Font sizes ─────────────────────────────────────────────────── */
const FONT_SIZES = ["12px","13px","14px","15px","16px","18px","20px","22px","24px","28px","32px","36px","40px","48px"];

export function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml]   = useState(value);
  const [showColorPicker,     setShowColorPicker]     = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      Placeholder.configure({ placeholder: placeholder || "Tulis konten di sini..." }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
  });

  if (!editor) return null;

  /* ── Insert helpers ─────────────────────────────────────────── */
  const addImage = () => {
    const url = prompt("URL gambar (kosongkan untuk upload file):");
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const insertTable = () => {
    const rows = parseInt(prompt("Jumlah baris:", "3") ?? "3") || 3;
    const cols = parseInt(prompt("Jumlah kolom:", "3") ?? "3") || 3;
    const header = confirm("Baris pertama sebagai header?");
    editor.chain().focus().insertContent(buildTableHtml(rows, cols, header)).run();
  };

  const insertDivider = () => {
    editor.chain().focus().insertContent(
      `<div class="cms-divider"><span></span><span class="cms-divider-dot"></span><span></span></div><p></p>`
    ).run();
  };

  const insertCallout = (type: "info" | "warning" | "success" | "error") => {
    const icons = { info: "ℹ️", warning: "⚠️", success: "✅", error: "❌" };
    editor.chain().focus().insertContent(
      `<div class="cms-callout cms-callout-${type}"><span class="cms-callout-icon">${icons[type]}</span><div class="cms-callout-body"><p></p></div></div><p></p>`
    ).run();
  };

  const insertInfoBox = () => {
    editor.chain().focus().insertContent(
      `<div class="cms-infobox"><p><strong>📌 Info</strong></p><p></p></div><p></p>`
    ).run();
  };

  const insertColumns = () => {
    editor.chain().focus().insertContent(
      `<div class="cms-columns"><div class="cms-col"><p></p></div><div class="cms-col"><p></p></div></div><p></p>`
    ).run();
  };

  const insertBadge = () => {
    const text = prompt("Teks badge:", "Badge");
    const type = prompt("Tipe (brand/success/warning/error/neutral):", "brand") || "brand";
    if (text) {
      editor.chain().focus().insertContent(
        `<span class="cms-badge cms-badge-${type}">${text}</span> `
      ).run();
    }
  };

  const insertYoutube = () => {
    const url = prompt("URL YouTube:");
    if (!url) return;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    const id = match?.[1];
    if (!id) { alert("URL YouTube tidak valid."); return; }
    editor.chain().focus().insertContent(
      `<div class="cms-video-wrapper"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p></p>`
    ).run();
  };

  const insertEmbed = () => {
    const html = prompt("Paste HTML embed (iframe, script, widget, dll):");
    if (html) editor.chain().focus().insertContent(html).run();
  };

  const setFontSize = (size: string) => {
    if (!size) {
      editor.chain().focus().unsetMark("textStyle").run();
    } else {
      editor.chain().focus().setMark("textStyle", { style: `font-size:${size}` }).run();
    }
  };

  const applyColor = (color: string) => {
    setShowColorPicker(false);
    if (!color) {
      editor.chain().focus().unsetMark("textStyle").run();
    } else {
      editor.chain().focus().setMark("textStyle", { style: `color:${color}` }).run();
    }
  };

  const applyHighlight = (color: string) => {
    setShowHighlightPicker(false);
    if (!color) {
      editor.chain().focus().unsetMark("textStyle").run();
    } else {
      editor.chain().focus().setMark("textStyle", { style: `background:${color};border-radius:3px;padding:1px 2px` }).run();
    }
  };

  const toggleHtmlMode = () => {
    if (!htmlMode) {
      setRawHtml(editor.getHTML());
      setHtmlMode(true);
    } else {
      editor.commands.setContent(rawHtml, { emitUpdate: false });
      onChange(rawHtml);
      setHtmlMode(false);
    }
  };

  const handleRawChange = (v: string) => {
    setRawHtml(v);
    onChange(v);
  };

  return (
    <div className={styles.wrapper}>

      {/* ── Toolbar Row 1: Text formatting ─────────────────────────── */}
      <div className={styles.toolbar}>

        {/* Headings */}
        <div className={styles.group}>
          {([1,2,3,4] as const).map((l) => (
            <Btn key={l}
              onClick={() => editor.chain().focus().toggleHeading({ level: l }).run()}
              active={editor.isActive("heading", { level: l })}
              title={`Heading ${l}`}
            >H{l}</Btn>
          ))}
          <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph">¶</Btn>
        </div>

        <Sep />

        {/* Text style */}
        <div className={styles.group}>
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><b>B</b></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><i>I</i></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><u>U</u></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </Btn>
        </div>

        <Sep />

        {/* Font size */}
        <div className={styles.group}>
          <select
            className={styles.select}
            title="Font size"
            defaultValue=""
            onChange={(e) => setFontSize(e.target.value)}
          >
            <option value="">Size</option>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Sep />

        {/* Color pickers */}
        <div className={styles.group} style={{ position: "relative" }}>
          {/* Text color */}
          <div style={{ position: "relative" }}>
            <Btn onClick={() => { setShowColorPicker(v => !v); setShowHighlightPicker(false); }} title="Warna Teks" active={showColorPicker}>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 11, lineHeight: 1 }}>A</span>
                <span style={{ width: 12, height: 3, borderRadius: 1, background: "var(--brand-background-strong)" }} />
              </span>
            </Btn>
            {showColorPicker && (
              <div className={styles.colorDropdown}>
                <div className={styles.colorLabel}>Warna Teks</div>
                <div className={styles.colorGrid}>
                  {TEXT_COLORS.map(c => (
                    <button key={c.value} type="button" title={c.label} className={styles.colorSwatch}
                      style={{ background: c.value || "var(--neutral-on-background-strong)", border: c.value ? undefined : "2px dashed var(--neutral-alpha-medium)" }}
                      onClick={() => applyColor(c.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Highlight */}
          <div style={{ position: "relative" }}>
            <Btn onClick={() => { setShowHighlightPicker(v => !v); setShowColorPicker(false); }} title="Highlight Teks" active={showHighlightPicker}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2l7 7-7 7-7-7z"/><path d="M5 9l-3 9 3 1 3-3"/><line x1="19" y1="9" x2="22" y2="22"/>
              </svg>
            </Btn>
            {showHighlightPicker && (
              <div className={styles.colorDropdown}>
                <div className={styles.colorLabel}>Highlight</div>
                <div className={styles.colorGrid}>
                  {HIGHLIGHT_COLORS.map(c => (
                    <button key={c.value} type="button" title={c.label} className={styles.colorSwatch}
                      style={{ background: c.value || "transparent", border: c.value ? undefined : "2px dashed var(--neutral-alpha-medium)" }}
                      onClick={() => applyHighlight(c.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Sep />

        {/* Align */}
        <div className={styles.group}>
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Rata Kiri">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Tengah">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Rata Kanan">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          </Btn>
        </div>

        <Sep />

        {/* Lists */}
        <div className={styles.group}>
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Daftar Nomor">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">{"</>"}</Btn>
        </div>

        <Sep />

        {/* Link & Image */}
        <div className={styles.group}>
          <Btn
            onClick={() => {
              if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); return; }
              const url = prompt("URL link:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            active={editor.isActive("link")} title="Insert Link"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </Btn>
          <Btn onClick={addImage} title="Insert Gambar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </Btn>
          <Btn onClick={insertTable} title="Insert Tabel">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </Btn>
        </div>

        <Sep />

        {/* Insert blocks */}
        <div className={styles.group}>
          <Btn onClick={() => insertCallout("info")} title="Callout Info">
            <span style={{ fontSize: 11, fontWeight: 700 }}>ℹ</span>
          </Btn>
          <Btn onClick={() => insertCallout("warning")} title="Callout Warning">
            <span style={{ fontSize: 11, fontWeight: 700 }}>⚠</span>
          </Btn>
          <Btn onClick={() => insertCallout("success")} title="Callout Success">
            <span style={{ fontSize: 11, fontWeight: 700 }}>✓</span>
          </Btn>
          <Btn onClick={() => insertCallout("error")} title="Callout Error">
            <span style={{ fontSize: 11, fontWeight: 700 }}>✕</span>
          </Btn>
          <Btn onClick={insertInfoBox} title="Info Box">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </Btn>
          <Btn onClick={insertColumns} title="Dua Kolom">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
          </Btn>
          <Btn onClick={insertBadge} title="Insert Badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="10" rx="5"/></svg>
          </Btn>
          <Btn onClick={insertDivider} title="Divider Dekoratif">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
          </Btn>
          <Btn onClick={insertYoutube} title="Embed YouTube">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="10" rx="2"/><polygon points="10 10 15 12 10 14" fill="currentColor"/></svg>
          </Btn>
          <Btn onClick={insertEmbed} title="Custom HTML / iFrame Embed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="HR Line">—</Btn>
        </div>

        <Sep />

        {/* Undo / Redo */}
        <div className={styles.group}>
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
          </Btn>
        </div>

        {/* HTML source toggle */}
        <div style={{ marginLeft: "auto" }}>
          <Btn onClick={toggleHtmlMode} active={htmlMode} title={htmlMode ? "Visual Editor" : "Edit HTML Source"}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 3 }}>{htmlMode ? "VISUAL" : "HTML"}</span>
          </Btn>
        </div>
      </div>

      {/* ── Editor Area ──────────────────────────────────────────── */}
      {htmlMode ? (
        <textarea
          value={rawHtml}
          onChange={(e) => handleRawChange(e.target.value)}
          className={styles.htmlSource}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} className={styles.content} />
      )}

      {/* ── Status bar ──────────────────────────────────────────── */}
      <div className={styles.statusBar}>
        <span>
          {editor.storage.characterCount?.words?.() ?? 0} kata ·{" "}
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} karakter
        </span>
        {htmlMode && <span style={{ color: "var(--brand-on-background-medium)" }}>● Mode HTML</span>}
      </div>

      {/* Close dropdowns on outside click */}
      {(showColorPicker || showHighlightPicker) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => { setShowColorPicker(false); setShowHighlightPicker(false); }}
        />
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function buildTableHtml(rows: number, cols: number, withHeader: boolean): string {
  let html = "<table><tbody>";
  for (let r = 0; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      const tag = withHeader && r === 0 ? "th" : "td";
      html += `<${tag}><p></p></${tag}>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}
