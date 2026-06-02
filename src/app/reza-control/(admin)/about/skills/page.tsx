import { Column, Row, Heading, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { SkillsClient } from "@/components/admin/about/SkillsClient";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Keahlian – Reza Control" };
export default async function SkillsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("about_skills").select("*").order("sort_order");
  return (
    <Column fillWidth gap="xl">
      <Row gap="8" vertical="center">
        <Button href="/reza-control/about" variant="tertiary" size="s" prefixIcon="chevronLeft">Back</Button>
        <Heading variant="display-strong-m">⚡ Keahlian Teknis</Heading>
      </Row>
      <SkillsClient initialData={data ?? []} />
    </Column>
  );
}
