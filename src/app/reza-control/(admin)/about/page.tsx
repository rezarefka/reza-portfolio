import { Column, Row, Heading, Text, Card } from "@once-ui-system/core";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About CMS – Reza Control" };

const icons = {
  intro: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  education: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  experience: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <path d="M2 12h20"/>
    </svg>
  ),
  skills: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  organizations: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
};

const sections = [
  { href: "/reza-control/about/intro",        icon: icons.intro,         label: "Tentang Saya",    desc: "Teks perkenalan & bio halaman About" },
  { href: "/reza-control/about/education",     icon: icons.education,     label: "Pendidikan",       desc: "Universitas, jurusan, logo kampus" },
  { href: "/reza-control/about/experience",    icon: icons.experience,    label: "Pengalaman Kerja", desc: "Riwayat pekerjaan dan pencapaian" },
  { href: "/reza-control/about/skills",        icon: icons.skills,        label: "Keahlian Teknis",  desc: "Skill dan teknologi yang dikuasai" },
  { href: "/reza-control/about/organizations", icon: icons.organizations, label: "Organisasi",       desc: "Organisasi dan komunitas yang diikuti" },
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
            <Column gap="12">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--brand-alpha-weak)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--brand-on-background-strong)",
              }}>
                {s.icon}
              </div>
              <Column gap="4">
                <Text variant="heading-strong-m">{s.label}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">{s.desc}</Text>
              </Column>
            </Column>
          </Card>
        ))}
      </Row>
    </Column>
  );
}
