import { Column, Row, Heading, Text, Button, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects – Reza Control" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Column fillWidth gap="xl">
      <Row fillWidth horizontal="between" vertical="center">
        <Column gap="4">
          <Heading variant="display-strong-m">Projects</Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {projects?.length ?? 0} total projects
          </Text>
        </Column>
        <Button href="/reza-control/projects/new" variant="primary" size="m" prefixIcon="plus">
          New Project
        </Button>
      </Row>

      <Column gap="8">
        {!projects || projects.length === 0 ? (
          <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="m">
            <Column gap="m" horizontal="center" align="center">
              <Text style={{ fontSize: "48px" }}>🗂️</Text>
              <Text variant="heading-strong-m">Belum ada project</Text>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Buat project pertamamu sekarang.
              </Text>
              <Button href="/reza-control/projects/new" variant="primary" size="m">
                Buat Project
              </Button>
            </Column>
          </Card>
        ) : (
          projects.map((project) => (
            <Card
              key={project.id}
              href={`/reza-control/projects/${project.id}`}
              fillWidth
              border="neutral-alpha-weak"
              background="surface"
              padding="m"
              radius="m"
              transition="micro-medium"
            >
              <Row fillWidth gap="m" vertical="center">
                {project.thumbnail && (
                  <img
                    src={project.thumbnail}
                    alt={project.title_id}
                    style={{
                      width: 80,
                      height: 52,
                      objectFit: "cover",
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Column flex={1} gap="4">
                  <Row gap="8" vertical="center">
                    <Text variant="heading-strong-m">{project.title_id}</Text>
                    {project.featured && (
                      <Text
                        variant="label-strong-xs"
                        onBackground="accent-weak"
                        style={{
                          background: "var(--accent-alpha-weak)",
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        Featured
                      </Text>
                    )}
                  </Row>
                  <Row gap="12">
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {project.category}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {format(new Date(project.created_at), "d MMM yyyy")}
                    </Text>
                  </Row>
                </Column>
                <Text
                  variant="label-strong-xs"
                  onBackground={project.published ? "brand-weak" : "neutral-weak"}
                  style={{
                    background: project.published
                      ? "var(--brand-alpha-weak)"
                      : "var(--neutral-alpha-weak)",
                    padding: "4px 12px",
                    borderRadius: 99,
                    flexShrink: 0,
                  }}
                >
                  {project.published ? "Published" : "Draft"}
                </Text>
              </Row>
            </Card>
          ))
        )}
      </Column>
    </Column>
  );
}
