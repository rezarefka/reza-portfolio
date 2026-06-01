import { Column, Row, Heading, Text, Button, Card } from "@once-ui-system/core";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Certificates – Reza Control" };

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: certs } = await supabase
    .from("certificates")
    .select("*")
    .order("issue_date", { ascending: false });

  return (
    <Column fillWidth gap="xl">
      <Row fillWidth horizontal="between" vertical="center">
        <Column gap="4">
          <Heading variant="display-strong-m">Certificates</Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {certs?.length ?? 0} sertifikat
          </Text>
        </Column>
        <Button href="/reza-control/certificates/new" variant="primary" size="m" prefixIcon="plus">
          New Certificate
        </Button>
      </Row>

      <Column gap="8">
        {!certs || certs.length === 0 ? (
          <Card border="neutral-alpha-weak" background="surface" padding="xl" radius="m">
            <Column gap="m" horizontal="center" align="center">
              <Text style={{ fontSize: "48px" }}>🏆</Text>
              <Text variant="heading-strong-m">Belum ada sertifikat</Text>
              <Button href="/reza-control/certificates/new" variant="primary" size="m">
                Tambah Sertifikat
              </Button>
            </Column>
          </Card>
        ) : (
          certs.map((cert) => (
            <Card
              key={cert.id}
              href={`/reza-control/certificates/${cert.id}`}
              fillWidth
              border="neutral-alpha-weak"
              background="surface"
              padding="m"
              radius="m"
              transition="micro-medium"
            >
              <Row fillWidth gap="m" vertical="center">
                {cert.thumbnail && (
                  <img
                    src={cert.thumbnail}
                    alt={cert.title_id}
                    style={{ width: 80, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  />
                )}
                <Column flex={1} gap="4">
                  <Text variant="heading-strong-m">{cert.title_id}</Text>
                  <Row gap="12">
                    <Text variant="body-default-xs" onBackground="brand-weak">{cert.issuer}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {format(new Date(cert.issue_date), "MMMM yyyy")}
                    </Text>
                  </Row>
                </Column>
              </Row>
            </Card>
          ))
        )}
      </Column>
    </Column>
  );
}
