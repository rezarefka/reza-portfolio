import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/db";
import { GalleryViewer } from "@/components/cms/GalleryViewer";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `Galeri — ${project.title_id}`,
    description: project.description_id,
  };
}

export default async function ProjectGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // Collect all media: thumbnail + gallery + attachment
  const clean = (url: string) => url.split("?")[0];

  const mediaItems: { url: string; type: "image" | "video" | "pdf" }[] = [];

  const detectType = (url: string): "image" | "video" | "pdf" => {
    const u = url.split("?")[0].toLowerCase();
    if (/\.(mp4|webm|mov|ogg)$/.test(u)) return "video";
    if (/\.pdf$/.test(u)) return "pdf";
    return "image";
  };

  if (project.thumbnail) {
    mediaItems.push({ url: clean(project.thumbnail), type: detectType(project.thumbnail) });
  }
  if (project.gallery?.length > 0) {
    project.gallery.forEach((g) => {
      const c = clean(g);
      if (c && !mediaItems.find((m) => m.url === c)) {
        mediaItems.push({ url: c, type: detectType(c) });
      }
    });
  }
  if (project.attachment) {
    const c = clean(project.attachment);
    if (c && !mediaItems.find((m) => m.url === c)) {
      mediaItems.push({ url: c, type: detectType(c) });
    }
  }

  return (
    <GalleryViewer
      title={project.title_id}
      slug={slug}
      items={mediaItems}
    />
  );
}
