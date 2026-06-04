"use client";

import { useState } from "react";
import { Text } from "@once-ui-system/core";

const SUGGESTED_TOOLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python",
  "Node.js", "Laravel", "Flutter", "Figma", "Supabase",
  "Tailwind", "PostgreSQL", "MongoDB", "Firebase", "Docker",
  "Framer", "Adobe XD", "Photoshop", "Illustrator", "Canva",
  "TensorFlow", "PyTorch", "Pandas", "Tableau", "Power BI",
  "Vue.js", "Angular", "Django", "FastAPI", "Go",
];

interface ToolsInputProps {
  value: string[];
  onChange: (tools: string[]) => void;
}

export function ToolsInput({ value, onChange }: ToolsInputProps) {
  const [inputVal, setInputVal] = useState("");

  const addTool = (tool: string) => {
    const trimmed = tool.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputVal("");
  };

  const removeTool = (tool: string) => {
    onChange(value.filter((t) => t !== tool));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTool(inputVal);
    }
    if (e.key === "Backspace" && !inputVal && value.length > 0) {
      removeTool(value[value.length - 1]);
    }
  };

  const suggestions = SUGGESTED_TOOLS.filter(
    (t) => !value.includes(t) && t.toLowerCase().includes(inputVal.toLowerCase())
  ).slice(0, 8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Tags display + input */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          minHeight: 44, padding: "8px 10px",
          background: "var(--neutral-background-medium)",
          border: "1px solid var(--neutral-alpha-medium)",
          borderRadius: 10, cursor: "text",
        }}
        onClick={() => document.getElementById("tools-input")?.focus()}
      >
        {value.map((tool) => (
          <span key={tool} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 99,
            background: "var(--brand-alpha-weak)",
            color: "var(--brand-on-background-strong)",
            border: "1px solid var(--brand-alpha-medium)",
            fontSize: 12, fontWeight: 600,
          }}>
            {tool}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTool(tool); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "inherit", padding: 0, lineHeight: 1,
                display: "flex", alignItems: "center", opacity: 0.6,
                fontSize: 14, fontWeight: 700,
              }}
            >×</button>
          </span>
        ))}
        <input
          id="tools-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Ketik tool lalu Enter... (misal: React, Figma)" : ""}
          style={{
            border: "none", outline: "none", background: "none",
            color: "var(--neutral-on-background-strong)",
            fontSize: 13, fontFamily: "inherit", minWidth: 160, flex: 1,
          }}
        />
      </div>

      {/* Quick suggestions */}
      {inputVal.length > 0 && suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTool(s)}
              style={{
                padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500,
                background: "var(--neutral-alpha-weak)",
                color: "var(--neutral-on-background-weak)",
                border: "1px solid var(--neutral-alpha-medium)",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-alpha-weak)"; e.currentTarget.style.color = "var(--brand-on-background-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-weak)"; e.currentTarget.style.color = "var(--neutral-on-background-weak)"; }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Popular tools chips (when empty) */}
      {value.length === 0 && inputVal.length === 0 && (
        <div>
          <Text variant="label-default-xs" onBackground="neutral-weak" style={{ marginBottom: 6, display: "block" }}>
            Pilih cepat:
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {SUGGESTED_TOOLS.slice(0, 12).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTool(s)}
                style={{
                  padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500,
                  background: "var(--neutral-alpha-weak)",
                  color: "var(--neutral-on-background-weak)",
                  border: "1px solid var(--neutral-alpha-medium)",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-alpha-weak)"; e.currentTarget.style.color = "var(--brand-on-background-strong)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-alpha-weak)"; e.currentTarget.style.color = "var(--neutral-on-background-weak)"; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {value.length} tool dipilih · Klik × untuk hapus · Enter atau koma untuk tambah
        </Text>
      )}
    </div>
  );
}
