import { Column, Heading, Text } from "@once-ui-system/core";
import { BlogForm } from "@/components/admin/BlogForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Post – Reza Control" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: blog } = await supabase.from("blogs").select("*").eq("id", id).single();
  if (!blog) notFound();

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Edit Blog Post</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">{blog.title_id}</Text>
      </Column>
      <BlogForm blog={blog} />
    </Column>
  );
}
