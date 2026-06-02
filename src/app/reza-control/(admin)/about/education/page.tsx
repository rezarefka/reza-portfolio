import { Column, Heading, Text, Button, Card, Row } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { EducationClient } from "@/components/admin/about/EducationClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pendidikan – Reza Control" };

export default async function EducationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_education")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <Column fillWidth gap="xl">
      <Row fillWidth horizontal="between" vertical="center" wrap gap="m">
        <Column gap="4">
          <Row gap="8" vertical="center">
            <Button href="/reza-control/about" variant="tertiary" size="s" prefixIcon="chevronLeft">
              Back
            </Button>
            <Heading variant="display-strong-m">🎓 Pendidikan</Heading>
          </Row>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Kelola riwayat pendidikan — universitas, fakultas, jurusan, logo kampus.
          </Text>
        </Column>
      </Row>
      <EducationClient initialData={data ?? []} />
    </Column>
  );
}
