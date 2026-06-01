import { Column, Heading, Text } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { AccountClient } from "@/components/admin/AccountClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account – Reza Control" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Account</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Kelola akun admin Anda.
        </Text>
      </Column>
      <AccountClient user={user} />
    </Column>
  );
}
