import { Column, Heading, Text } from "@once-ui-system/core";
import { BlogForm } from "@/components/admin/BlogForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Post – Reza Control" };

export default function NewBlogPage() {
  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">New Blog Post</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">Tulis artikel baru.</Text>
      </Column>
      <BlogForm />
    </Column>
  );
}
