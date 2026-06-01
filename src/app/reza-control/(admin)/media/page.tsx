import { Column, Heading, Text } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Media – Reza Control" };

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Media Library</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {media?.length ?? 0} file tersimpan
        </Text>
      </Column>
      <MediaLibraryClient initialMedia={media ?? []} />
    </Column>
  );
}
