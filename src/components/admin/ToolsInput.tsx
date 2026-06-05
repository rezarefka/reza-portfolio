"use client";

import { useState, useRef } from "react";
import { Text } from "@once-ui-system/core";

interface ToolsInputProps {
  value: string[];
  onChange: (tools: string[]) => void;
}

const SUGGESTIONS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python",
  "Node.js", "Laravel", "Flutter", "Figma", "Supabase",
  "Tailwind CSS", "PostgreSQL", "MongoDB", "Firebase", "Docker",
  "Framer", "Adobe XD", "Photoshop", "Illustrator", "Canva",
  "TensorFlow", "PyTorch", "Pandas", "Tableau", "Power BI",
  "Vue.js", "Angular", "Django", "FastAPI", "Go",
  "Swift", "Kotlin", "Unity", "Blender", "After Effects",
  "Prisma", "Redis", "GraphQL", "REST API", "Vercel",
];

export function ToolsInput({ value, onChange }: ToolsInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Show suggestions only when typing, filtered by input
  const filteredSuggestions = inputVal.length > 0
    ? SUGGESTIONS.filter(
        (t) => !value.includes(t) && t.toLowerCase().includes(inputVal.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Tags + input area */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          minHeight: 48, padding: "8px 10px",
          background: "var(--neutral-background-medium)",
          border: `1px solid ${focused ? "var(--brand-alpha-strong)" : "var(--neutral-alpha-medium)"}`,
          borderRadius: 10, cursor: "text",
          transition: "border-color 0.15s",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tool) => (
          <span key={tool} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 99,
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
          ref={inputRef}
          id="tools-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); }}
          placeholder={value.length === 0 ? "Type a tool name, then press Enter or comma..." : "Add more..."}
          style={{
            border: "none", outline: "none", background: "none",
            color: "var(--neutral-on-background-strong)",
            fontSize: 13, fontFamily: "inherit", minWidth: 200, flex: 1,
          }}
        />
      </div>

      {/* Autocomplete dropdown */}
      {filteredSuggestions.length > 0 && (
        <div style={{
          padding: "8px 10px",
          background: "var(--neutral-background-strong)",
          border: "1px solid var(--neutral-alpha-medium)",
          borderRadius: 10,
        }}>
          <Text variant="label-default-xs" onBackground="neutral-weak" style={{ marginBottom: 6, display: "block" }}>
            Suggestions
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTool(s); }}
                style={{
                  padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500,
                  background: "var(--neutral-alpha-weak)",
                  color: "var(--neutral-on-background-medium)",
                  border: "1px solid var(--neutral-alpha-medium)",
                  cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--brand-alpha-weak)";
                  e.currentTarget.style.color = "var(--brand-on-background-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--neutral-alpha-weak)";
                  e.currentTarget.style.color = "var(--neutral-on-background-medium)";
                }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status hint */}
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {value.length > 0
          ? `${value.length} tool${value.length > 1 ? "s" : ""} added · Press × to remove · Enter or comma to add`
          : "Type any tool name freely — not limited to suggestions"}
      </Text>
    </div>
  );
}
