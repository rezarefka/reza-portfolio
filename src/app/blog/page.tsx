import { Column, Meta, Schema } from "@once-ui-system/core";
import { baseURL, blog, person } from "@/resources";
import { getPublishedBlogs, getSettings } from "@/lib/db";
import { BlogListClient } from "@/components/blog/BlogListClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

export default async function Blog() {
  const [blogs, settings] = await Promise.all([
    getPublishedBlogs().catch(() => []),
    getSettings().catch(() => null),
  ]);

  const titleId = settings?.blog_title_id || "Insight & Perspektif dari Dunia Dev";
  const descId = settings?.blog_description_id || blog.description;

  return (
    <Column maxWidth="m" paddingTop="0">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* ── Blog Hero Header ─────────────────────────────────── */}
      <style>{`
        @keyframes blogHeroIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blogLineGrow {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes blogDotBlink {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        .blog-hero {
          position: relative;
          width: 100%;
          padding: 52px 24px 44px;
          overflow: hidden;
        }

        /* Noise / grid texture */
        .blog-hero-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--neutral-alpha-weak) 1px, transparent 1px),
            linear-gradient(90deg, var(--neutral-alpha-weak) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(ellipse 90% 100% at 0% 50%, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 90% 100% at 0% 50%, black 30%, transparent 80%);
          pointer-events: none;
          opacity: 0.6;
        }

        /* Left glow */
        .blog-hero-glow {
          position: absolute;
          top: 50%;
          left: -80px;
          transform: translateY(-50%);
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(ellipse,
            color-mix(in srgb, var(--accent-background-strong) 14%, transparent) 0%,
            transparent 70%);
          pointer-events: none;
        }

        .blog-hero-content {
          position: relative;
          max-width: 560px;
        }

        /* Eyebrow */
        .blog-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          animation: blogHeroIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both;
        }
        .blog-eyebrow-line {
          width: 28px;
          height: 2px;
          border-radius: 99px;
          background: var(--accent-background-strong);
          transform-origin: left;
          animation: blogLineGrow 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }
        .blog-eyebrow-text {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent-on-background-strong);
        }
        .blog-eyebrow-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--neutral-on-background-weak);
          animation: blogDotBlink 2.2s ease-in-out infinite;
        }
        .blog-eyebrow-count {
          font-size: 11px;
          font-weight: 600;
          color: var(--neutral-on-background-weak);
          letter-spacing: 0;
        }

        /* Title — solid color, no gradient */
        .blog-hero-title {
          font-size: clamp(26px, 4.5vw, 40px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--neutral-on-background-strong);
          margin: 0 0 14px;
          animation: blogHeroIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.12s both;
        }

        /* Description */
        .blog-hero-desc {
          font-size: 14px;
          line-height: 1.7;
          color: var(--neutral-on-background-weak);
          margin: 0 0 0;
          max-width: 440px;
          animation: blogHeroIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }

        /* Divider */
        .blog-hero-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            var(--neutral-alpha-medium) 0%,
            transparent 100%
          );
          margin: 0 0 32px;
          animation: blogLineGrow 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both;
          transform-origin: left;
        }

        @media (max-width: 480px) {
          .blog-hero { padding: 36px 16px 32px; }
          .blog-hero-title { font-size: 24px; }
        }
      `}</style>

      <div className="blog-hero">
        <div className="blog-hero-bg" />
        <div className="blog-hero-glow" />

        <div className="blog-hero-content">
          {/* Eyebrow */}
          <div className="blog-eyebrow">
            <div className="blog-eyebrow-line" />
            <span className="blog-eyebrow-text">Blog &amp; Artikel</span>
            <span className="blog-eyebrow-dot" />
            <span className="blog-eyebrow-count">{blogs.length} tulisan</span>
          </div>

          {/* Title — plain, no gradient em */}
          <h1 className="blog-hero-title">{titleId}</h1>

          {/* Description */}
          <p className="blog-hero-desc">{descId}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ padding: "0 24px" }}>
        <div className="blog-hero-divider" />
      </div>

      {/* ── Blog List ─────────────────────────────────────────── */}
      <Column fillWidth flex={1} gap="0" paddingX="4">
        <BlogListClient initialBlogs={blogs} />
      </Column>
    </Column>
  );
}
