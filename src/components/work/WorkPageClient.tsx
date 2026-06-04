"use client";

import { useState } from "react";
import { Column, Row, Text } from "@once-ui-system/core";
import { useLang } from "@/lib/lang-context";
import type { Project, ProjectCategory } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";

const CATEGORIES: ("All" | ProjectCategory)[] = [
  "All",
  "Web App",
  "Mobile App",
  "Data Visualization",
  "Creativity",
];

interface WorkPageClientProps {
  projects: Project[];
}

export function WorkPageClient({ projects }: WorkPageClientProps) {
  const { lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<"All" | ProjectCategory>("All");

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const categoryLabel = (c: "All" | ProjectCategory) => {
    if (c === "All") return lang === "en" ? "All" : "Semua";
    return c;
  };

  return (
    <Column fillWidth gap="xl">
      {/* Category Filter */}
      <Row gap="8" wrap horizontal="center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 16px",
              borderRadius: 99,
              border: "1px solid",
              borderColor:
                activeCategory === cat
                  ? "var(--brand-background-strong)"
                  : "var(--neutral-alpha-medium)",
              background:
                activeCategory === cat
                  ? "var(--brand-alpha-weak)"
                  : "transparent",
              color:
                activeCategory === cat
                  ? "var(--brand-on-background-strong)"
                  : "var(--neutral-on-background-weak)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeCategory === cat ? 600 : 400,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {categoryLabel(cat)}
            {cat !== "All" && (
              <span
                style={{
                  marginLeft: 6,
                  opacity: 0.6,
                  fontSize: 11,
                }}
              >
                ({projects.filter((p) => p.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </Row>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <Column horizontal="center" align="center" paddingY="80" gap="m">
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text variant="heading-strong-m">
            {lang === "en"
              ? "No projects in this category"
              : "Tidak ada proyek di kategori ini"}
          </Text>
        </Column>
      ) : (
        <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
          {filtered.map((project, index) => {
            // Keep full URL including cache-buster query param for proper loading
            const thumbUrl = project.thumbnail ?? "";
            const galleryUrls = (project.gallery ?? []).filter(Boolean);
            const images: string[] = [];
            if (thumbUrl) images.push(thumbUrl);
            galleryUrls.forEach((g) => { if (!images.includes(g)) images.push(g); });

            return (
              <ProjectCard
                priority={index < 2}
                key={project.slug}
                href={`/project/${project.slug}`}
                images={images}
                thumbnail={thumbUrl}
                title={lang === "en" ? project.title_en || project.title_id : project.title_id}
                description={
                  lang === "en"
                    ? project.description_en || project.description_id
                    : project.description_id
                }
                content=""
                avatars={[]}
                link={project.live_demo_url || ""}
                tools={project.tools ?? []}
                category={project.category}
                attachment={project.attachment}
                slug={project.slug}
              />
            );
          })}
        </Column>
      )}
    </Column>
  );
}
