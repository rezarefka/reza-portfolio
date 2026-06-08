import { Column, Heading, Text, Button, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blogs – Reza Control" };

export default async function BlogsPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
      <Column fillWidth gap="xl">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          width: "100%",
        }}>
          <Column gap="4">
            <Heading variant="display-strong-m">Blog Posts</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {blogs?.length ?? 0} artikel
            </Text>
          </Column>
          <Button href="/reza-control/blogs/new" variant="primary" size="m" prefixIcon="plus">
            New Post
          </Button>
        </div>

        <Column gap="8" fillWidth>
          {!blogs || blogs.length === 0 ? (
            <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="m">
              <Column gap="m" horizontal="center" align="center">
                <Text style={{ fontSize: "48px" }}>📝</Text>
                <Text variant="heading-strong-m">Belum ada artikel</Text>
                <Button href="/reza-control/blogs/new" variant="primary" size="m">Tulis Artikel</Button>
              </Column>
            </Card>
          ) : (
            blogs.map((blog) => (
              <Card
                key={blog.id}
                href={`/reza-control/blogs/${blog.id}`}
                fillWidth
                border="neutral-alpha-weak"
                background="surface"
                padding="m"
                radius="m"
                transition="micro-medium"
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  minWidth: 0,
                }}>
                  {blog.thumbnail && (
                    <img
                      src={blog.thumbnail}
                      alt={blog.title_id}
                      style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <Text
                      variant="heading-strong-m"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {blog.title_id}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {format(new Date(blog.created_at), "d MMM yyyy")}
                    </Text>
                  </div>
                  <Text
                    variant="label-strong-xs"
                    onBackground={blog.published ? "brand-weak" : "neutral-weak"}
                    style={{
                      background: blog.published ? "var(--brand-alpha-weak)" : "var(--neutral-alpha-weak)",
                      padding: "4px 12px",
                      borderRadius: 99,
                      flexShrink: 0,
                    }}
                  >
                    {blog.published ? "Published" : "Draft"}
                  </Text>
                </div>
              </Card>
            ))
          )}
        </Column>
      </Column>
    </div>
  );
}
