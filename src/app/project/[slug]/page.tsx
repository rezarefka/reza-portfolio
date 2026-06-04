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
import { Projects } from "@/components/work/Projects";
import { ScrollToHash } from "@/components";
import { ProjectContent } from "@/components/cms/ProjectContent";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ProjectMediaPreview } from "@/components/cms/ProjectMediaPreview";

export async function generateStaticParams() {
  const projects = await getPublishedProjects().catch(() => []);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return Meta.generate({
    title: project.title_id,
    description: project.description_id,
    baseURL,
    image: project.thumbnail?.split("?")[0] || `/api/og/generate?title=${project.title_id}`,
    path: `/project/${project.slug}`,
  });
}

// Detect media type helper
function getMediaType(url: string): "image" | "video" | "pdf" | null {
  if (!url) return null;
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|ogg)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(clean)) return "image";
  return "image"; // default for Supabase URLs
}

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

  const TOOL_COLORS: Record<string, { bg: string; color: string }> = {
    "React":      { bg: "rgba(97,218,251,0.12)", color: "#61dafb" },
    "Next.js":    { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" },
    "TypeScript": { bg: "rgba(49,120,198,0.15)", color: "#3178c6" },
    "Python":     { bg: "rgba(55,118,171,0.15)", color: "#3776ab" },
    "Figma":      { bg: "rgba(162,89,255,0.15)", color: "#a259ff" },
    "Supabase":   { bg: "rgba(62,207,142,0.12)", color: "#3ecf8e" },
    "Tailwind":   { bg: "rgba(56,189,248,0.12)", color: "#38bdf8" },
    "Flutter":    { bg: "rgba(84,197,248,0.12)", color: "#54c5f8" },
    "Laravel":    { bg: "rgba(255,45,32,0.12)", color: "#ff2d20" },
    "Node.js":    { bg: "rgba(83,158,67,0.15)", color: "#53a743" },
  };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
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

      {/* ── Breadcrumb + Header ──────────────────────────────────── */}
      <Column maxWidth="s" gap="12" horizontal="center" align="center">
        <SmartLink href="/work">
          <Text variant="label-strong-m">← Kembali ke Projects</Text>
        </SmartLink>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {format(new Date(project.created_at), "d MMMM yyyy", { locale: localeId })}
        </Text>
        <Heading variant="display-strong-m" style={{ textAlign: "center", lineHeight: 1.2 }}>
          {project.title_id}
        </Heading>

        {/* Category + tools */}
        <Row gap="8" wrap horizontal="center">
          {project.category && (
            <span style={{
              padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              background: "var(--brand-alpha-weak)", color: "var(--brand-on-background-strong)",
              border: "1px solid var(--brand-alpha-medium)", letterSpacing: "0.03em",
            }}>
              {project.category}
            </span>
          )}
        </Row>

        {/* Tools chips */}
        {tools.length > 0 && (
          <Row gap="8" wrap horizontal="center" paddingTop="4">
            {tools.map((tool) => {
              const ts = TOOL_COLORS[tool] ?? { bg: "var(--neutral-alpha-weak)", color: "var(--neutral-on-background-weak)" };
              return (
                <span key={tool} style={{
                  padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: ts.bg, color: ts.color,
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  {tool}
                </span>
              );
            })}
          </Row>
        )}
      </Column>

      {/* ── CTA Buttons ─────────────────────────────────────────── */}
      {(project.live_demo_url || attachClean) && (
        <Row gap="12" horizontal="center" wrap>
          {project.live_demo_url && (
            <Button href={project.live_demo_url} target="_blank" variant="primary" size="m" prefixIcon="link">
              Live Demo
            </Button>
          )}
          {attachClean && attachType !== "image" && (
            <Button href={attachClean} target="_blank" variant="secondary" size="m" prefixIcon="download">
              {attachType === "pdf" ? "Lihat PDF" : attachType === "video" ? "Lihat Video" : "Unduh File"}
            </Button>
          )}
        </Row>
      )}

      {/* ── Media Preview ─────────────────────────────────────────
          Priority: attachment (video/pdf/image) → thumbnail
      ─────────────────────────────────────────────────────────── */}
      <ProjectMediaPreview
        thumbnail={thumbClean}
        attachment={attachClean}
        title={project.title_id}
        gallery={project.gallery?.map((g) => g.split("?")[0]).filter(Boolean) ?? []}
      />

      {/* ── Content ──────────────────────────────────────────────── */}
      <ProjectContent project={project} />

      {/* ── Related projects ─────────────────────────────────────── */}
      <Column fillWidth gap="40" horizontal="center" marginTop="40">
        <Line maxWidth="40" />
        <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
          Proyek Terkait
        </Heading>
        <Projects exclude={[project.slug]} range={[1, 2]} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
