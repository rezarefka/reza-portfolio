import { Column, Row, Heading, Text, Button, Card } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About CMS – Reza Control" };

const sections = [
  { href: "/reza-control/about/education",     icon: "🎓", label: "Pendidikan",       desc: "Universitas, jurusan, logo kampus" },
  { href: "/reza-control/about/experience",    icon: "💼", label: "Pengalaman Kerja", desc: "Riwayat pekerjaan dan pencapaian" },
  { href: "/reza-control/about/skills",        icon: "⚡", label: "Keahlian Teknis",  desc: "Skill dan teknologi yang dikuasai" },
  { href: "/reza-control/about/organizations", icon: "🏛️", label: "Organisasi",       desc: "Organisasi dan komunitas yang diikuti" },
];

export default function AboutCmsPage() {
  return (
    <Column fillWidth gap="xl">
      <Column gap="4">
        <Heading variant="display-strong-m">About CMS</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Kelola semua konten halaman About dari sini.
        </Text>
      </Column>
      <Row gap="m" wrap>
        {sections.map((s) => (
          <Card key={s.href} href={s.href} border="neutral-alpha-weak" background="surface"
            radius="l" padding="l" transition="micro-medium"
            style={{ flex: "1 1 200px", minWidth: 160 }}>
            <Column gap="8">
              <Text style={{ fontSize: 32 }}>{s.icon}</Text>
              <Text variant="heading-strong-m">{s.label}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">{s.desc}</Text>
            </Column>
          </Card>
        ))}
      </Row>
    </Column>
  );
}
