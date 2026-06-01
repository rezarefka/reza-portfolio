import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Project – Reza Control" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();

  if (!project) notFound();

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Edit Project</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {project.title_id}
        </Text>
      </Column>
      <ProjectForm project={project} />
    </Column>
  );
}
