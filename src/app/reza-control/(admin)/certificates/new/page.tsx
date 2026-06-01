import { Column, Heading, Text } from "@once-ui-system/core";
import { CertificateForm } from "@/components/admin/CertificateForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Certificate – Reza Control" };

export default function NewCertificatePage() {
  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">New Certificate</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">Tambah sertifikat baru.</Text>
      </Column>
      <CertificateForm />
    </Column>
  );
}
