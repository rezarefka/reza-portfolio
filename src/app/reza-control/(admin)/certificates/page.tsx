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
    <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
      <Column fillWidth gap="xl">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          width: "100%",
        }}>
          <Column gap="4">
            <Heading variant="display-strong-m">Certificates</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {certs?.length ?? 0} sertifikat
            </Text>
          </Column>
          <Button href="/reza-control/certificates/new" variant="primary" size="m" prefixIcon="plus">
            New Certificate
          </Button>
        </div>

        <Column gap="8" fillWidth>
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
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  minWidth: 0,
                }}>
                  {cert.thumbnail && (
                    <img
                      src={cert.thumbnail}
                      alt={cert.title_id}
                      style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <Text variant="heading-strong-m" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cert.title_id}
                    </Text>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <Text variant="body-default-xs" onBackground="brand-weak">{cert.issuer}</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {cert.issue_date ? format(new Date(cert.issue_date), "MMMM yyyy") : "—"}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </Column>
      </Column>
    </div>
  );
}
