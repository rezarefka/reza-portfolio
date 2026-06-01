import { Column, Heading, Text } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings – Reza Control" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Settings</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Konfigurasi website dan konten hero.
        </Text>
      </Column>
      <SettingsForm settings={settings} />
    </Column>
  );
}
