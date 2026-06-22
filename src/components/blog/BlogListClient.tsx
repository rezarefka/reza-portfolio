"use client";

import { useState, useEffect } from "react";
import { Grid } from "@once-ui-system/core";
import CmsPost from "@/components/blog/CmsPost";
import { BlogCardSkeleton } from "@/components/Skeletons";
import { createClient } from "@/lib/supabase/client";
import type { Blog } from "@/lib/types";
import { useLang } from "@/lib/lang-context";

const ITEMS_PER_PAGE = 8;

interface BlogListClientProps {
  initialBlogs: Blog[];
}

export function BlogListClient({ initialBlogs }: BlogListClientProps) {
  const { t } = useLang();
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [page, setPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Realtime update from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setBlogs(data);
      });
  }, []);

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const paginated = blogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage === page) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  };

  return (
    <>
      <style>{`
        /* ── P8: Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .blog-list-wrap, .blog-card-anim, .blog-empty-state, .pag-btn {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }

        .blog-list-wrap {
          transition: opacity 0.22s ease, transform 0.22s ease;
          width: 100%;
        }
        .blog-list-wrap.fading {
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
        }
        @keyframes blogFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .blog-card-anim {
          animation: blogFadeIn 0.42s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── P9: Blog empty state ── */
        @keyframes blogEmptyIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .blog-empty-state {
          border: 1.5px dashed var(--neutral-alpha-medium); /* P9 */
          border-radius: 16px;                              /* P9 */
          padding: 64px 32px;                               /* P9 */
          text-align: center;                               /* P9 */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;                                        /* P3: 16px */
          width: 100%;
          box-sizing: border-box;
          animation: blogEmptyIn 400ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both; /* P9 */
        }
        .blog-empty-title {
          font-size: 18px;      /* P9 */
          font-weight: 600;     /* P9 */
          color: var(--neutral-on-background-strong);
          margin: 0;
          line-height: 1.3;
        }
        .blog-empty-desc {
          font-size: 14px;      /* P4: sm */
          line-height: 1.6;
          color: var(--neutral-on-background-weak);
          opacity: 0.65;
          margin: 0;
          max-width: 320px;
        }
        .blog-empty-home-btn {
          padding: 8px 16px;    /* P3 */
          border-radius: 8px;
          border: 1px solid var(--neutral-alpha-medium);
          background: transparent;
          color: var(--neutral-on-background-medium);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;             /* P3 */
          min-height: 40px;     /* P7: touch target */
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          margin-top: 8px;
        }
        .blog-empty-home-btn:hover {
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background-strong);
          border-color: var(--neutral-alpha-strong);
        }

        /* ── Pagination ── */
        .pag-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;      /* P3 */
          height: 40px;         /* P3+P7: touch target */
          padding: 0 8px;       /* P3 */
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

      <div className={`blog-list-wrap${isTransitioning ? " fading" : ""}`}>
        {isTransitioning ? (
          /* Skeleton muncul saat transisi — P9: empty state tidak muncul saat isTransitioning */
          <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
            {Array.from({ length: 4 }).map((_, i) => (
              <BlogCardSkeleton key={i} withThumbnail />
            ))}
          </Grid>
        ) : paginated.length === 0 ? (
          /* ── P9: Proper empty state — hanya muncul jika !isTransitioning ── */
          <div className="blog-empty-state">
            {/* P9: SVG pensil stroke 48px */}
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
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>

            {/* P9: Judul informatif */}
            <h3 className="blog-empty-title">
              {t("Belum ada tulisan", "No articles yet")}
            </h3>

            {/* P9: Deskripsi memberi arah tindakan */}
            <p className="blog-empty-desc">
              {t(
                "Artikel pertama sedang dipersiapkan. Kembali lagi nanti.",
                "The first article is being prepared. Check back again soon."
              )}
            </p>

            {/* P9: Action button ke beranda */}
            <a href="/" className="blog-empty-home-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {t("Kembali ke Beranda", "Back to Home")}
            </a>
          </div>
        ) : (
          <>
            {/* Featured first post */}
            {page === 1 && paginated[0] && (
              <div className="blog-card-anim" style={{ animationDelay: "0ms", marginBottom: 20 }}>
                <CmsPost post={paginated[0]} thumbnail direction="column" featured />
              </div>
            )}

            {/* Remaining as 2-col grid */}
            <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16" marginBottom="40">
              {(page === 1 ? paginated.slice(1) : paginated).map((post, i) => (
                <div
                  key={post.slug}
                  className="blog-card-anim"
                  style={{ animationDelay: `${i * 60}ms`, display: "flex", flexDirection: "column" }}
                >
                  <CmsPost post={post} thumbnail direction="column" />
                </div>
              ))}
            </Grid>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isTransitioning && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", paddingBottom: 40 }}>
          <button
            className="pag-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label={t("Halaman sebelumnya", "Previous page")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
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
            aria-label={t("Halaman berikutnya", "Next page")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
