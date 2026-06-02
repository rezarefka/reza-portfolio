import { Column, Row, Heading, Text, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { ExperienceClient } from "@/components/admin/about/ExperienceClient";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Pengalaman – Reza Control" };

export default async function ExperiencePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("about_experiences").select("*").order("sort_order");
  return (
    <Column fillWidth gap="xl">
      <Row gap="8" vertical="center">
        <Button href="/reza-control/about" variant="tertiary" size="s" prefixIcon="chevronLeft">Back</Button>
        <Heading variant="display-strong-m">💼 Pengalaman Kerja</Heading>
      </Row>
      <ExperienceClient initialData={data ?? []} />
    </Column>
  );
}
