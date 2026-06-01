import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Project – Reza Control" };

export default function NewProjectPage() {
  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">New Project</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Tambah project baru ke portfolio.
        </Text>
      </Column>
      <ProjectForm />
    </Column>
  );
}
