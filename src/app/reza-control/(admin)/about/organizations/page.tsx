import { Column, Row, Heading, Button } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { OrganizationsClient } from "@/components/admin/about/OrganizationsClient";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Organisasi – Reza Control" };
export default async function OrganizationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("about_organizations").select("*").order("sort_order");
  return (
    <Column fillWidth gap="xl">
      <Row gap="8" vertical="center">
        <Button href="/reza-control/about" variant="tertiary" size="s" prefixIcon="chevronLeft">Back</Button>
        <Heading variant="display-strong-m">🏛️ Organisasi</Heading>
      </Row>
      <OrganizationsClient initialData={data ?? []} />
    </Column>
  );
}
