"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  /* ── Empty state label ── */
  const emptyTitleLabel =
    activeCategory === "All"
      ? lang === "en" ? "No projects found" : "Belum ada proyek"
      : lang === "en"
        ? `No ${activeCategory} projects yet`
        : `${activeCategory} belum tersedia`;

  const emptyDescLabel =
    lang === "en"
      ? "Content for this category is still being prepared. View all works or select another category."
      : "Konten untuk kategori ini sedang dalam pengerjaan. Lihat semua karya atau pilih kategori lain.";

  return (
    <>
      <style>{`
        /* ── P8: Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .card-hidden, .work-list-wrap, .work-empty-state,
          .work-filter-chip, .pag-btn { transition-duration: 0.01ms !important; }
          .card-hidden { animation-duration: 0.01ms !important; }
        }

        .card-hidden {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
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

        /* P3: card list gap — 24px desktop, 16px mobile */
        .work-card-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          padding-inline: 16px;
          margin-bottom: 40px;
        }
        @media (max-width: 640px) {
          .work-card-list { gap: 16px; padding-inline: 8px; }
        }

        /* ── P7: Filter bar — chips with clear affordance ── */
        .work-filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;           /* P3: gap 8px */
          padding: 0;
          flex-wrap: wrap;
          justify-content: flex-start;
          max-width: 100%;
        }
        .work-filter-chip {
          position: relative;
          padding: 8px 16px;  /* P3: 8px 16px (was 8px 18px) */
          min-height: 40px;   /* P7: touch target min 40px */
          border-radius: 99px;
          border: 1px solid var(--neutral-alpha-medium); /* P7: border always visible */
          cursor: pointer;
          font-size: 13px;    /* P4: sm = 14px approx; 13 is closest readable */
          font-weight: 500;
          /* P7: transition includes border-color */
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
          font-family: inherit;
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-weak);
          letter-spacing: 0.01em;
          display: inline-flex;
          align-items: center;
        }
        /* P7: Active — solid background, not transparent */
        .work-filter-chip.active {
          background: var(--neutral-background-strong);
          color: var(--neutral-on-background-strong);
          font-weight: 700;
          border-color: var(--neutral-alpha-strong);
          box-shadow: 0 1px 4px color-mix(in srgb, var(--neutral-on-background-strong) 10%, transparent);
        }
        .work-filter-chip:not(.active):hover {
          color: var(--neutral-on-background-strong);
          border-color: var(--neutral-alpha-strong);
          background: color-mix(in srgb, var(--neutral-on-background-strong) 8%, transparent);
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
          margin-left: 6px;  /* P3: 8px group, 6px fits well */
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-weak);
          vertical-align: middle;
        }
        .work-filter-chip.active .work-filter-count {
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background-strong);
        }
        @media (max-width: 480px) {
          .work-filter-chip { font-size: 12px; padding: 8px 12px; }
        }

        /* ── P9: Empty State ── */
        @keyframes emptyFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .work-empty-state {
          border: 1.5px dashed var(--neutral-alpha-medium); /* P9 */
          border-radius: 16px;                              /* P9 */
          padding: 64px 32px;                               /* P9 */
          text-align: center;                               /* P9 */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
          animation: emptyFadeIn 400ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both; /* P9 */
        }
        .work-empty-title {
          font-size: 18px;      /* P9 */
          font-weight: 600;     /* P9 */
          color: var(--neutral-on-background-strong);
          margin: 0;
          line-height: 1.3;
        }
        .work-empty-desc {
          font-size: 14px;      /* P4: sm */
          line-height: 1.6;
          color: var(--neutral-on-background-weak);
          opacity: 0.65;
          margin: 0;
          max-width: 340px;
        }
        .work-empty-actions {
          display: flex;
          gap: 8px;             /* P3: 8px */
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .work-empty-btn-primary {
          padding: 8px 16px;    /* P3 */
          border-radius: 8px;   /* P7 */
          border: 1px solid var(--neutral-alpha-medium);
          background: var(--neutral-background-strong);
          color: var(--neutral-on-background-strong);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
          font-family: inherit;
          min-height: 40px;     /* P7: touch target */
        }
        .work-empty-btn-primary:hover {
          border-color: var(--neutral-alpha-strong);
        }
        .work-empty-btn-secondary {
          padding: 8px 16px;    /* P3 */
          border-radius: 8px;
          border: 1px solid var(--neutral-alpha-weak);
          background: transparent;
          color: var(--neutral-on-background-weak);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          font-family: inherit;
          min-height: 40px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .work-empty-btn-secondary:hover {
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-strong);
        }

        /* ── Pagination — P3: min-height 40px, gap 8px ── */
        .pag-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;      /* P3: was 36 → 40 */
          min-height: 40px;     /* P3+P7: touch target 40px */
          height: 40px;
          padding: 0 8px;       /* P3: 8px */
          border-radius: 8px;
          border: 1px solid var(--neutral-alpha-medium);
          background: transparent;
          color: var(--neutral-on-background-medium);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
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
        {/* ── Category Filter — P7: affordance, P3: 8pt spacing ── */}
        <div className="work-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`work-filter-chip${activeCategory === cat ? " active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={activeCategory === cat}
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

        {/* ── Project Cards / Empty State ── */}
        {/* P9: Skeleton while transitioning, empty state only when NOT transitioning */}
        {isTransitioning ? (
          <div className="work-card-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* ── P9: Proper empty state ── */
          <div className="work-empty-state">
            {/* SVG folder + search icon — P9: stroke style, 48×48 */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--neutral-on-background-weak)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <circle cx="11.5" cy="14.5" r="2.5"/>
              <line x1="13.2" y1="16.2" x2="15.5" y2="18.5"/>
            </svg>

            <h3 className="work-empty-title">{emptyTitleLabel}</h3>
            <p className="work-empty-desc">{emptyDescLabel}</p>

            {/* P9: Two action buttons */}
            <div className="work-empty-actions">
              <button
                className="work-empty-btn-primary"
                onClick={() => handleCategoryChange("All")}
              >
                {lang === "en" ? "View All Works" : "Lihat Semua"}
              </button>
              <a href="/" className="work-empty-btn-secondary">
                {lang === "en" ? "Back to Home" : "Kembali ke Beranda"}
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* ── Card list — P3: gap 24px desktop / 16px mobile via CSS ── */}
            <div
              ref={listRef}
              className={`work-list-wrap work-card-list${isTransitioning ? " fading" : ""}`}
            >
              {paginated.map((project, index) => {
                const thumbUrl = project.thumbnail ?? "";
                const images: string[] = [];
                if (thumbUrl) images.push(thumbUrl);
                (project.gallery ?? []).forEach((g) => {
                  const url = (typeof g === "string" ? g : g.url) ?? "";
                  if (url && !images.includes(url)) images.push(url);
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

            {/* ── Pagination — P3: min-height 40px, gap 8px ── */}
            {totalPages > 1 && !isTransitioning && (
              <Row horizontal="center" gap="8" wrap style={{ paddingBottom: 40 }}>
                <button
                  className="pag-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  aria-label={lang === "en" ? "Previous page" : "Halaman sebelumnya"}
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
                        <span key={p} style={{ color: "var(--neutral-on-background-weak)", fontSize: 13, padding: "0 4px", display: "flex", alignItems: "center" }}>
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
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  className="pag-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  aria-label={lang === "en" ? "Next page" : "Halaman berikutnya"}
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
