import { Column, Heading, Text } from "@once-ui-system/core";
import { CertificateForm } from "@/components/admin/CertificateForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Certificate – Reza Control" };

export default async function EditCertificatePage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cert } = await supabase.from("certificates").select("*").eq("id", id).single();
  if (!cert) notFound();

  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">Edit Certificate</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">{cert.title_id}</Text>
      </Column>
      <CertificateForm certificate={cert} />
    </Column>
  );
}
