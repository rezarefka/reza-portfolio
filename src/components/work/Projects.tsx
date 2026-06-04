import { Column } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import { getPublishedProjects } from "@/lib/db";
import { getPosts } from "@/utils/utils";

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
      <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
        {displayed.map((project, index) => {
          // Build images array: thumbnail first, then gallery extras
          const thumbClean = project.thumbnail ?? "";
          const images: string[] = [];
          if (thumbClean) images.push(thumbClean);
          if (project.gallery?.length > 0) {
            project.gallery.forEach((g) => {
              const gc = g ?? "";
              if (gc && !images.includes(gc)) images.push(gc);
            });
          }

          return (
            <ProjectCard
              priority={index < 2}
              key={project.slug}
              href={`/project/${project.slug}`}
              images={images}
              title={project.title_id}
              description={project.description_id}
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
      </Column>
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
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
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
    </Column>
  );
}
