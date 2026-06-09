"use client";

import { useLang } from "@/lib/lang-context";
import { person } from "@/resources";
import type { Blog } from "@/lib/types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { SmallAvatarFromCms } from "@/components/SmallAvatarFromCms";
import Link from "next/link";

interface CmsPostProps {
  post: Blog;
  thumbnail: boolean;
  direction?: "row" | "column";
  featured?: boolean;
}

export default function CmsPost({ post, thumbnail, direction, featured }: CmsPostProps) {
  const { lang } = useLang();
  const title = (lang === "en" ? post.title_en : post.title_id) || post.title_id;
  const description = (lang === "en" ? post.description_en : post.description_id) || post.description_id;

  const dateStr = post.created_at
    ? format(new Date(post.created_at), "d MMM yyyy", { locale: idLocale })
    : "";

  // Estimate read time (~200 words/min)
  const wordCount = ((post.content_id || "") + " " + (post.content_en || "")).trim().split(/\s+/).length;
  const readMin = Math.max(1, Math.round(wordCount / 200));

  if (featured) {
    /* ── Featured card (large, horizontal on desktop) ────── */
    return (
      <>
        <style>{`
          .cmspost-featured {
            display: flex;
            flex-direction: row;
            gap: 0;
            border-radius: 16px;
            border: 1px solid var(--neutral-alpha-weak);
            background: var(--neutral-background-medium);
            overflow: hidden;
            text-decoration: none;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          }
          .cmspost-featured:hover {
            border-color: var(--neutral-alpha-medium);
            box-shadow: 0 8px 32px color-mix(in srgb, var(--neutral-on-background-strong) 7%, transparent);
            transform: translateY(-2px);
          }
          .cmspost-featured-img {
            flex: 0 0 48%;
            min-height: 240px;
            max-height: 340px;
            overflow: hidden;
            position: relative;
          }
          .cmspost-featured-img img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.4s ease;
          }
          .cmspost-featured:hover .cmspost-featured-img img {
            transform: scale(1.03);
          }
          .cmspost-featured-body {
            flex: 1;
            padding: 28px 28px 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-width: 0;
          }
          .cmspost-featured-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 10px;
            border-radius: 99px;
            background: var(--accent-alpha-weak);
            border: 1px solid var(--accent-alpha-medium);
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent-on-background-strong);
            width: fit-content;
            margin-bottom: 14px;
          }
          .cmspost-featured-title {
            font-size: clamp(18px, 2.4vw, 24px);
            font-weight: 700;
            line-height: 1.3;
            color: var(--neutral-on-background-strong);
            margin: 0 0 10px;
            word-break: break-word;
          }
          .cmspost-featured-desc {
            font-size: 13.5px;
            color: var(--neutral-on-background-weak);
            line-height: 1.65;
            margin: 0 0 20px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .cmspost-featured-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            color: var(--neutral-on-background-weak);
          }
          .cmspost-meta-sep {
            width: 3px; height: 3px;
            border-radius: 50%;
            background: var(--neutral-alpha-medium);
            flex-shrink: 0;
          }
          .cmspost-featured-read {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 16px;
            font-size: 12px;
            font-weight: 700;
            color: var(--accent-on-background-strong);
            letter-spacing: 0.03em;
          }
          @media (max-width: 640px) {
            .cmspost-featured { flex-direction: column; }
            .cmspost-featured-img { flex: none; min-height: 180px; max-height: 200px; }
            .cmspost-featured-body { padding: 18px 18px 16px; }
          }
        `}</style>

        <Link href={`/blog/${post.slug}`} className="cmspost-featured">
          {post.thumbnail && thumbnail && (
            <div className="cmspost-featured-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.thumbnail} alt={title || ""} />
            </div>
          )}
          <div className="cmspost-featured-body">
            <div>
              <div className="cmspost-featured-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Artikel Pilihan
              </div>
              <h2 className="cmspost-featured-title">{title}</h2>
              {description && (
                <p className="cmspost-featured-desc">{description}</p>
              )}
            </div>
            <div>
              <div className="cmspost-featured-meta">
                <SmallAvatarFromCms size={20} />
                <span style={{ fontWeight: 500 }}>{person.name}</span>
                <span className="cmspost-meta-sep" />
                <span>{dateStr}</span>
                <span className="cmspost-meta-sep" />
                <span>{readMin} mnt baca</span>
              </div>
              <div className="cmspost-featured-read">
                Baca artikel
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </>
    );
  }

  /* ── Regular card (grid) ──────────────────────────────── */
  return (
    <>
      <style>{`
        .cmspost-card {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          border: 1px solid var(--neutral-alpha-weak);
          background: var(--neutral-background-medium);
          overflow: hidden;
          text-decoration: none;
          height: 100%;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cmspost-card:hover {
          border-color: var(--neutral-alpha-medium);
          box-shadow: 0 4px 20px color-mix(in srgb, var(--neutral-on-background-strong) 6%, transparent);
          transform: translateY(-2px);
        }
        .cmspost-card-img {
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          position: relative;
          background: var(--neutral-alpha-weak);
        }
        .cmspost-card-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .cmspost-card:hover .cmspost-card-img img {
          transform: scale(1.04);
        }
        .cmspost-card-body {
          flex: 1;
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cmspost-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: var(--neutral-on-background-weak);
          flex-wrap: wrap;
        }
        .cmspost-card-title {
          font-size: 15px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--neutral-on-background-strong);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cmspost-card-desc {
          font-size: 12.5px;
          color: var(--neutral-on-background-weak);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .cmspost-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--neutral-alpha-weak);
          font-size: 11.5px;
          color: var(--neutral-on-background-weak);
          margin-top: auto;
        }
        .cmspost-card-readmore {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--accent-on-background-strong);
          display: flex;
          align-items: center;
          gap: 3px;
        }
      `}</style>

      <Link href={`/blog/${post.slug}`} className="cmspost-card">
        {post.thumbnail && thumbnail && (
          <div className="cmspost-card-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.thumbnail} alt={title || ""} />
          </div>
        )}
        <div className="cmspost-card-body">
          <div className="cmspost-card-meta">
            <SmallAvatarFromCms size={16} />
            <span>{person.name}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--neutral-alpha-medium)", display: "inline-block", flexShrink: 0 }} />
            <span>{dateStr}</span>
          </div>
          <h3 className="cmspost-card-title">{title}</h3>
          {description && (
            <p className="cmspost-card-desc">{description}</p>
          )}
          <div className="cmspost-card-footer">
            <span>{readMin} mnt baca</span>
            <span className="cmspost-card-readmore">
              Baca
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}
