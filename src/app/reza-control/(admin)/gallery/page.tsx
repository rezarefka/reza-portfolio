import { Column, Heading, Text } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { GalleryClient } from "@/components/admin/GalleryClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gallery – Reza Control" };

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Gallery</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {photos?.length ?? 0} foto tersimpan · Upload, edit caption, atau hapus foto galeri
        </Text>
      </Column>
      <GalleryClient initialPhotos={photos ?? []} />
    </Column>
  );
}
