"use client";

import { useState, useEffect, useRef } from "react";
import { Column, Row, Text } from "@once-ui-system/core";
import { useLang } from "@/lib/lang-context";
import type { Project, ProjectCategory } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectCardSkeleton } from "@/components/Skeletons";

const CATEGORIES: ("All" | ProjectCategory)[] = [
  "All",
  "Web App",
  "Mobile App",
  "Data Visualization",
  "Creativity",
];

const ITEMS_PER_PAGE = 6;

interface WorkPageClientProps {
  projects: Project[];
}

function triggerCardAnimations(container: HTMLElement, baseDelay = 100) {
  const wrappers = Array.from(
    container.querySelectorAll<HTMLElement>(".card-hidden")
  );
  const STAGGER = 130;
  wrappers.forEach((w) => {
    w.classList.remove("card-animate");
    w.style.transitionDelay = "0ms";
  });
  requestAnimationFrame(() => {
    wrappers.forEach((w, i) => {
      w.style.transitionDelay = `${baseDelay + i * STAGGER}ms`;
      w.classList.add("card-animate");
    });
  });
}

export function WorkPageClient({ projects }: WorkPageClientProps) {
  const { lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<"All" | ProjectCategory>("All");
  const [page, setPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const categoryLabel = (c: "All" | ProjectCategory) => {
    if (c === "All") return lang === "en" ? "All" : "Semua";
    return c;
  };

  const handleCategoryChange = (cat: "All" | ProjectCategory) => {
    if (cat === activeCategory) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveCategory(cat);
      setPage(1);
      setIsTransitioning(false);
    }, 220);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === page) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  };

  useEffect(() => {
    if (!listRef.current || isTransitioning) return;
    triggerCardAnimations(listRef.current, 200);
    isFirst.current = false;
  }, [isTransitioning, paginated]);

  return (
    <>
      <style>{`
        .card-hidden {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.45s cubic-bezier(0.22,1,0.36,1),
            transform 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        .card-animate {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes cardFadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .work-list-wrap {
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .work-list-wrap.fading {
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
        }

        /* Filter bar */
        .work-filter-bar {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-alpha-weak);
          flex-wrap: wrap;
          justify-content: center;
          max-width: 100%;
        }
        .work-filter-chip {
          position: relative;
          padding: 7px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 500;
          transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
          white-space: nowrap;
          font-family: inherit;
          background: transparent;
          color: var(--neutral-on-background-weak);
          letter-spacing: 0.01em;
        }
        .work-filter-chip.active {
          background: var(--neutral-background-strong);
          color: var(--neutral-on-background-strong);
          font-weight: 600;
          box-shadow: 0 1px 4px color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent),
                      0 0 0 1px var(--neutral-alpha-weak);
        }
        .work-filter-chip:not(.active):hover {
          color: var(--neutral-on-background-strong);
          background: color-mix(in srgb, var(--neutral-on-background-strong) 5%, transparent);
        }
        .work-filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 5px;
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-weak);
          vertical-align: middle;
        }
        .work-filter-chip.active .work-filter-count {
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background-strong);
        }
        @media (max-width: 480px) {
          .work-filter-chip { font-size: 11.5px; padding: 6px 12px; }
          .work-filter-bar { gap: 0; }
        }

        /* Pagination */
        .pag-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid var(--neutral-alpha-medium);
          background: transparent;
          color: var(--neutral-on-background-medium);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: inherit;
        }
        .pag-btn:hover:not(:disabled) {
          border-color: var(--brand-background-strong);
          color: var(--brand-on-background-strong);
          background: var(--brand-alpha-weak);
        }
        .pag-btn.active {
          border-color: var(--brand-background-strong);
          background: var(--brand-alpha-medium);
          color: var(--brand-on-background-strong);
          font-weight: 700;
        }
        .pag-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>

      <Column fillWidth gap="xl">
        {/* Category Filter */}
        <div className="work-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`work-filter-chip${activeCategory === cat ? " active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {categoryLabel(cat)}
              {cat !== "All" && (
                <span className="work-filter-count">
                  {projects.filter((p) => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Project Cards */}
        {filtered.length === 0 ? (
          <Column horizontal="center" align="center" paddingY="80" gap="m"
            style={{ animation: "cardFadeInUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text variant="heading-strong-m">
              {lang === "en" ? "No projects in this category" : "Tidak ada proyek di kategori ini"}
            </Text>
          </Column>
        ) : (
          <>
            <div
              ref={listRef}
              className={`work-list-wrap${isTransitioning ? " fading" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--static-space-40)",
                width: "100%",
                paddingInline: "var(--static-space-16)",
                marginBottom: "40px",
              }}
            >
              {isTransitioning
                ? Array.from({ length: 3 }).map((_, i) => (
                    <ProjectCardSkeleton key={i} />
                  ))
                : paginated.map((project, index) => {
                    const thumbUrl = project.thumbnail ?? "";
                    const galleryUrls = (project.gallery ?? []).filter(Boolean);
                    const images: string[] = [];
                    if (thumbUrl) images.push(thumbUrl);
                    galleryUrls.forEach((g) => {
                      if (!images.includes(g)) images.push(g);
                    });

                    return (
                      <div key={project.slug} className="card-hidden">
                        <ProjectCard
                          priority={index < 2}
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
                      </div>
                    );
                  })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isTransitioning && (
              <Row horizontal="center" gap="8" wrap style={{ paddingBottom: 40 }}>
                <button
                  className="pag-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const show =
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1;
                  const showEllipsisBefore = p === page - 2 && page > 3;
                  const showEllipsisAfter = p === page + 2 && page < totalPages - 2;

                  if (!show) {
                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={p} style={{ color: "var(--neutral-on-background-weak)", fontSize: 13, padding: "0 4px" }}>
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={p}
                      className={`pag-btn${p === page ? " active" : ""}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  className="pag-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </Row>
            )}

            {totalPages > 1 && (
              <Row horizontal="center" paddingBottom="8">
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {lang === "en"
                    ? `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} projects`
                    : `Menampilkan ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari ${filtered.length} proyek`}
                </Text>
              </Row>
            )}
          </>
        )}
      </Column>
    </>
  );
}
