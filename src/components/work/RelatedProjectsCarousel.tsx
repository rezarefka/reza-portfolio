import { getPublishedProjects } from "@/lib/db";
import { RelatedCarouselClient } from "./RelatedCarouselClient";

interface RelatedProjectsCarouselProps {
  excludeSlug: string;
}

export async function RelatedProjectsCarousel({ excludeSlug }: RelatedProjectsCarouselProps) {
  let projects = await getPublishedProjects().catch(() => []);

  // Exclude current project
  projects = projects.filter((p) => p.slug !== excludeSlug);

  if (projects.length === 0) return null;

  // Pass minimal data to client
  const items = projects.map((p) => ({
    slug: p.slug,
    title: p.title_id,
    description: p.description_id,
    thumbnail: p.thumbnail ? p.thumbnail.split("?")[0] : "",
    category: p.category ?? "",
    tools: p.tools ?? [],
  }));

  return <RelatedCarouselClient items={items} />;
}
