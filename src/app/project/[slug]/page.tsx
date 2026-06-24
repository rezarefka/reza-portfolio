import { notFound } from "next/navigation";
import {
  Meta,
  Schema,
  Column,
  Heading,
  Text,
  SmartLink,
  Row,
  Button,
  Line,
} from "@once-ui-system/core";
import { baseURL, about, person } from "@/resources";
import { getProjectBySlug, getPublishedProjects } from "@/lib/db";
import { Metadata } from "next";
import { RelatedProjectsCarousel } from "@/components/work/RelatedProjectsCarousel";
import { ScrollToHash } from "@/components";
import { ShareButton } from "@/components/ShareButton";
import { ProjectContent } from "@/components/cms/ProjectContent";
import { ProjectGalleryInline } from "@/components/cms/ProjectGalleryInline";
import { ProjectViewTracker } from "@/components/ProjectViewTracker";
import { T } from "@/components/T";
import { LocalizedDate } from "@/components/LocalizedDate";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return (projects ?? []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const meta = Meta.generate({
    title: project.title_id,
    description: project.description_id,
    baseURL,
    image: project.thumbnail?.split("?")[0] || `/api/og/generate?title=${project.title_id}`,
    path: `/project/${project.slug}`,
  });
  return { ...meta, robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } } };
}

function getMediaType(url: string): "image" | "video" | "pdf" | null {
  if (!url) return null;
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(clean)) return "image";
  return "image";
}

const CATEGORY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "Web App":            { bg: "rgba(99,102,241,0.12)", color: "#818cf8", border: "rgba(99,102,241,0.25)" },
  "Mobile App":         { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
  "Data Visualization": { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  "Creativity":         { bg: "rgba(236,72,153,0.12)", color: "#f472b6", border: "rgba(236,72,153,0.25)" },
};

const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
  "React":       { bg: "rgba(97,218,251,0.1)",  color: "#61dafb" },
  "Next.js":     { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)" },
  "TypeScript":  { bg: "rgba(49,120,198,0.12)",  color: "#3178c6" },
  "JavaScript":  { bg: "rgba(247,220,111,0.12)", color: "#f7dc6f" },
  "Python":      { bg: "rgba(55,118,171,0.12)",  color: "#3776ab" },
  "Figma":       { bg: "rgba(162,89,255,0.12)",  color: "#a259ff" },
  "Supabase":    { bg: "rgba(62,207,142,0.1)",   color: "#3ecf8e" },
  "Tailwind":    { bg: "rgba(56,189,248,0.1)",   color: "#38bdf8" },
  "Flutter":     { bg: "rgba(84,197,248,0.1)",   color: "#54c5f8" },
  "Laravel":     { bg: "rgba(255,45,32,0.1)",    color: "#ff2d20" },
  "Node.js":     { bg: "rgba(83,158,67,0.12)",   color: "#53a743" },
  "Vue":         { bg: "rgba(65,184,131,0.12)",  color: "#41b883" },
  "Svelte":      { bg: "rgba(255,62,0,0.1)",     color: "#ff3e00" },
  "Go":          { bg: "rgba(0,173,216,0.1)",    color: "#00add8" },
  "Rust":        { bg: "rgba(222,165,132,0.12)", color: "#dea584" },
  "Docker":      { bg: "rgba(13,183,237,0.1)",   color: "#0db7ed" },
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const tools = project.tools ?? [];
  const thumbClean = project.thumbnail ? project.thumbnail.split("?")[0] : "";
  const attachClean = project.attachment ? project.attachment.split("?")[0] : "";
  const attachType = attachClean ? getMediaType(attachClean) : null;
  const catStyle = project.category ? CATEGORY_STYLE[project.category] : null;

  return (
    <>
      {/* ── Page-level styles ───────────────────────────────── */}
      <style>{`
        .project-hero-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
        }
        .project-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--neutral-on-background-weak);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.18s;
          padding: 6px 0;
        }
        .project-back-link:hover { color: var(--neutral-on-background-strong); }
        .project-date-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--neutral-on-background-weak);
          background: var(--neutral-alpha-weak);
          border: 1px solid var(--neutral-alpha-medium);
          padding: 4px 12px;
          border-radius: 99px;
        }
        .project-title {
          font-size: clamp(1.75rem, 5vw, 2.6rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          text-align: center;
          color: var(--neutral-on-background-strong);
        }
        .project-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          align-items: center;
        }
        .project-category-chip {
          padding: 4px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: 1px solid;
        }
        .project-tool-chip {
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.06);
          letter-spacing: 0.01em;
        }
        .project-cta-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          padding: 4px 0;
        }
        .project-section-divider {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          border: none;
          border-top: 1px solid var(--neutral-alpha-weak);
        }
        .project-media-wrapper {
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
        }
        .project-content-wrapper {
          width: 100%;
          max-width: 660px;
          margin: 0 auto;
        }
        .project-related-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          padding-top: 16px;
        }
        .project-related-title {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--neutral-on-background-strong);
          text-align: center;
        }
        @media (max-width: 600px) {
          .project-title { font-size: 1.65rem; }
          .project-media-wrapper { max-width: 100%; }
          .project-content-wrapper { max-width: 100%; }
        }
      `}</style>

      <Column as="section" maxWidth="m" horizontal="center" gap="xl">
        <Schema
          as="blogPosting"
          baseURL={baseURL}
          path={`/project/${project.slug}`}
          title={project.title_id}
          description={project.description_id}
          datePublished={project.created_at}
          dateModified={project.updated_at}
          image={thumbClean || `/api/og/generate?title=${encodeURIComponent(project.title_id)}`}
          author={{
            name: person.name,
            url: `${baseURL}${about.path}`,
            image: `${baseURL}${person.avatar}`,
          }}
        />

        {/* Track view */}
        <ProjectViewTracker projectId={project.id} />

        {/* ── Hero Header ─────────────────────────────────────── */}
        <div className="project-hero-meta">
          {/* Back */}
          <a href="/work" className="project-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <T id="Kembali ke Projects" en="Back to Projects" />
          </a>

          {/* Date badge */}
          <span className="project-date-badge">
            <LocalizedDate value={project.created_at} />
          </span>

          {/* Title */}
          <h1 className="project-title"><T id={project.title_id} en={project.title_en || project.title_id} /></h1>

          {/* Category + tools */}
          <div className="project-tags-row">
            {project.category && catStyle && (
              <span
                className="project-category-chip"
                style={{ background: catStyle.bg, color: catStyle.color, borderColor: catStyle.border }}
              >
                {project.category}
              </span>
            )}
            {tools.map((tool) => {
              const ts = TOOL_COLORS[tool] ?? { bg: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)" };
              return (
                <span key={tool} className="project-tool-chip" style={{ background: ts.bg, color: ts.color }}>
                  {tool}
                </span>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="project-cta-bar">
            {project.live_demo_url && (
              <Button href={project.live_demo_url} target="_blank" variant="primary" size="m" prefixIcon="link">
                Live Demo
              </Button>
            )}
            {attachClean && attachType !== "image" && (
              <Button href={attachClean} target="_blank" variant="secondary" size="m" prefixIcon="download">
                <T id={attachType === "pdf" ? "Lihat PDF" : attachType === "video" ? "Lihat Video" : "Unduh File"} en={attachType === "pdf" ? "View PDF" : attachType === "video" ? "View Video" : "Download File"} />
              </Button>
            )}
            <ShareButton
              title={project.title_id}
              description={project.description_id}
              ogImageUrl={thumbClean || undefined}
            />
          </div>
        </div>

        {/* ── Media Gallery ────────────────────────────────────── */}
        <div className="project-media-wrapper">
          <ProjectGalleryInline
            thumbnail={thumbClean}
            attachment={attachClean}
            gallery={project.gallery?.filter(Boolean) ?? []}
            title={project.title_id}
            displayMode={project.gallery_display_mode ?? "slider"}
          />
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="project-content-wrapper">
          <ProjectContent project={project} />
        </div>

        {/* ── Related Projects ─────────────────────────────────── */}
        <div className="project-related-section">
          <hr className="project-section-divider" />
          <h2 className="project-related-title"><T id="Proyek Terkait" en="Related Projects" /></h2>
          <RelatedProjectsCarousel excludeSlug={project.slug} />
        </div>

        <ScrollToHash />
      </Column>
    </>
  );
}
