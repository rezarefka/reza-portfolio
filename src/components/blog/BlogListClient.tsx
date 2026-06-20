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
          <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
            {Array.from({ length: 4 }).map((_, i) => (
              <BlogCardSkeleton key={i} withThumbnail />
            ))}
          </Grid>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--neutral-on-background-weak)" }}>
            {t("Belum ada artikel.", "No articles yet.")}
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
        </div>
      )}
    </>
  );
}
