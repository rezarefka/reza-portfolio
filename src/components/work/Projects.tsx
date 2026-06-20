import { ProjectCard } from "@/components";
import { getPublishedProjects } from "@/lib/db";
import { getPosts } from "@/utils/utils";
import { ProjectsWithAnimation } from "./ProjectsWithAnimation";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export async function Projects({ range, exclude }: ProjectsProps) {
  // Try CMS first
  let supabaseProjects = await getPublishedProjects().catch(() => []);

  if (supabaseProjects.length > 0) {
    let projects = supabaseProjects;

    if (exclude && exclude.length > 0) {
      projects = projects.filter((p) => !exclude.includes(p.slug));
    }

    const displayed = range
      ? projects.slice(range[0] - 1, range[1] ?? projects.length)
      : projects;

    return (
      <ProjectsWithAnimation>
        {displayed.map((project, index) => {
          const thumbClean = project.thumbnail ?? "";
          const images: string[] = [];
          if (thumbClean) images.push(thumbClean);
          if (project.gallery?.length > 0) {
            project.gallery.forEach((g) => {
              // g is GalleryItem { url, caption, sort_order }
              const gc = (typeof g === "string" ? g : g.url) ?? "";
              if (gc && !images.includes(gc)) images.push(gc);
            });
          }

          return (
            <ProjectCard
              priority={index < 2}
              key={project.slug}
              href={`/project/${project.slug}`}
              images={images}
              thumbnail={thumbClean}
              title={project.title_id}
              titleEn={project.title_en}
              description={project.description_id}
              descriptionEn={project.description_en}
              content=""
              avatars={[]}
              link={project.live_demo_url || ""}
              tools={project.tools ?? []}
              category={project.category}
              attachment={project.attachment}
              slug={project.slug}
            />
          );
        })}
      </ProjectsWithAnimation>
    );
  }

  // Fallback to MDX
  let allProjects = getPosts(["src", "app", "work", "projects"]);

  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <ProjectsWithAnimation>
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={post.metadata.team?.map((member) => ({ src: member.avatar })) || []}
          link={post.metadata.link || ""}
          tools={[]}
        />
      ))}
    </ProjectsWithAnimation>
  );
}
